import * as React from "react";

type ContextValue = {
  disabled: boolean;
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
