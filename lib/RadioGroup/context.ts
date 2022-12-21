import * as React from "react";
import { type RootProps } from "./RadioGroup";

interface IRadioGroupContext {
  value: Exclude<RootProps["value"], undefined>;
  radios: [string, React.RefObject<HTMLButtonElement>][];
  onChange: (newCheckedState: boolean, inputValue: string) => void;
  registerRadio: (
    value: string,
    ref: React.RefObject<HTMLButtonElement>
  ) => void;
}

const RadioGroupContext = React.createContext<IRadioGroupContext | undefined>(
  undefined
);

if (process.env.NODE_ENV !== "production") {
  RadioGroupContext.displayName = "RadioGroupContext";
}

export { RadioGroupContext as default, type IRadioGroupContext };
