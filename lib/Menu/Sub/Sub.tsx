import * as React from "react";
import type { MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import MenuItemContext from "../Item/context";
import Menu, { type RootProps as MenuProps } from "../Menu";
import { SubRoot as SubRootSlot } from "../slots";

type SubBaseProps = Omit<MenuProps, "anchorElement" | "open">;

export type SubProps = Omit<
  MergeElementProps<"div", SubBaseProps>,
  "defaultValue" | "defaultChecked"
>;

const SubMenuBase = (props: SubProps, ref: React.Ref<HTMLDivElement>) => {
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
      data-slot={SubRootSlot}
      data-submenu
      {...otherProps}
    >
      {children}
    </Menu>
  );
};

const SubMenu = componentWithForwardedRef(SubMenuBase);

export default SubMenu;
