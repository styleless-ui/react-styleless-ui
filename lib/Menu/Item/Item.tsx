import * as React from "react";
import { disableUserSelectCSSProperties } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import MenuContext, { type IMenuContext } from "../context";
import { ItemRoot as ItemRootSlot } from "../slots";
import useMenuItem from "../useMenuItem";
import MenuItemContext from "./context";

interface OwnProps {
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
  /**
   * If `true`, the item will be disabled.
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
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked" | "id"
>;

const makeRegisterSubMenu =
  (
    storeRef: React.MutableRefObject<
      | {
          ref: React.RefObject<HTMLDivElement>;
          id: string | undefined;
        }
      | undefined
    >,
  ) =>
  (subMenuRef: React.RefObject<HTMLDivElement>, id: string | undefined) =>
    void (storeRef.current = { ref: subMenuRef, id });

const MenuItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onSelect,
    style,
    ...otherProps
  } = props;

  const id = useDeterministicId(undefined, "styleless-ui__menu-item");

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
    isSubMenuOpen: isSubMenuOpen(),
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
    }),
  });

  const refCallback = (node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;
    menuCtx?.registerItem(rootRef);

    if (!subMenuRef.current) return;

    const { id: subMenuId } = subMenuRef.current;

    node.setAttribute("aria-haspopup", "menu");
    node.setAttribute("aria-expanded", String(isSubMenuOpen()));

    subMenuId && node.setAttribute("aria-controls", subMenuId);
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
      role="menuitem"
      data-slot={ItemRootSlot}
      data-active={isActive ? "" : undefined}
      aria-disabled={disabled}
    >
      <MenuItemContext.Provider
        value={{
          id,
          isSubMenuOpen,
          registerSubMenu,
        }}
      >
        {children}
      </MenuItemContext.Provider>
    </div>
  );
};

const MenuItem = componentWithForwardedRef(MenuItemBase);

export default MenuItem;
