import * as React from "react";
import { disableUserSelectCSSProperties, logger } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import { ItemRoot as ItemRootSlot } from "../slots";
import { useBaseItem } from "../utils";

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
   * The controlled `checked` state of the item.
   * If `true`, the item will be checked.
   *
   * @default false
   */
  checked?: boolean;
  /**
   * The Callback is fired when the state changes.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * The Callback is fired when the item is selected.
   */
  onSelect?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export type Props = Omit<MergeElementProps<"div", OwnProps>, "defaultValue">;

const CheckItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    style: styleProp,
    value,
    checked = false,
    disabled = false,
    onClick,
    onCheckedChange,
    onSelect,
    onMouseEnter,
    onMouseLeave,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-check-item");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const baseItem = useBaseItem({
    disabled,
    entityName: value,
    type: "check-item",
    onClick: event => {
      const newChecked = !checked;

      onCheckedChange?.(newChecked);
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

  const renderProps: RenderProps = {
    disabled,
    checked,
    active: baseItem.isActive,
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
      role="menuitemcheckbox"
      aria-disabled={disabled}
      aria-checked={checked}
      data-slot={ItemRootSlot}
      data-entityname={value}
      data-active={baseItem.isActive ? "" : undefined}
      data-checked={checked ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      {children}
    </div>
  );
};

const CheckItem = componentWithForwardedRef(CheckItemBase, "Menu.CheckItem");

export default CheckItem;
