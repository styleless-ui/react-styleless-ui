import * as React from "react";
import { type Props } from "./RadioGroup";

type ContextValue = {
  value: Exclude<Props["value"], undefined>;
  forcedTabability: string | null;
  onChange: (newCheckedState: boolean, inputValue: string) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "RadioGroupContext";
}

export {
  Context as RadioGroupContext,
  type ContextValue as RadioGroupContextValue,
};
