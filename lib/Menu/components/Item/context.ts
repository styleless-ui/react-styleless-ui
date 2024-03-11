import * as React from "react";

type ContextValue = {
  id: string;
  isExpanded: boolean;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "Menu.Item.Context";
}

export {
  Context as MenuItemContext,
  type ContextValue as MenuItemContextValue,
};
