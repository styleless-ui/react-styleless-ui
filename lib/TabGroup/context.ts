import * as React from "react";

type ContextValue = {
  activeTab: string;
  orientation: "horizontal" | "vertical";
  forcedTabability: string | null;
  keyboardActivationBehavior: "manual" | "automatic";
  onChange: (tabValue: string) => void;
};

const Context = React.createContext<ContextValue | null>(null);

const ListContext = React.createContext<boolean>(false);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "TabGroup.Context";
  ListContext.displayName = "TabGroup.List.Context";
}

export {
  Context as TabGroupContext,
  ListContext as TabGroupListContext,
  type ContextValue as TabGroupContextValue,
};
