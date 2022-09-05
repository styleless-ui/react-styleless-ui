import * as React from "react";
import { disableUserSelectCSSProperties } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useEventCallback,
  useForkedRefs
} from "../../utils";
import MenuContext, { type IMenuContext } from "../context";
import useMenuItem from "../useMenuItem";
import MenuItemContext from "./context";

interface MenuItemBaseProps {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        active: boolean;
        disabled: boolean;
        isSubMenuOpen: boolean;
      }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: {
        active: boolean;
        disabled: boolean;
        isSubMenuOpen: boolean;
      }) => string);
  disabled?: boolean;
  onSelect?: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>
  ) => void;
}

export type MenuItemProps = Omit<
  MergeElementProps<"div", MenuItemBaseProps>,
  "defaultValue" | "defaultChecked"
>;

const makeRegisterSubMenu =
  (
    storeRef: React.MutableRefObject<
      | {
          ref: React.RefObject<HTMLDivElement>;
          id: string | undefined;
        }
      | undefined
    >
  ) =>
  (subMenuRef: React.RefObject<HTMLDivElement>, id: string | undefined) =>
    void (storeRef.current = { ref: subMenuRef, id });

const MenuItemBase = (props: MenuItemProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onSelect,
    ...otherProps
  } = props;

  const menuCtx = React.useContext(MenuContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const isSubMenuOpen = () => {
    if (rootRef.current == null) return false;

    return menuCtx?.activeSubTrigger === rootRef.current;
  };

  const isActive =
    menuCtx && rootRef.current
      ? menuCtx.activeElement === rootRef.current
      : false;

  const renderCtx = {
    disabled,
    active: isActive,
    isSubMenuOpen: isSubMenuOpen()
  };

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const subMenuRef = React.useRef<{
    ref: React.RefObject<HTMLDivElement>;
    id: string | undefined;
    ctx: IMenuContext | null;
  }>();

  const registerSubMenu = makeRegisterSubMenu(subMenuRef);

  const menuItem = useMenuItem({
    disabled,
    isActive,
    onClick,
    onMouseEnter: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      if (event.currentTarget !== rootRef.current || !menuCtx)
        return onMouseEnter?.(event);

      menuCtx.setActiveElement(rootRef.current);
      menuCtx.shouldActivateFirstSubItemRef.current = false;
      menuCtx.setIsMenuActive(true);

      if (subMenuRef.current) {
        menuCtx.setActiveSubTrigger(rootRef.current);
        subMenuRef.current.ctx?.setIsMenuActive(false);
      }

      onMouseEnter?.(event);
    }),
    onMouseLeave: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      menuCtx?.setActiveElement(null);

      if (subMenuRef.current) {
        menuCtx?.setActiveSubTrigger(null);
        subMenuRef.current.ctx?.setIsMenuActive(true);
      }

      onMouseLeave?.(event);
    }),
    changeEmitter: useEventCallback<
      React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
    >(event => {
      onSelect?.(event);
    })
  });

  const refCallback = (node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;
    menuCtx?.registerItem(rootRef);

    if (!subMenuRef.current) return;

    const { id } = subMenuRef.current;

    node.setAttribute("aria-haspopup", "menu");
    node.setAttribute("aria-expanded", String(isSubMenuOpen()));

    id && node.setAttribute("aria-controls", id);
  };

  return (
    <div
      {...otherProps}
      role="menuitem"
      ref={refCallback}
      data-slot="menuItemRoot"
      className={className}
      tabIndex={-1}
      onClick={menuItem.handleClick}
      onMouseEnter={menuItem.handleMouseEnter}
      onMouseLeave={menuItem.handleMouseLeave}
      aria-disabled={disabled}
      style={
        otherProps.style
          ? { ...otherProps.style, ...disableUserSelectCSSProperties }
          : disableUserSelectCSSProperties
      }
      {...(isActive ? { "data-active": "" } : {})}
    >
      <MenuItemContext.Provider
        value={{
          ref: rootRef,
          isSubMenuOpen,
          registerSubMenu
        }}
      >
        {children}
      </MenuItemContext.Provider>
    </div>
  );
};

const MenuItem = componentWithForwardedRef<
  HTMLDivElement,
  MenuItemProps,
  typeof MenuItemBase
>(MenuItemBase);

export default MenuItem;
