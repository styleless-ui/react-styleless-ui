import * as React from "react";

interface ContextValue {
  id: string;
  isSubMenuOpen: () => boolean;
  registerSubMenu: (
    menuRef: React.RefObject<HTMLDivElement>,
    id: string | undefined,
  ) => void;
}

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "MenuItemContext";
}

export {
  Context as MenuItemContext,
  type ContextValue as MenuItemContextValue,
};
