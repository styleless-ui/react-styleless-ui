import * as React from "react";
import { SystemError, SystemKeys } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  componentWithForwardedRef,
  contains,
  useControlledProp,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
  useJumpToChar,
} from "../utils";
import {
  LevelContext,
  SizeContext,
  TreeViewContext,
  type TreeViewContextValue,
} from "./contexts";
import { Root as RootSlot } from "./slots";
import { getCurrentFocusedElement, getValidChildren } from "./utils";

export type RenderProps = {
  /**
   * Determines whether items are selectable or not.
   */
  selectable: boolean;
  /**
   * The select mode of the items.
   * Will be `undefined` if not selectable.
   */
  selectMode: "multi-select" | "single-select" | undefined;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The selectability behavior of the component.
   * If `false`, items won't be selectable.
   * If `single-select`, you would be able to select only a single item.
   * If `multi-select`, you would be able to select multiple items.
   */
  selectability: false | "single-select" | "multi-select";
  /**
   * The expanded items of the select.
   */
  expandedDescendants?: string[];
  /**
   * The default expanded items.
   * Use when the component's `expandedDescendants` prop is not controlled.
   */
  defaultExpandedDescendants?: string[];
  /**
   * The selected items of the select.
   */
  selectedDescendants?: string[];
  /**
   * The default selected items.
   * Use when the component's `selectedDescendants` prop is not controlled.
   */
  defaultSelectedDescendants?: string[];
  /**
   * Callback is called when `expanded` state of an expandable item changes.
   */
  onExpandStateChange?: (expanded: string[]) => void;
  /**
   * Callback is called when an item is selected.
   */
  onSelectStateChange?: (selected: string[]) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const TreeViewBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    className: classNameProp,
    children: childrenProp,
    selectedDescendants: selectedDescendantsProp,
    expandedDescendants: expandedDescendantsProp,
    defaultExpandedDescendants,
    defaultSelectedDescendants,
    selectability,
    onSelectStateChange,
    onExpandStateChange,
    onKeyDown,
    onFocus,
    onBlur,
    ...otherProps
  } = props;

  const isSelectable =
    typeof selectability === "string" &&
    (selectability === "multi-select" || selectability === "single-select");

  const isMultiSelect = isSelectable && selectability === "multi-select";
  const isSingleSelect = isSelectable && selectability === "single-select";

  if (
    (typeof selectedDescendantsProp !== "undefined" &&
      !Array.isArray(selectedDescendantsProp)) ||
    (typeof defaultSelectedDescendants !== "undefined" &&
      !Array.isArray(defaultSelectedDescendants))
  ) {
    throw new SystemError(
      "`selectedDescendants` and `defaultSelectedDescendants` must be an array.",
      "TreeView",
    );
  }

  if (
    isSingleSelect &&
    ((typeof selectedDescendantsProp !== "undefined" &&
      selectedDescendantsProp.length > 1) ||
      (typeof defaultSelectedDescendants !== "undefined" &&
        defaultSelectedDescendants.length > 1))
  ) {
    throw new SystemError(
      "`selectedDescendants` and `defaultSelectedDescendants` must be an array " +
        'containing only one value, when `selectability={"single-select"}`.',
      "TreeView",
    );
  }

  const id = useDeterministicId(idProp, "styleless-ui__treeview");

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const handleRootRef = useForkedRefs(rootRef, ref);

  const [selectedDescendants, setSelectedDescendants] = useControlledProp(
    selectedDescendantsProp,
    defaultSelectedDescendants,
    [],
  );

  const [expandedDescendants, setExpandedDescendants] = useControlledProp(
    expandedDescendantsProp,
    defaultExpandedDescendants,
    [],
  );

  const [activeElement, setActiveElement] = React.useState<HTMLElement | null>(
    null,
  );

  const getListItems = () => {
    const root = document.getElementById(id);

    if (!root) return [];

    return Array.from(root.querySelectorAll<HTMLElement>("[role='treeitem']"));
  };

  const jumpToChar = useJumpToChar({
    getListItems,
    activeDescendantElement: activeElement,
    onActiveDescendantElementChange: setActiveElement,
  });

  const emitSelectState = (selected: string[]) => {
    setSelectedDescendants(selected);
    onSelectStateChange?.(selected);
  };

  const emitExpandState = (expanded: string[]) => {
    setExpandedDescendants(expanded);
    onExpandStateChange?.(expanded);
  };

  const isDescendantExpanded = (descendant: string) =>
    expandedDescendants.some(v => v === descendant);

  const isDescendantSelected = (descendant: string) => {
    if (!isSelectable) return false;

    return selectedDescendants.some(v => v === descendant);
  };

  const handleFocusingElement = (collapsingDescendantEntity: string) => {
    if (!rootRef.current) return;
    if (!document.activeElement) return;

    const collapsingDescendantSubTree =
      rootRef.current.querySelector<HTMLElement>(
        `[data-for='${collapsingDescendantEntity}']`,
      );

    if (!collapsingDescendantSubTree) return;
    if (!contains(collapsingDescendantSubTree, document.activeElement)) return;

    rootRef.current.focus();
  };

  const handleDescendantExpand = (descendant: string) => {
    const newExpandState = expandedDescendants.concat(descendant);

    setExpandedDescendants(newExpandState);
    emitExpandState(newExpandState);
  };

  const handleDescendantCollapse = (descendant: string) => {
    const newExpandState = expandedDescendants.filter(e => e !== descendant);

    setExpandedDescendants(newExpandState);
    emitExpandState(newExpandState);

    handleFocusingElement(descendant);
  };

  const handleDescendantExpandToggle = (descendant: string) => {
    const isExpanded = isDescendantExpanded(descendant);

    if (isExpanded) handleDescendantCollapse(descendant);
    else handleDescendantExpand(descendant);
  };

  const handleDescendantSelect = (descendant: string) => {
    if (!isSelectable) return;

    let newSelected: string[];

    if (isMultiSelect) {
      const isSelected = isDescendantSelected(descendant);

      if (isSelected) {
        newSelected = selectedDescendants.filter(v => v !== descendant);
      } else {
        newSelected = selectedDescendants.concat(descendant);
      }
    } else if (selectedDescendants[0] !== descendant) {
      newSelected = [descendant];
    } else newSelected = selectedDescendants;

    emitSelectState(newSelected);
  };

  const handleKeyDown = useEventCallback<React.KeyboardEvent>(event => {
    const items = getListItems();

    const currentFocusedElement = getCurrentFocusedElement(
      items,
      activeElement,
      selectedDescendants,
    );

    if (currentFocusedElement) {
      switch (event.key) {
        case SystemKeys.HOME: {
          const item = items[0];

          setActiveElement(item ?? null);

          break;
        }

        case SystemKeys.END: {
          const item = items[items.length - 1];

          setActiveElement(item ?? null);

          break;
        }

        case SystemKeys.UP: {
          const { index } = currentFocusedElement;

          const nextIdx = (index - 1 + items.length) % items.length;
          const item = items[nextIdx];

          setActiveElement(item ?? null);

          break;
        }

        case SystemKeys.DOWN: {
          const { index } = currentFocusedElement;

          const nextIdx = (index + 1) % items.length;
          const item = items[nextIdx];

          setActiveElement(item ?? null);

          break;
        }

        case SystemKeys.RIGHT: {
          const { item } = currentFocusedElement;

          const isExpandable = item.getAttribute("data-expandable") === "true";

          if (!isExpandable) break;

          const descendant = item.getAttribute("data-entityname");

          if (!descendant) break;

          if (!isDescendantExpanded(descendant)) {
            handleDescendantExpand(descendant);

            break;
          }

          const firstDescendant =
            item.querySelector<HTMLElement>("[role='treeitem']");

          if (!firstDescendant) break;

          setActiveElement(firstDescendant);

          break;
        }

        case SystemKeys.LEFT: {
          const { item } = currentFocusedElement;

          const isExpandable = item.getAttribute("data-expandable") === "true";

          const descendant = item.getAttribute("data-entityname");

          if (!descendant) break;

          if (!isExpandable || !isDescendantExpanded(descendant)) {
            const parent =
              item.parentElement?.closest<HTMLElement>("[role='treeitem']");

            if (parent) setActiveElement(parent);

            break;
          }

          handleDescendantCollapse(descendant);

          break;
        }

        case SystemKeys.SPACE: {
          if (!isSelectable) break;

          const { item } = currentFocusedElement;

          const descendant = item.getAttribute("data-entityname");

          if (!descendant) break;

          handleDescendantSelect(descendant);

          break;
        }

        case SystemKeys.ENTER: {
          const { item } = currentFocusedElement;

          const isExpandable = item.getAttribute("data-expandable") === "true";

          if (!isExpandable) break;

          const descendant = item.getAttribute("data-entityname");

          if (!descendant) break;

          handleDescendantExpandToggle(descendant);

          break;
        }

        default: {
          jumpToChar(event as React.KeyboardEvent<HTMLElement>);

          break;
        }
      }
    }

    onKeyDown?.(event as React.KeyboardEvent<HTMLDivElement>);
  });

  const handleBlur = useEventCallback<React.FocusEvent>(event => {
    if (
      !event.relatedTarget ||
      (event.relatedTarget &&
        rootRef.current &&
        !contains(rootRef.current, event.relatedTarget))
    ) {
      setActiveElement(null);
    }

    onBlur?.(event as React.FocusEvent<HTMLDivElement>);
  });

  const handleFocus = useEventCallback<React.FocusEvent>(event => {
    if (!rootRef.current) {
      rootRef.current = event.currentTarget as HTMLDivElement;
    }

    if (event.target === rootRef.current && !activeElement) {
      const items = getListItems();

      const currentFocusedElement = getCurrentFocusedElement(
        items,
        null,
        selectedDescendants,
      );

      if (currentFocusedElement) setActiveElement(currentFocusedElement.item);
    }

    onFocus?.(event as React.FocusEvent<HTMLDivElement>);
  });

  const context: TreeViewContextValue = {
    activeElement,
    isSelectable,
    isMultiSelect,
    setActiveElement,
    isDescendantExpanded,
    isDescendantSelected,
    handleDescendantCollapse,
    handleDescendantExpand,
    handleDescendantExpandToggle,
    handleDescendantSelect,
  };

  const renderProps: RenderProps = {
    selectable: isSelectable,
    selectMode: isMultiSelect
      ? "multi-select"
      : isSingleSelect
      ? "single-select"
      : undefined,
  };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const { validChildren, sizeOfSet } = getValidChildren(children, "TreeView");

  return (
    <div
      {...otherProps}
      id={id}
      ref={handleRootRef}
      role="tree"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-multiselectable={isSelectable ? isMultiSelect : undefined}
      aria-activedescendant={activeElement?.id ?? undefined}
      data-slot={RootSlot}
      className={className}
    >
      <LevelContext.Provider value={1}>
        <SizeContext.Provider value={sizeOfSet}>
          <TreeViewContext.Provider value={context}>
            {validChildren}
          </TreeViewContext.Provider>
        </SizeContext.Provider>
      </LevelContext.Provider>
    </div>
  );
};

const TreeView = componentWithForwardedRef(TreeViewBase, "TreeView");

export default TreeView;
