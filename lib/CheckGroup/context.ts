import * as React from "react";
import { type CheckGroupProps } from "./CheckGroup";

interface ICheckGroupContext {
  value: Exclude<CheckGroupProps["value"], undefined>;
  onChange: (newCheckedState: boolean, inputValue: string) => void;
}

const CheckGroupContext = React.createContext<ICheckGroupContext | undefined>(
  undefined
);

if (process.env.NODE_ENV !== "production") {
  CheckGroupContext.displayName = "CheckGroupContext";
}

export { CheckGroupContext as default, type ICheckGroupContext };
