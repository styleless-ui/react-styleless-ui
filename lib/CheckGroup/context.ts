import * as React from "react";
import type { PickAsMandatory } from "../types";
import { type Props } from "./CheckGroup";

type ContextValue = PickAsMandatory<Props, "value"> &
  Pick<Props, "readOnly" | "disabled"> & {
    onChange: (newCheckedState: boolean, inputValue: string) => void;
  };

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "CheckGroupContext";
}

export {
  Context as CheckGroupContext,
  type ContextValue as CheckGroupContextValue,
};
