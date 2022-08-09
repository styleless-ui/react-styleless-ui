import * as React from "react";

export interface IExpandableContext {
  isExpanded: boolean;
  setIsExpanded: (value: React.SetStateAction<boolean>) => void;
}

const ExpandableContext = React.createContext<IExpandableContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  ExpandableContext.displayName = "ExpandableContext";
}

export default ExpandableContext;
