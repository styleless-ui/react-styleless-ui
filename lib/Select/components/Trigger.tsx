import * as React from "react";
import { disableUserSelectCSSProperties, logger } from "../../internals";
import type {
  ClassesWithRenderContext,
  MergeElementProps,
} from "../../typings";
import {
  componentWithForwardedRef,
  useComboboxBase,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import { SelectContext } from "../context";
import {
  TriggerInputSearch as TriggerInputSearchSlot,
  TriggerPlaceholder as TriggerPlaceholderSlot,
  TriggerRoot as TriggerRootSlot,
  TriggerValues as TriggerValuesSlot,
} from "../slots";
import { normalizeValues } from "../utils";

export type ClassNameProps = {
  hasFocus: boolean;
};

export type ValueEntity = {
  value: string;
  valueLabel: string;
  remove: <T extends HTMLElement>(event: React.MouseEvent<T>) => void;
};

type OwnProps = {
  classes?: ClassesWithRenderContext<
    "root" | "searchInput" | "placeholder" | "values",
    ClassNameProps
  >;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  transformValues?: (valueEntities: ValueEntity[]) => React.ReactNode;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked" | "className"
>;

const TriggerBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    classes: classesProp,
    placeholder: placeholderProp,
    style: styleProp,
    children,
    onClick,
    onFocus,
    onBlur,
    transformValues,
    autoFocus = false,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__select__trigger");

  const comboboxId = `${id}__combobox`;

  const comboboxRef = React.useRef<HTMLElement>(null);

  const ctx = React.useContext(SelectContext);

  const [isFocused, setIsFocused] = React.useState(false);

  const listId = ctx?.elementsRegistry.getElementId("list");
  const visibleLabelId = ctx?.elementsRegistry.getElementId("label");

  const listOpenState = ctx?.isListOpen ?? false;

  const hasSelectedValue = ctx?.isAnyOptionSelected;

  const getListItems = () => {
    const listNode = document.getElementById(listId ?? "");

    if (!listNode) return [];

    return Array.from(
      listNode.querySelectorAll<HTMLElement>(`[role='option']`),
    );
  };

  const comboboxBase = useComboboxBase<HTMLButtonElement | HTMLInputElement>({
    autoFocus,
    listOpenState,
    disabled: ctx?.disabled ?? false,
    activeDescendant: ctx?.activeDescendant ?? null,
    searchable: ctx?.searchable ?? false,
    getListItems,
    onFilteredEntities: entities => {
      ctx?.setActiveDescendant(null);
      ctx?.setFilteredEntities(entities);
    },
    onActiveDescendantChange: newActiveDescendant => {
      ctx?.setActiveDescendant(newActiveDescendant);
    },
    onListOpenChange: newListOpenState => {
      if (newListOpenState) ctx?.openList();
      else ctx?.closeList();
    },
    onEscapeKeyDown: useEventCallback<React.KeyboardEvent<HTMLElement>>(
      event => {
        event.preventDefault();

        ctx?.closeList();
      },
    ),
    onBackSpaceKeyDown: useEventCallback<React.KeyboardEvent<HTMLElement>>(
      () => {
        if (!ctx) return;

        if (ctx.searchable) {
          const comboboxNode = comboboxRef.current;

          if (
            comboboxNode &&
            (comboboxNode as HTMLInputElement).value.length > 0
          ) {
            return;
          }
        }

        const values = ctx.selectedValues;

        if (typeof values === "string") {
          ctx.clearOptions();
        } else {
          const lastValue = values[values.length - 1];

          if (!lastValue) return;

          ctx.handleOptionRemove(lastValue);
        }
      },
    ),
    onClick: useEventCallback<React.MouseEvent<HTMLElement>>(() => {
      if (ctx?.disabled) return;

      ctx?.toggleList();
    }),
  });

  const handleComboboxRef = useForkedRefs(comboboxRef, comboboxBase.handleRef);

  React.useEffect(() => {
    ctx?.elementsRegistry.registerElement("trigger", id);
    ctx?.elementsRegistry.registerElement("combobox", comboboxId);

    return () => {
      ctx?.elementsRegistry.unregisterElement("trigger");
      ctx?.elementsRegistry.unregisterElement("combobox");
    };
  }, [ctx?.elementsRegistry, id, comboboxId]);

  const handleRootFocus = useEventCallback<React.FocusEvent<HTMLDivElement>>(
    event => {
      if (ctx?.disabled) return;

      if (!comboboxBase.isFocusedVisible) comboboxRef.current?.focus();

      setIsFocused(true);

      onFocus?.(event);
    },
  );

  const handleRootBlur = useEventCallback<React.FocusEvent<HTMLDivElement>>(
    event => {
      if (ctx?.disabled) return;

      setIsFocused(false);

      onBlur?.(event);
    },
  );

  const handleRootClick = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (ctx?.disabled) return;

      comboboxRef.current?.click();
      comboboxRef.current?.focus();

      onClick?.(event);
    },
  );

  if (!ctx) {
    logger("You have to use this component in a sub-tree of <Select.Root>.", {
      scope: "Select.Trigger",
      type: "error",
    });

    return null;
  }

  const placeholder =
    placeholderProp ?? (ctx.multiple ? "Select options" : "Select an option");

  const renderPlaceholder = () => {
    if (hasSelectedValue) return null;
    if (ctx.searchable) return null;

    return (
      <div
        style={disableUserSelectCSSProperties}
        className={classes?.placeholder}
        data-slot={TriggerPlaceholderSlot}
      >
        {placeholder}
      </div>
    );
  };

  const renderCombobox = () => {
    const comboboxProps = {
      id: comboboxId,
      ref: handleComboboxRef,
      role: "combobox",
      "aria-activedescendant": ctx.activeDescendant?.id,
      "aria-expanded": ctx.isListOpen,
      "aria-haspopup": "listbox",
      "aria-controls": ctx.isListOpen ? listId : undefined,
      "aria-label": ctx.labelInfo.srOnlyLabel,
      "aria-disabled": ctx.disabled,
      "aria-autocomplete": ctx.searchable ? "list" : "none",
      "aria-labelledby": ctx.labelInfo.visibleLabel
        ? visibleLabelId
        : ctx.labelInfo.labelledBy,
      tabIndex: ctx.disabled ? -1 : 0,
      onClick: comboboxBase.handleClick,
      onBlur: comboboxBase.handleBlur,
      onFocus: comboboxBase.handleFocus,
      onKeyDown: comboboxBase.handleKeyDown,
      onKeyUp: comboboxBase.handleKeyUp,
    };

    if (!ctx.searchable) {
      return (
        <button
          {...(comboboxProps as React.ComponentPropsWithRef<"button">)}
          style={{ all: "unset", position: "absolute", top: 0, left: 0 }}
        ></button>
      );
    }

    return (
      <input
        {...(comboboxProps as React.ComponentPropsWithRef<"input">)}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        type="text"
        onChange={comboboxBase.handleQueryChange}
        placeholder={placeholder}
        className={classes?.searchInput}
        data-slot={TriggerInputSearchSlot}
      />
    );
  };

  const renderValues = () => {
    if (!hasSelectedValue) return null;

    const labelsMap = ctx.valueLabelsMapRef.current;
    const values = normalizeValues(ctx.selectedValues);

    let transformedValue: React.ReactNode = values.join(", ");

    if (transformValues) {
      const makeHandleRemove =
        (value: string) => (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();

          ctx.closeListAndMaintainFocus();
          ctx.handleOptionRemove(value);
        };

      const valueEntities: ValueEntity[] = values.map(value => {
        const valueLabel = labelsMap.get(value) ?? "";
        const handleRemove = makeHandleRemove(value);

        return {
          value,
          valueLabel,
          remove: handleRemove,
        };
      });

      transformedValue = transformValues(valueEntities);
    }

    return (
      <div
        tabIndex={-1}
        style={disableUserSelectCSSProperties}
        className={classes?.values}
        data-slot={TriggerValuesSlot}
      >
        {transformedValue}
      </div>
    );
  };

  const rootFocusedState = comboboxBase.isFocusedVisible || isFocused;

  const classes =
    typeof classesProp === "function"
      ? classesProp({ hasFocus: rootFocusedState })
      : classesProp;

  const style: React.CSSProperties = { ...styleProp, position: "relative" };

  const dataAttrs = {
    "data-slot": TriggerRootSlot,
    "data-disabled": ctx.disabled ? "" : undefined,
    "data-focused": rootFocusedState ? "" : undefined,
  };

  return (
    <div
      {...otherProps}
      style={style}
      id={id}
      ref={ref}
      className={classes?.root}
      onFocus={handleRootFocus}
      onBlur={handleRootBlur}
      onClick={handleRootClick}
      {...dataAttrs}
    >
      {renderPlaceholder()}
      {renderValues()}
      {renderCombobox()}
      {children}
    </div>
  );
};

const Trigger = componentWithForwardedRef(TriggerBase, "SelectTrigger");

export default Trigger;
