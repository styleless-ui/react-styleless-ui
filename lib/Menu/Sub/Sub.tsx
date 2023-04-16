import * as React from "react";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import MenuItemContext from "../Item/context";
import Menu, { type Props as MenuRootProps } from "../Menu";
import { SubRoot as SubRootSlot } from "../slots";

type OwnProps = Omit<MenuRootProps, "anchorElement" | "open">;

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const SubMenuBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, id: idProp, ...otherProps } = props;

  const id = useDeterministicId(idProp, "styleless-ui__sub-menu");

  const menuItemCtx = React.useContext(MenuItemContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  menuItemCtx?.registerSubMenu(rootRef, id);

  return (
    <Menu
      {...otherProps}
      open={menuItemCtx?.isSubMenuOpen()}
      id={id}
      ref={handleRootRef}
      className={className}
      anchorElement={menuItemCtx?.ref}
      data-slot={SubRootSlot}
      data-submenu
    >
      {children}
    </Menu>
  );
};

const SubMenu = componentWithForwardedRef(SubMenuBase);

export default SubMenu;
