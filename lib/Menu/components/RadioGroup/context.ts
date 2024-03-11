import * as React from "react";

type ContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "Menu.RadioGroup.Context";
}

export {
  Context as RadioGroupContext,
  type ContextValue as RadioGroupContextValue,
};
