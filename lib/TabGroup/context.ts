import * as React from "react";

type ContextValue = {
  activeTab: string;
  orientation: "horizontal" | "vertical";
  forcedTabability: string | null;
  keyboardActivationBehavior: "manual" | "automatic";
  onChange: (tabValue: string) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "TabGroupContext";
}

export {
  Context as TabGroupContext,
  type ContextValue as TabGroupContextValue,
};
