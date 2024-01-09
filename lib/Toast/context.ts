import * as React from "react";

type ContextValue = {
  role: "alert" | "status";
  open: boolean;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "ToastContext";
}

export { Context as ToastContext, type ContextValue as ToastContextValue };
