import * as React from "react";

interface IMenuItemContext {
  ref: React.RefObject<HTMLDivElement>;
  isSubMenuOpen: () => boolean;
  registerSubMenu: (
    menuRef: React.RefObject<HTMLDivElement>,
    id: string | undefined
  ) => void;
}

const MenuItemContext = React.createContext<IMenuItemContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  MenuItemContext.displayName = "MenuItemContext";
}

export default MenuItemContext;
