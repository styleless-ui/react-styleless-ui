import * as React from "react";
import { SystemError, getLabelInfo, logger } from "../internals";
import type {
  ClassesWithRenderContext,
  MergeElementProps,
  PropWithRenderContext,
} from "../types";
import {
  componentWithForwardedRef,
  contains,
  setRef,
  useControlledProp,
  useDeterministicId,
  useElementsRegistry,
  useEventCallback,
  useEventListener,
  useHandleTargetLabelClick,
} from "../utils";
import { SelectContext, type SelectContextValue } from "./context";
import { Label as LabelSlot, Root as RootSlot } from "./slots";
import { noValueSelected } from "./utils";

export type RenderProps = {
  openState: boolean;
  disabled: boolean;
  hasSelectedValues: boolean;
  clearValues: <T extends HTMLElement>(event: React.MouseEvent<T>) => void;
};

export type ClassNameProps = {
  openState: boolean;
  disabled: boolean;
};

export type RegisteredElementsKeys =
  | "root"
  | "trigger"
  | "list"
  | "combobox"
  | "label";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  classes?: ClassesWithRenderContext<"root" | "label", ClassNameProps>;
  /**
   * The label of the component.
   */
  label:
    | string
    | {
        /**
         * The label to use as `aria-label` property.
         */
        screenReaderLabel: string;
      }
    | {
        /**
         * Identifies the element (or elements) that labels the component.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.\
   * It will be inherited by any descendant submenus respectively.
   * @default false
   */
  keepMounted?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  /**
   * Callback fired when a click interaction happens outside the component.
   */
  onOutsideClick?: (event: MouseEvent) => void;
} & (
  | {
      multiple: false;
      defaultValue?: string;
      value?: string;
      onValueChange?: (currentValue: string) => void;
    }
  | {
      multiple: true;
      defaultValue?: string[];
      value?: string[];
      onValueChange?: (currentValue: string[]) => void;
    }
);

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "className"
>;

const SelectBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    style: styleProp,
    id: idProp,
    classes: classesProp,
    children: childrenProp,
    keepMounted = false,
    disabled = false,
    searchable = false,
    multiple,
    defaultValue,
    value,
    defaultOpen,
    open,
    label,
    onOpen,
    onClose,
    onValueChange,
    onOutsideClick,
    ...otherProps
  } = props;

  if (
    multiple &&
    (typeof value === "string" || typeof defaultValue === "string")
  ) {
    throw new SystemError(
      "`value` and `defaultValue` must be array when `multiple={true}`.",
      "Select",
    );
  }

  const [isListOpen, setIsListOpen] = useControlledProp(
    open,
    defaultOpen,
    false,
  );

  const [selectedValues, setSelectedValues] = useControlledProp(
    value,
    defaultValue,
    multiple ? [] : "",
  );

  const valueLabelsMapRef = React.useRef(new Map<string, string>());

  const [activeDescendant, setActiveDescendant] =
    React.useState<HTMLElement | null>(null);

  const [filteredEntities, setFilteredEntities] = React.useState<
    null | string[]
  >(null);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const id = useDeterministicId(idProp, "styleless-ui__select");

  const visibleLabelId = `${id}__label`;

  const labelInfo = getLabelInfo(label, "Select");

  const openList = () => {
    setIsListOpen(true);

    onOpen?.();
  };

  const closeList = () => {
    setIsListOpen(false);
    setActiveDescendant(null);

    onClose?.();
  };

  const toggleList = () => {
    if (isListOpen) closeList();
    else openList();
  };

  const emitValueChange = (newValue: string | string[]) => {
    setSelectedValues(newValue);
    // @ts-expect-error It's fine!
    onValueChange?.(newValue);
  };

  const elementsRegistry = useElementsRegistry<RegisteredElementsKeys>();

  const handleOptionClick = (value: string) => {
    if (disabled) return;

    let newValue: string | string[];

    if (!multiple) {
      newValue = value;

      closeList();
    } else {
      const isSelected =
        (selectedValues as string[]).some(v => v === value) ?? false;

      if (isSelected) {
        newValue = (selectedValues as string[]).filter(v => v !== value);
      } else {
        newValue = (selectedValues as string[]).concat(value);
      }
    }

    emitValueChange(newValue);
  };

  const handleOptionRemove = (value: string) => {
    if (disabled) return;

    let newValue: string | string[];

    if (!multiple) newValue = "";
    else newValue = (selectedValues as string[]).filter(v => v !== value);

    emitValueChange(newValue);
  };

  const clearOptions = () => {
    if (disabled) return;

    let newValue: string | string[];

    if (!multiple) newValue = "";
    else newValue = [];

    emitValueChange(newValue);
  };

  const isAnyOptionSelected = !noValueSelected(selectedValues);

  const closeListAndMaintainFocus = () => {
    const comboboxId = elementsRegistry.getElementId("combobox");
    const comboboxNode = document.getElementById(comboboxId ?? "");

    comboboxNode?.focus();
    closeList();
  };

  const handleClearValues = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    closeListAndMaintainFocus();
    clearOptions();
  };

  const renderProps: RenderProps = {
    disabled,
    hasSelectedValues: isAnyOptionSelected,
    clearValues: handleClearValues,
    openState: isListOpen,
  };

  const classNameProps: ClassNameProps = {
    disabled,
    openState: isListOpen,
  };

  const classes =
    typeof classesProp === "function"
      ? classesProp(classNameProps)
      : classesProp;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);
    rootRef.current = node;
  };

  const renderLabel = () => {
    if (!labelInfo.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={LabelSlot}
        className={classes?.label}
      >
        {labelInfo.visibleLabel}
      </span>
    );
  };

  if (isListOpen && disabled) {
    logger("You can't have an opened select menu when `disabled={true}`.", {
      scope: "Select",
      type: "warn",
    });

    closeList();
  }

  const context: SelectContextValue = {
    disabled,
    isListOpen,
    multiple,
    searchable,
    keepMounted,
    activeDescendant,
    selectedValues,
    elementsRegistry,
    labelInfo,
    valueLabelsMapRef,
    isAnyOptionSelected,
    filteredEntities,
    closeListAndMaintainFocus,
    setFilteredEntities,
    setActiveDescendant,
    openList,
    closeList,
    toggleList,
    clearOptions,
    handleOptionClick,
    handleOptionRemove,
    onOutsideClick,
  };

  React.useEffect(() => {
    const { registerElement, unregisterElement } = elementsRegistry;

    registerElement("root", id);
    registerElement("label", visibleLabelId);

    return () => {
      unregisterElement("root");
      unregisterElement("label");
    };
  }, [elementsRegistry, id, visibleLabelId]);

  useHandleTargetLabelClick({
    visibleLabelId,
    labelInfo,
    onClick: () => {
      if (disabled) return;

      const triggerId = elementsRegistry.getElementId("trigger");
      const triggerNode = document.getElementById(triggerId ?? "");

      triggerNode?.focus();
    },
  });

  if (typeof document !== "undefined") {
    /* eslint-disable react-hooks/rules-of-hooks */
    useEventListener(
      {
        target: document,
        eventType: "click",
        handler: useEventCallback<MouseEvent>(event => {
          if (!event.target) return;
          if (!rootRef.current) return;
          if (rootRef.current === event.target) return;
          if (contains(rootRef.current, event.target as HTMLElement)) return;

          closeList();
        }),
      },
      isListOpen,
    );
    /* eslint-enable react-hooks/rules-of-hooks */
  }

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    position: "relative",
  };

  const dataAttrs = {
    "data-slot": RootSlot,
    "data-open": isListOpen ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
  };

  return (
    <>
      {renderLabel()}
      <div
        {...otherProps}
        // @ts-expect-error React hasn't added `inert` yet
        inert={disabled ? "" : undefined}
        style={style}
        id={id}
        ref={refCallback}
        className={classes?.root}
        {...dataAttrs}
      >
        <SelectContext.Provider value={context}>
          {children}
        </SelectContext.Provider>
      </div>
    </>
  );
};

const Select = componentWithForwardedRef(SelectBase, "Select");

export default Select;
