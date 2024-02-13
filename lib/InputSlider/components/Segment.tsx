import * as React from "react";
import type { Classes } from "../../types";
import { type Props as RootProps } from "../InputSlider";
import {
  SegmentLabel as SegmentLabelSlot,
  SegmentMark as SegmentMarkSlot,
  Segment as SegmentSlot,
} from "../slots";

type Props = {
  classes: Classes<"root" | "mark" | "label">;
  index: number;
  length: number;
  label?: React.ReactNode;
  orientation: Exclude<RootProps["orientation"], undefined>;
  onSegmentLabelClick: React.MouseEventHandler;
};

const Segment = (props: Props) => {
  const { classes, index, length, label, orientation, onSegmentLabelClick } =
    props;

  const calcSegmentRootStyle = () => {
    const style: React.CSSProperties = { position: "absolute" };

    if (orientation === "horizontal") style.left = `${length}%`;
    else style.top = `${length}%`;

    return style;
  };

  const calcSegmentMarkStyle = () => {
    const style: React.CSSProperties = { position: "absolute" };

    if (orientation === "horizontal") {
      style.left = 0;
      style.transform = "translateX(-50%)";
    } else {
      style.top = 0;
      style.transform = "translateY(-50%)";
    }

    return style;
  };

  return (
    <div
      className={classes.root}
      style={calcSegmentRootStyle()}
      data-slot={SegmentSlot}
      data-segment-index={index}
    >
      <div
        style={calcSegmentMarkStyle()}
        className={classes.mark}
        data-slot={SegmentMarkSlot}
      ></div>
      <div
        className={classes.label}
        data-slot={SegmentLabelSlot}
        onClick={onSegmentLabelClick}
      >
        {label}
      </div>
    </div>
  );
};

export default Segment;
