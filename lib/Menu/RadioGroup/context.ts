import * as React from "react";

interface IMenuRadioGroupContext {
  value: string;
  onValueChange: (value: string) => void;
}

const MenuRadioGroupContext =
  React.createContext<IMenuRadioGroupContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  MenuRadioGroupContext.displayName = "MenuRadioGroupContext";
}

export default MenuRadioGroupContext;
