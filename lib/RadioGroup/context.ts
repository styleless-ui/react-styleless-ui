import * as React from "react";
import type { PickAsMandatory } from "../types";
import { type Props } from "./RadioGroup";

type ContextValue = PickAsMandatory<Props, "value"> &
  Pick<Props, "disabled" | "readOnly" | "name"> & {
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
