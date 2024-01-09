import * as React from "react";

type ContextValue = {
  ref: React.RefObject<HTMLDivElement>;
  activeElement: HTMLDivElement | null;
  activeSubTrigger: HTMLDivElement | null;
  shouldActivateFirstSubItemRef: React.MutableRefObject<boolean>;
  isMenuActive: boolean;
  keepMounted: boolean;
  setIsMenuActive: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveSubTrigger: React.Dispatch<
    React.SetStateAction<HTMLDivElement | null>
  >;
  setActiveElement: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
  registerItem: (itemRef: React.RefObject<HTMLDivElement>) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "MenuContext";
}

export { Context as MenuContext, type ContextValue as MenuContextValue };
