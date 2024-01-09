import * as React from "react";
import { type Props } from "./ToggleGroup";

type ContextValue = {
  multiple: boolean;
  keyboardActivationBehavior: Exclude<
    Props["keyboardActivationBehavior"],
    undefined
  >;
  value: Exclude<Props["value"], undefined>;
  toggles: [string, React.RefObject<HTMLButtonElement>][];
  onChange: (newActiveState: boolean, toggleValue: string) => void;
  registerToggle: (
    value: string,
    ref: React.RefObject<HTMLButtonElement>,
  ) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "ToggleGroupContext";
}

export {
  Context as ToggleGroupContext,
  type ContextValue as ToggleGroupContextValue,
};
