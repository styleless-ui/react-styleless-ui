import * as React from "react";
import type { MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import MenuItemContext from "../Item/context";
import Menu, { type MenuProps } from "../Menu";

type SubMenuBaseProps = Omit<MenuProps, "anchorElement" | "open">;

export type SubMenuProps = Omit<
  MergeElementProps<"div", SubMenuBaseProps>,
  "defaultValue" | "defaultChecked"
>;

const SubMenuBase = (props: SubMenuProps, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, id: idProp, ...otherProps } = props;

  const id = useDeterministicId(idProp, "styleless-ui__sub-menu");

  const menuItemCtx = React.useContext(MenuItemContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  menuItemCtx?.registerSubMenu(rootRef, id);

  return (
    <Menu
      open={menuItemCtx?.isSubMenuOpen()}
      id={id}
      ref={handleRootRef}
      className={className}
      anchorElement={menuItemCtx?.ref}
      data-submenu
      {...otherProps}
    >
      {children}
    </Menu>
  );
};

const SubMenu = componentWithForwardedRef<
  HTMLDivElement,
  SubMenuProps,
  typeof SubMenuBase
>(SubMenuBase);

export default SubMenu;
