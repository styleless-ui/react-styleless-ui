import * as React from "react";
import { disableUserSelectCSSProperties, logger } from "../../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../../types";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  useDeterministicId,
  useForkedRefs,
} from "../../../utils";
import { CollapseSubMenuEvent, ExpandSubMenuEvent } from "../../constants";
import { ItemRoot as ItemRootSlot } from "../../slots";
import { useBaseItem } from "../../utils";
import type { Props as SubMenuProps } from "../SubMenu";
import { MenuItemContext } from "./context";

export type RenderProps = {
  /**
   * The `active` state of the component.
   * An item is active if it's hovered by a pointer or visually
   * focused by keyboard interactions.
   */
  active: boolean;
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * Determines whether it is expandable or not.
   */
  expandable: boolean;
  /**
   * The `expanded` state of the component.
   */
  expanded: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * The sub-tree of the component.
   * If provided, this item will be expandable.
   */
  subMenu?: React.ReactElement<SubMenuProps>;
  /**
   * If `true`, the item will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback is fired when the item is selected.
   */
  onSelect?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const ItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    subMenu,
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    style: styleProp,
    disabled = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onSelect,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-item");
  const value = id;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const [isExpanded, setIsExpanded] = React.useState(false);

  const isExpandable = Boolean(subMenu);
  const expanded = isExpandable && isExpanded;

  const baseItem = useBaseItem({
    disabled,
    entityName: value,
    type: isExpandable ? "expandable-item" : "non-expandable-item",
    onClick: event => {
      onSelect?.(event);
      onClick?.(event);
    },
    onMouseEnter: event => {
      if (isExpandable && !expanded) setIsExpanded(true);

      onMouseEnter?.(event);
    },
    onMouseLeave: event => {
      if (isExpandable && expanded) setIsExpanded(false);

      onMouseLeave?.(event);
    },
  });

  const refCallback = React.useCallback((node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;

    const accessibleName = computeAccessibleName(node);

    if (!accessibleName) {
      logger(
        [
          "Can't determine an accessible name.",
          "It's mandatory to provide an accessible name for the component. " +
            "Possible accessible names:",
          ". Set `aria-label` attribute.",
          ". Set `title` attribute.",
          ". Use an informative content.",
        ].join("\n"),
        { scope: "Menu.Item", type: "error" },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (baseItem.isInvalid) return;
    if (!rootRef.current) return;

    const handleExpandSubMenu = () => {
      setIsExpanded(true);
    };

    const handleCollapseSubMenu = () => {
      setIsExpanded(false);
    };

    const node = rootRef.current;

    node.addEventListener(ExpandSubMenuEvent.type, handleExpandSubMenu);
    node.addEventListener(CollapseSubMenuEvent.type, handleCollapseSubMenu);

    return () => {
      node.removeEventListener(ExpandSubMenuEvent.type, handleExpandSubMenu);
      node.removeEventListener(
        CollapseSubMenuEvent.type,
        handleCollapseSubMenu,
      );
    };
  }, [baseItem.isInvalid]);

  if (baseItem.isInvalid) return null;

  const renderProps: RenderProps = {
    disabled,
    active: baseItem.isActive,
    expanded: isExpanded,
    expandable: isExpandable,
  };

  const classNameProps: ClassNameProps = renderProps;

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    ...disableUserSelectCSSProperties,
  };

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      onClick={baseItem.handleClick}
      onMouseEnter={baseItem.handleMouseEnter}
      onMouseLeave={baseItem.handleMouseLeave}
      style={style}
      tabIndex={-1}
      role="menuitem"
      aria-disabled={disabled}
      aria-expanded={isExpandable ? expanded : undefined}
      aria-haspopup={isExpandable ? "menu" : undefined}
      data-slot={ItemRootSlot}
      data-entityname={value}
      data-expandable={String(isExpandable)}
      data-active={baseItem.isActive ? "" : undefined}
      data-expanded={expanded ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <MenuItemContext.Provider value={{ id, isExpanded: expanded }}>
        {children}
        {subMenu}
      </MenuItemContext.Provider>
    </div>
  );
};

const Item = componentWithForwardedRef(ItemBase, "Menu.Item");

export default Item;
