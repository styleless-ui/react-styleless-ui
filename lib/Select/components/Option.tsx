import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import { SelectContext } from "../context";
import { OptionRoot as OptionRootSlot } from "../slots";
import { normalizeValues } from "../utils";

export type RenderProps = {
  /**
   * The `active` state of the component.
   * An option is active if it's hovered by a pointer or visually
   * focused by keyboard interactions.
   */
  active: boolean;
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * The `selected` state of the component.
   */
  selected: boolean;
  /**
   * The `hidden` state of the component.
   * If it doesn't exist in the search results, it's going to be `true`.
   */
  hidden: boolean;
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
   * The value of option when submitted.
   * Works as an unique identifier for the option.
   */
  value: string;
  /**
   * If `true`, the option will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Text used for screen readers and typeahead purposes.
   */
  valueLabel: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const OptionBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    value,
    valueLabel,
    id: idProp,
    className: classNameProp,
    children: childrenProp,
    style: styleProp,
    onMouseEnter,
    onMouseLeave,
    onClick,
    disabled = false,
    ...otherProps
  } = props;

  const ctx = React.useContext(SelectContext);

  const rootRef = React.useRef<HTMLDivElement>(null);

  const id = useDeterministicId(idProp, "styleless-ui__select__option");

  const handleRootRef = useForkedRefs(rootRef, ref);

  const handleClick = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (disabled || ctx?.disabled) {
        event.preventDefault();

        return;
      }

      const comboboxId = ctx?.elementsRegistry.getElementId("combobox");
      const comboboxNode = document.getElementById(comboboxId ?? "");

      comboboxNode?.focus();

      if (ctx?.readOnly) return;

      ctx?.handleOptionClick(value);
      onClick?.(event);
    },
  );

  const handleMouseEnter = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (disabled || ctx?.disabled) {
        event.preventDefault();

        return;
      }

      if (ctx?.readOnly) return;

      if (event.currentTarget === rootRef.current) {
        ctx?.setActiveDescendant(rootRef.current);
      }

      onMouseEnter?.(event);
    },
  );

  const handleMouseLeave = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (disabled || ctx?.disabled) {
        event.preventDefault();

        return;
      }

      if (ctx?.readOnly) return;

      ctx?.setActiveDescendant(null);

      onMouseLeave?.(event);
    },
  );

  if (!ctx) {
    logger("You have to use this component as a descendant of <Select.Root>.", {
      scope: "Select.Option",
      type: "error",
    });

    return null;
  }

  const values = normalizeValues(ctx?.selectedValues);

  const isSelected = values.some(v => v === value);
  const isActive = ctx?.activeDescendant?.id === id;

  let isHidden = false;

  const filteredEntities = ctx?.filteredEntities;

  if (filteredEntities != null) {
    if (filteredEntities.length === 0) isHidden = true;
    else isHidden = !filteredEntities.some(entity => entity === value);
  }

  const renderProps: RenderProps = {
    disabled,
    hidden: isHidden,
    selected: isSelected,
    active: isActive,
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

  const dataAttrs = {
    "data-slot": OptionRootSlot,
    "data-entity": value,
    "data-selected": isSelected ? "" : undefined,
    "data-active": isActive ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-hidden": isHidden ? "" : undefined,
  };

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    display: isHidden ? "none" : undefined,
  };

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={disabled ? "" : undefined}
      id={id}
      style={style}
      ref={handleRootRef}
      role="option"
      tabIndex={-1}
      aria-label={valueLabel}
      aria-disabled={disabled}
      aria-selected={isSelected}
      aria-hidden={isHidden}
      aria-atomic="true"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...dataAttrs}
    >
      {children}
    </div>
  );
};

const Option = componentWithForwardedRef(OptionBase, "Select.Option");

export default Option;
