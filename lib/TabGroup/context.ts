import * as React from "react";

type ContextValue = {
  activeTab: number;
  tabs: React.RefObject<HTMLButtonElement>[];
  panels: React.RefObject<HTMLDivElement>[];
  orientation: "horizontal" | "vertical";
  keyboardActivationBehavior: "manual" | "automatic";
  onChange: (tabIndex: number) => void;
  register: (ref: React.RefObject<HTMLButtonElement | HTMLDivElement>) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "TabGroupContext";
}

export {
  Context as TabGroupContext,
  type ContextValue as TabGroupContextValue,
};
