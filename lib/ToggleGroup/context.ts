import * as React from "react";
import { type Props } from "./ToggleGroup";

type ContextValue = {
  multiple: boolean;
  forcedTabability: string | null;
  keyboardActivationBehavior: Exclude<
    Props["keyboardActivationBehavior"],
    undefined
  >;
  value: Exclude<Props["value"], undefined>;
  onChange: (newActiveState: boolean, toggleValue: string) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "ToggleGroupContext";
}

export {
  Context as ToggleGroupContext,
  type ContextValue as ToggleGroupContextValue,
};
