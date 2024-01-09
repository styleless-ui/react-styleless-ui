import * as React from "react";

interface ContextValue {
  role: "dialog" | "alertdialog";
  open: boolean;
}

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "DialogContext";
}

export { Context as DialogContext, type ContextValue as DialogContextValue };
