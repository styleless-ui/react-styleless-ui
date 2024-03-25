import * as React from "react";
import {
  disableUserSelectCSSProperties,
  logger,
  resolvePropWithRenderContext,
} from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import { ItemRoot as ItemRootSlot } from "../slots";
import { useBaseItem } from "../utils";
import { RadioGroupContext } from "./RadioGroup/context";

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
   * The `checked` state of the component.
   */
  checked: boolean;
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
   * If `true`, the item will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * The value of item when checked.
   * Works as an unique identifier for the item.
   */
  value: string;
  /**
   * The Callback is fired when the item is selected.
   */
  onSelect?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const RadioItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    style: styleProp,
    value,
    disabled = false,
    onClick,
    onSelect,
    onMouseEnter,
    onMouseLeave,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-radio-item");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const radioGroupCtx = React.useContext(RadioGroupContext);

  const baseItem = useBaseItem({
    disabled,
    entityName: value,
    type: "radio-item",
    onClick: event => {
      if (disabled) {
        event.preventDefault();

        return;
      }

      radioGroupCtx?.onValueChange(value);

      onSelect?.(event);
      onClick?.(event);
    },
    onMouseEnter,
    onMouseLeave,
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

  if (baseItem.isInvalid) return null;

  if (!radioGroupCtx) {
    logger("You can't use this component outside of the <Menu.RadioGroup>.", {
      scope: "Menu.RadioItem",
      type: "error",
    });

    return null;
  }

  const isChecked = radioGroupCtx.value === value;

  const renderProps: RenderProps = {
    disabled,
    active: baseItem.isActive,
    checked: isChecked,
  };

  const classNameProps: ClassNameProps = renderProps;

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    ...disableUserSelectCSSProperties,
  };

  const children = resolvePropWithRenderContext(childrenProp, renderProps);
  const className = resolvePropWithRenderContext(classNameProp, classNameProps);

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={disabled ? "" : undefined}
      id={id}
      ref={refCallback}
      className={className}
      onClick={baseItem.handleClick}
      onMouseEnter={baseItem.handleMouseEnter}
      onMouseLeave={baseItem.handleMouseLeave}
      style={style}
      tabIndex={-1}
      role="menuitemradio"
      aria-disabled={disabled}
      aria-checked={isChecked}
      data-slot={ItemRootSlot}
      data-entity={value}
      data-active={baseItem.isActive ? "" : undefined}
      data-checked={isChecked ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      {children}
    </div>
  );
};

const RadioItem = componentWithForwardedRef(RadioItemBase, "Menu.RadioItem");

export default RadioItem;
