import * as React from "react";

type ContextValue = {
  id: string;
  isExpanded: boolean;
  value: string;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "TreeView.Item.Context";
}

export {
  Context as TreeViewItemContext,
  type ContextValue as TreeViewItemContextValue,
};
