import { SystemError, clamp, remap } from "../utils";
import {
  type Label,
  type Props,
  type Segment,
  type ThumbInfo,
} from "./InputSlider";

export const getLabelInfo = (labelInput: Label) => {
  const props: { srOnlyLabel?: string; labelledBy?: string } = {};

  if ("screenReaderLabel" in labelInput) {
    props.srOnlyLabel = labelInput.screenReaderLabel;
  } else if ("labelledBy" in labelInput) {
    props.labelledBy = labelInput.labelledBy;
  } else {
    throw new SystemError(
      [
        "Invalid `label` provided.",
        "Each `label` property must be in shape of " +
          "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
      ].join("\n"),
      "InputSlider",
    );
  }

  return props;
};

export const findNearestValue = (vals: number[], target: number) => {
  const midIdx = Math.floor(vals.length / 2);

  let diff = Infinity;
  let nominee = target;

  const nominate = (idx: number) => {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const val = vals[idx]!;
    const newDiff = Math.abs(target - val);

    if (diff > newDiff) {
      diff = newDiff;
      nominee = val;
    }
  };

  if (vals[midIdx]! < target) {
    for (let idx = midIdx; idx < vals.length; idx++) nominate(idx);
  } else {
    for (let idx = 0; idx <= midIdx; idx++) nominate(idx);
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return nominee;
};

export const getRelativeValue = (
  clientXOrY: number,
  parentWidthOrHeight: number,
  thumbInfo: ThumbInfo,
  segments: Segment[],
  requiredProps: {
    max: Props["max"];
    step: Props["step"];
  },
) => {
  const { max, step } = requiredProps;

  let newValue = remap(clientXOrY, 0, parentWidthOrHeight, 0, max);

  if (typeof step === "number" && step)
    newValue = Math.floor(newValue / step) * step;

  if (step === "snap") {
    const stopNums = segments
      .sort()
      .map(segment => (segment.length * max) / 100);

    newValue = findNearestValue(stopNums, newValue);
  }

  const relativeMin = thumbInfo.minValue;
  const relativeMax = thumbInfo.maxValue;

  return clamp(newValue, relativeMin, relativeMax);
};

export const getNearestThumb = (
  value: number,
  thumbInfos: { left: ThumbInfo; right: ThumbInfo | null },
): ThumbInfo & { index: 0 | 1 } => {
  const { left, right } = thumbInfos;

  const leftDiff = Math.abs(left.value - value);

  if (!right) return { ...left, index: 0 };
  const rightDiff = Math.abs(right.value - value);

  return leftDiff <= rightDiff ? { ...left, index: 0 } : { ...right, index: 1 };
};
