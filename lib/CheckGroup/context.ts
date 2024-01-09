import * as React from "react";
import { type Props } from "./CheckGroup";

interface ContextValue {
  value: Exclude<Props["value"], undefined>;
  onChange: (newCheckedState: boolean, inputValue: string) => void;
}

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "CheckGroupContext";
}

export {
  Context as CheckGroupContext,
  type ContextValue as CheckGroupContextValue,
};
