import * as React from "react";
import type { PickAsMandatory } from "../types";
import type { Props } from "./SpinButton";

type ContextValue = PickAsMandatory<Props, "disabled" | "readOnly"> & {
  isUpperBoundDisabled: boolean;
  isLowerBoundDisabled: boolean;
  handleIncrease: (step: number) => void;
  handleDecrease: (step: number) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "SpinButtonContext";
}

export {
  Context as SpinButtonContext,
  type ContextValue as SpinButtonContextValue,
};
