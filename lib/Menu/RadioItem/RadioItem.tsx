import * as React from "react";
import { disableUserSelectCSSProperties } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useEventCallback,
  useForkedRefs
} from "../../utils";
import MenuContext from "../context";
import MenuRadioGroupContext from "../RadioGroup/context";
import useMenuItem from "../useMenuItem";

interface MenuRadioItemBaseProps {
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
  value: string;
  disabled?: boolean;
  onSelect?: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>
  ) => void;
}

export type MenuRadioItemProps = Omit<
  MergeElementProps<"div", MenuRadioItemBaseProps>,
  "defaultValue" | "defaultChecked"
>;

const MenuRadioItemBase = (
  props: MenuRadioItemProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    value,
    onSelect,
    onClick,
    onMouseEnter,
    onMouseLeave,
    ...otherProps
  } = props;

  const menuCtx = React.useContext(MenuContext);
  const radioGroupCtx = React.useContext(MenuRadioGroupContext);

  if (process.env.NODE_ENV !== "production") {
    if (!radioGroupCtx) {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][MenuRadioItem]: You can't use <MenuRadioItem> outside of the <MenuRadioGroup>."
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
    selected: isSelected
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
    })
  });

  const refCallback = (node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;
    menuCtx?.registerItem(rootRef);
  };

  return (
    <div
      {...otherProps}
      role="menuitemradio"
      ref={refCallback}
      data-slot="menuRadioItemRoot"
      className={className}
      tabIndex={-1}
      onClick={menuItem.handleClick}
      onMouseEnter={menuItem.handleMouseEnter}
      onMouseLeave={menuItem.handleMouseLeave}
      aria-checked={isSelected}
      aria-disabled={disabled}
      style={
        otherProps.style
          ? { ...otherProps.style, ...disableUserSelectCSSProperties }
          : disableUserSelectCSSProperties
      }
      {...(isActive ? { "data-active": "" } : {})}
    >
      {children}
    </div>
  );
};

const MenuRadioItem = componentWithForwardedRef<
  HTMLDivElement,
  MenuRadioItemProps,
  typeof MenuRadioItemBase
>(MenuRadioItemBase);

export default MenuRadioItem;
