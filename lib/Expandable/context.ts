import * as React from "react";

interface ContextValue {
  isExpanded: boolean;
  setIsExpanded: (value: React.SetStateAction<boolean>) => void;
  handleExpandChange: (expandState: boolean) => void;
}

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "ExpandableContext";
}

export {
  Context as ExpandableContext,
  type ContextValue as ExpandableContextValue,
};
