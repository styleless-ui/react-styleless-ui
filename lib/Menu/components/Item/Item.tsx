import * as React from "react";
import { disableUserSelectCSSProperties } from "../../../internals";
import type { MergeElementProps } from "../../../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../../utils";
import { MenuContext } from "../../context";
import { ItemRoot as ItemRootSlot } from "../../slots";
import useMenuItem from "../../useMenuItem";
import { MenuItemContext } from "./context";
import { makeRegisterSubMenu } from "./utils";

type OwnProps = {
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
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked" | "id"
>;

const ItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
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

  const subMenuRegistryRef = React.useRef<{
    ref: React.RefObject<HTMLDivElement>;
    id: string | undefined;
  }>();

  const registerSubMenu = makeRegisterSubMenu(subMenuRegistryRef);

  const menuItem = useMenuItem({
    disabled,
    isActive,
    onClick,
    onMouseEnter: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      if (event.currentTarget !== rootRef.current) return onMouseEnter?.(event);

      menuCtx?.setActiveElement(rootRef.current);
      menuCtx?.setIsMenuActive(true);
      if (menuCtx) menuCtx.shouldActivateFirstSubItemRef.current = false;

      if (subMenuRegistryRef.current) {
        menuCtx?.setActiveSubTrigger(rootRef.current);
        menuCtx?.setIsMenuActive(false);
      }

      onMouseEnter?.(event);
    }),
    onMouseLeave: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      menuCtx?.setActiveElement(null);

      if (subMenuRegistryRef.current) {
        menuCtx?.setActiveSubTrigger(null);
        menuCtx?.setIsMenuActive(true);
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

    if (!subMenuRegistryRef.current) return;

    const { id: subMenuId } = subMenuRegistryRef.current;

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

const Item = componentWithForwardedRef(ItemBase, "MenuItem");

export default Item;
