import * as React from "react";

export interface ITabGroupContext {
  activeTab: number;
  tabs: React.RefObject<HTMLButtonElement>[];
  panels: React.RefObject<HTMLDivElement>[];
  orientation: "horizontal" | "vertical";
  keyboardActivationBehavior: "manual" | "automatic";
  onChange: (tabIndex: number) => void;
  register: (ref: React.RefObject<HTMLButtonElement | HTMLDivElement>) => void;
}

const TabGroupContext = React.createContext<ITabGroupContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  TabGroupContext.displayName = "TabGroupContext";
}

export default TabGroupContext;
