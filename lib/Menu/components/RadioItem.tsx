import * as React from "react";
import { disableUserSelectCSSProperties, logger } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import { MenuContext } from "../context";
import { RadioItemRoot as RadioItemRootSlot } from "../slots";
import useMenuItem from "../useMenuItem";
import { RadioGroupContext } from "./RadioGroup/context";

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
   * The value of the radio.
   */
  value: string;
  /**
   * If `true`, the radio will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback is fired when the item is selected.
   */
  onSelect?: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const RadioItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    value,
    onSelect,
    onClick,
    onMouseEnter,
    onMouseLeave,
    style,
    ...otherProps
  } = props;

  const id = useDeterministicId(undefined, "styleless-ui__menu-item");

  const menuCtx = React.useContext(MenuContext);
  const radioGroupCtx = React.useContext(RadioGroupContext);

  if (process.env.NODE_ENV !== "production") {
    if (!radioGroupCtx) {
      logger(
        "You can't use `<Menu.RadioItem>` outside of the `<Menu.RadioGroup>`.",
        { scope: "Menu.RadioItem", type: "error" },
      );
    }
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const isActive =
    menuCtx && rootRef.current
      ? menuCtx.activeElement === rootRef.current
      : false;

  const isSelected = radioGroupCtx?.value === value;

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
      radioGroupCtx?.onValueChange(value);
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
      role="menuitemradio"
      ref={refCallback}
      data-slot={RadioItemRootSlot}
      className={className}
      tabIndex={-1}
      onClick={menuItem.handleClick}
      onMouseEnter={menuItem.handleMouseEnter}
      onMouseLeave={menuItem.handleMouseLeave}
      aria-checked={isSelected}
      aria-disabled={disabled}
      data-active={isActive ? "" : undefined}
      style={
        style
          ? { ...style, ...disableUserSelectCSSProperties }
          : disableUserSelectCSSProperties
      }
    >
      {children}
    </div>
  );
};

const RadioItem = componentWithForwardedRef(RadioItemBase, "MenuRadioItem");

export default RadioItem;
