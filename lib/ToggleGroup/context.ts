import * as React from "react";
import { type Props } from "./ToggleGroup";

interface IToggleGroupContext {
  multiple: boolean;
  keyboardActivationBehavior: Exclude<
    Props["keyboardActivationBehavior"],
    undefined
  >;
  value: Exclude<Props["value"], undefined>;
  toggles: [string, React.RefObject<HTMLButtonElement>][];
  onChange: (newActiveState: boolean, toggleValue: string) => void;
  registerToggle: (
    value: string,
    ref: React.RefObject<HTMLButtonElement>,
  ) => void;
}

const ToggleGroupContext = React.createContext<IToggleGroupContext | undefined>(
  undefined,
);

if (process.env.NODE_ENV !== "production") {
  ToggleGroupContext.displayName = "ToggleGroupContext";
}

export {
  ToggleGroupContext as default,
  type IToggleGroupContext as IToggleGroupContext,
};
