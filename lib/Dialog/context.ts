import * as React from "react";

type ContextValue = {
  role: "dialog" | "alertdialog";
  open: boolean;
  emitClose: () => void;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "DialogContext";
}

export { Context as DialogContext, type ContextValue as DialogContextValue };
