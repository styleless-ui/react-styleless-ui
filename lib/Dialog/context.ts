import * as React from "react";

export interface IDialogContext {
  id?: string;
}

const DialogContext = React.createContext<IDialogContext | null>(null);

if (process.env.NODE_ENV !== "production") {
  DialogContext.displayName = "DialogContext";
}

export default DialogContext;
