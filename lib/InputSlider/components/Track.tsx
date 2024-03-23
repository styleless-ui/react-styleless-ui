import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { InputSliderContext } from "../context";
import { TrackRoot as TrackRootSlot } from "../slots";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  | "defaultValue"
  | "value"
  | "defaultChecked"
  | "checked"
  | "onChange"
  | "onChangeCapture"
>;

const TrackBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { className, children, style: styleProp, ...otherProps } = props;

  const ctx = React.useContext(InputSliderContext);

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <InputSlider.Root>.",
      {
        scope: "InputSlider.Track",
        type: "error",
      },
    );

    return null;
  }

  const { orientation } = ctx;

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    ...{ horizontal: { width: "100%" }, vertical: { height: "100%" } }[
      orientation
    ],
    position: "relative",
  };

  return (
    <div
      {...otherProps}
      ref={ref}
      className={className}
      style={style}
      aria-hidden="true"
      data-slot={TrackRootSlot}
    >
      {children}
    </div>
  );
};

const Track = componentWithForwardedRef(TrackBase, "InputSlider.Track");

export default Track;
