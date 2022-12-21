import * as React from "react";

export interface ISnackbarContext {
  role: "alert" | "status";
  open: boolean;
}

const SnackbarContext = React.createContext<ISnackbarContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  SnackbarContext.displayName = "SnackbarContext";
}

export default SnackbarContext;
