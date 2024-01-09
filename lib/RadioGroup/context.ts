import * as React from "react";
import { type Props } from "./RadioGroup";

type ContextValue = {
  value: Exclude<Props["value"], undefined>;
  radios: [string, React.RefObject<HTMLButtonElement>][];
  onChange: (newCheckedState: boolean, inputValue: string) => void;
  registerRadio: (
    value: string,
    ref: React.RefObject<HTMLButtonElement>,
  ) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "RadioGroupContext";
}

export {
  Context as RadioGroupContext,
  type ContextValue as RadioGroupContextValue,
};
