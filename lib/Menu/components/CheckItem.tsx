import * as React from "react";
import { disableUserSelectCSSProperties } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import { MenuContext } from "../context";
import { CheckItemRoot as CheckItemRootSlot } from "../slots";
import useMenuItem from "../useMenuItem";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        active: boolean;
        disabled: boolean;
        selected: boolean;
      }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: {
        active: boolean;
        disabled: boolean;
        selected: boolean;
      }) => string);
  /**
   * If `true`, the item will be checked.
   * @default false
   */
  checked?: boolean;
  /**
   * The default state of `checked`. Use when the component is not controlled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the item will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback is fired when the state changes.
   */
  onCheckChange?: (checked: boolean) => void;
  /**
   * The Callback is fired when the item is selected.
   */
  onSelect?: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => void;
};

export type Props = Omit<MergeElementProps<"div", OwnProps>, "defaultValue">;

const CheckItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    checked,
    defaultChecked,
    onCheckChange,
    onSelect,
    onClick,
    onMouseEnter,
    onMouseLeave,
    style,
    ...otherProps
  } = props;

  const id = useDeterministicId(undefined, "styleless-ui__menu-item");

  const menuCtx = React.useContext(MenuContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const [isSelected, setIsSelected] = useControlledProp(
    checked,
    defaultChecked,
    false,
  );

  const isActive =
    menuCtx && rootRef.current
      ? menuCtx.activeElement === rootRef.current
      : false;

  const renderCtx = {
    disabled,
    active: isActive,
    selected: isSelected,
  };

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const menuItem = useMenuItem({
    disabled,
    isActive,
    onClick,
    onMouseEnter: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      menuCtx?.setActiveElement(rootRef.current);
      onMouseEnter?.(event);
    }),
    onMouseLeave: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      menuCtx?.setActiveElement(null);
      onMouseLeave?.(event);
    }),
    changeEmitter: useEventCallback<
      React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
    >(event => {
      onSelect?.(event);
      onCheckChange?.(!isSelected);
      setIsSelected(!isSelected);
    }),
  });

  const refCallback = (node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;
    menuCtx?.registerItem(rootRef);
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      onClick={menuItem.handleClick}
      onMouseEnter={menuItem.handleMouseEnter}
      onMouseLeave={menuItem.handleMouseLeave}
      style={
        style
          ? { ...style, ...disableUserSelectCSSProperties }
          : disableUserSelectCSSProperties
      }
      tabIndex={-1}
      role="menuitemcheckbox"
      data-slot={CheckItemRootSlot}
      data-active={isActive ? "data-active" : undefined}
      aria-checked={isSelected}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

const CheckItem = componentWithForwardedRef(CheckItemBase, "MenuCheckItem");

export default CheckItem;
