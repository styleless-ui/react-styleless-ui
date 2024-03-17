import * as React from "react";

type ContextValue = {
  isExpanded: boolean;
  emitExpandChange: (expandState: boolean) => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "ExpandableContext";
}

export {
  Context as ExpandableContext,
  type ContextValue as ExpandableContextValue,
};
