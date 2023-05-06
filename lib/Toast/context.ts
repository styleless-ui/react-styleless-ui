import * as React from "react";

export interface ToastContextValue {
  role: "alert" | "status";
  open: boolean;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  ToastContext.displayName = "ToastContext";
}

export default ToastContext;
