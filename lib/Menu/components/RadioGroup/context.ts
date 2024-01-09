import * as React from "react";

interface ContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "MenuRadioGroupContext";
}

export {
  Context as RadioGroupContext,
  type ContextValue as RadioGroupContextValue,
};
