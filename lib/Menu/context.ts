import * as React from "react";

export interface IMenuContext {
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
}

const MenuContext = React.createContext<IMenuContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  MenuContext.displayName = "MenuContext";
}

export default MenuContext;
