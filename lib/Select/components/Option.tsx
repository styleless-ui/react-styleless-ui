import * as React from "react";
import type { MergeElementProps, PropWithRenderContext } from "../../typings";
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
  active: boolean;
  disabled: boolean;
  selected: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  className?: PropWithRenderContext<string, ClassNameProps>;
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  value: string;
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

  React.useEffect(() => {
    const labelsMap = ctx?.valueLabelsMapRef.current;

    if (!labelsMap) return;

    labelsMap.set(value, valueLabel);
  }, [ctx?.valueLabelsMapRef, value, valueLabel]);

  const maintainFocus = () => {
    const comboboxId = ctx?.elementsRegistry.getElementId("combobox");
    const comboboxNode = document.getElementById(comboboxId ?? "");

    comboboxNode?.focus();
  };

  const handleClick = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      maintainFocus();
      ctx?.handleOptionClick(value);
      onClick?.(event);
    },
  );

  const handleMouseEnter = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (event.currentTarget === rootRef.current) {
        ctx?.setActiveDescendant(rootRef.current);
      }

      onMouseEnter?.(event);
    },
  );

  const handleMouseLeave = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      ctx?.setActiveDescendant(null);

      onMouseLeave?.(event);
    },
  );

  const values = normalizeValues(ctx?.selectedValues);

  const isSelected = values.some(v => v === value);
  const isActive = ctx?.activeDescendant?.id === id;

  let isHidden = false;

  const filteredEntities = ctx?.filteredEntities;

  if (filteredEntities != null) {
    if (filteredEntities.length === 0) isHidden = true;
    else isHidden = !filteredEntities.some(entity => entity === value);
  }

  const renderCtx: RenderProps = {
    disabled,
    selected: isSelected,
    active: isActive,
  };

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const dataAttrs = {
    "data-slot": OptionRootSlot,
    "data-entityname": value,
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

const Option = componentWithForwardedRef(OptionBase, "SelectOption");

export default Option;
