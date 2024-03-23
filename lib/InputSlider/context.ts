import * as React from "react";
import type { PickAsMandatory } from "../types";
import { type Props } from "./InputSlider";
import type { Positions, ThumbsInfo } from "./types";

type ContextValue = PickAsMandatory<
  Props,
  "orientation" | "disabled" | "readOnly" | "setThumbValueText" | "multiThumb"
> & {
  getThumbsInfo: () => ThumbsInfo;
  getPositions: () => Positions;
  handleThumbDragStart: (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => void;
  handleThumbKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  Context.displayName = "InputSliderContext";
}

export {
  Context as InputSliderContext,
  type ContextValue as InputSliderContextValue,
};
