import * as React from "react";

export interface IDialogContext {
  role: "dialog" | "alertdialog";
  open: boolean;
}

const DialogContext = React.createContext<IDialogContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  DialogContext.displayName = "DialogContext";
}

export default DialogContext;
