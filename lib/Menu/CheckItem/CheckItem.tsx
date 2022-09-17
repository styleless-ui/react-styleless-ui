import * as React from "react";
import { disableUserSelectCSSProperties } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useEventCallback,
  useForkedRefs
} from "../../utils";
import MenuContext from "../context";
import useMenuItem from "../useMenuItem";

interface MenuCheckItemBaseProps {
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
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckChange?: (checked: boolean) => void;
  onSelect?: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>
  ) => void;
}

export type MenuCheckItemProps = Omit<
  MergeElementProps<"div", MenuCheckItemBaseProps>,
  "defaultValue"
>;

const MenuCheckItemBase = (
  props: MenuCheckItemProps,
  ref: React.Ref<HTMLDivElement>
) => {
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
    ...otherProps
  } = props;

  const menuCtx = React.useContext(MenuContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const [isSelected, setIsSelected] = useControlledProp(
    checked,
    defaultChecked,
    false
  );

  const isActive =
    menuCtx && rootRef.current
      ? menuCtx.activeElement === rootRef.current
      : false;

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
      onCheckChange?.(!isSelected);
      setIsSelected(!isSelected);
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
      role="menuitemcheckbox"
      ref={refCallback}
      data-slot="menuCheckItemRoot"
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

const MenuCheckItem = componentWithForwardedRef(MenuCheckItemBase);

export default MenuCheckItem;
