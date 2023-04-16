import * as React from "react";
import { disableUserSelectCSSProperties, SystemKeys } from "../internals";
import type { Classes, MergeElementProps } from "../typings";
import {
  clamp,
  componentWithForwardedRef,
  getBoundingClientRect,
  inLerp,
  remap,
  useButtonBase,
  useControlledProp,
  useDirection,
  useEventCallback,
  useEventListener,
  useForkedRefs,
  useIsMounted,
} from "../utils";
import * as Slots from "./slots";

type InputSliderClassesMap = Classes<
  | "root"
  | "track"
  | "range"
  | "thumb"
  | "leadingThumb"
  | "trailingThumb"
  | "segments"
  | "segment"
  | "segmentMark"
  | "segmentLabel"
>;

type Segment = { length: number; label?: string | React.ReactNode };

type ActiveThumb = { index: 0 | 1; element: HTMLDivElement };
type ThumbInfo = {
  value: number;
  minValue: number;
  maxValue: number;
  ref: React.RefCallback<HTMLDivElement | undefined>;
  stateRef: React.MutableRefObject<ThumbState>;
  label: { srOnlyLabel?: string; labelledBy?: string };
};

type ThumbState = {
  active: boolean;
  zIndex: number;
};

type Label =
  | {
      /**
       * The label to use as `aria-label` property.
       */
      screenReaderLabel: string;
    }
  | {
      /**
       * Identifies the element (or elements) that labels the menu.
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
       */
      labelledBy: string;
    };

interface OwnProps {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?:
    | InputSliderClassesMap
    | ((ctx: {
        disabled: boolean;
        orientation: "horizontal" | "vertical";
        leadingThumbState: { active: boolean; focusedVisible: boolean };
        trailingThumbState: { active: boolean; focusedVisible: boolean };
      }) => InputSliderClassesMap);
  /**
   * The label of the slider(s).
   */
  label: Label | [Label, Label];
  /**
   * The value of the slider. For ranged sliders, provide an array with two values.
   */
  value?: number | [number, number];
  /**
   * The default value of the slider. Use when the component is not controlled.
   */
  defaultValue?: number | [number, number];
  /**
   * If `true`, the slider will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The orientation of the slider.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The minimum allowed value of the slider. Should not be greater than or equal to `max`.
   */
  min: number;
  /**
   * The maximum allowed value of the slider. Should not be less than or equal to `min`.
   */
  max: number;
  /**
   * If `true`, the slider will be a ranged slider.
   * @default false
   */
  multiThumb?: boolean;
  /**
   * The granularity with which the slider can step through values.
   * We recommend (max - min) to be evenly divisible by the step.
   *
   * When step is `snap`, the thumb can only be slid onto (snap on)
   * stops provided with the `stops` prop.
   */
  step?: number | "snap";
  /**
   * Stops indicate predetermined values to which the user can move the slider.
   *
   * When stops is a number, evenly-spaced stops will be created
   * (the number indicates the amount of stops to create).
   *
   * When an array is provided, it should contain objects with value and an optional label keys.
   */
  stops?: number | { value: number; label?: string | React.ReactNode }[];
  /**
   * Accepts a render function which returns a ReactNode to display the value text of the slider.
   *
   * The third parameter (`valueText`) is going to be the result of the `setThumbValueText` function.
   */
  renderThumbValueText?: (
    thumbValue: number,
    isOpen: boolean,
    valueText?: string,
  ) => React.ReactNode;
  /**
   * Accepts a function which returns a string value that provides a user-friendly name
   * for the current value of the slider. This is important for screen reader users.
   */
  setThumbValueText?: (thumbValue: number) => string;
  /**
   * Callback fired when the slider's value changes.
   */
  onChange?: (
    value: number | [number, number],
    activeThumb: ActiveThumb | null,
  ) => void;
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: Label) => {
  const props: { srOnlyLabel?: string; labelledBy?: string } = {};

  if ("screenReaderLabel" in labelInput) {
    props.srOnlyLabel = labelInput.screenReaderLabel;
  } else if ("labelledBy" in labelInput) {
    props.labelledBy = labelInput.labelledBy;
  } else {
    throw new Error(
      [
        "[StylelessUI][InputSlider]: Invalid `label` provided.",
        "Each `label` property must be in shape of " +
          "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
      ].join("\n"),
    );
  }

  return props;
};

const findNearestValue = (vals: number[], target: number) => {
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

const getRelativeValue = (
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

const getNearestThumb = (
  value: number,
  thumbInfos: { left: ThumbInfo; right: ThumbInfo | null },
): ThumbInfo & { index: 0 | 1 } => {
  const { left, right } = thumbInfos;

  const leftDiff = Math.abs(left.value - value);

  if (!right) return { ...left, index: 0 };
  const rightDiff = Math.abs(right.value - value);

  return leftDiff <= rightDiff ? { ...left, index: 0 } : { ...right, index: 1 };
};

const InputSliderBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    max,
    min,
    step,
    stops,
    onChange,
    onClick,
    setThumbValueText,
    renderThumbValueText,
    value: valueProp,
    defaultValue,
    label: labels,
    classes: classesProp,
    style: inlineStyle,
    orientation = "horizontal",
    multiThumb = false,
    disabled = false,
    ...otherProps
  } = props;

  if (typeof min === "undefined") {
    throw new Error(
      "[StylelessUI][InputSlider]: The `min` property is missing.",
    );
  }

  if (typeof max === "undefined") {
    throw new Error(
      "[StylelessUI][InputSlider]: The `max` property is missing.",
    );
  }

  if (max < min) {
    throw new Error(
      "[StylelessUI][InputSlider]: The `min` property must be less than or equal to `max` property.",
    );
  }

  if (typeof stops === "undefined" && step === "snap") {
    throw new Error(
      '[StylelessUI][InputSlider]: When using `step="snap"` you must also provide a valid `stops` property.',
    );
  }

  const [value, setValue] = useControlledProp<number | [number, number]>(
    valueProp,
    defaultValue,
    multiThumb ? [min, max] : min,
  );

  if (multiThumb && !Array.isArray(value)) {
    throw new Error(
      "[StylelessUI][InputSlider]: The `value` and `defaultValue` " +
        "should be an array of exactly two numbers when `multiThumb={true}.`",
    );
  }

  if (!multiThumb && typeof value !== "number") {
    throw new Error(
      "[StylelessUI][InputSlider]: The `value` and `defaultValue` " +
        "should be a number when `multiThumb={false}.`",
    );
  }

  if (multiThumb && !Array.isArray(labels)) {
    throw new Error(
      "[StylelessUI][InputSlider]: The `label` property " +
        "should be an array of exactly two labels when `multiThumb={true}.`",
    );
  }

  const prevValue = React.useRef<[number, number] | undefined>(undefined);

  const valueState = (() => {
    if (Array.isArray(value)) {
      const v0 = clamp(value[0], min, max);
      const v1 = clamp(value[1], min, max);

      if (v0 > v1) {
        if (prevValue.current) return prevValue.current;
        throw new Error(
          "[StylelessUI][InputSlider]: Invalid `value` provided! (`value[0] > value[1]`)",
        );
      }

      prevValue.current = [v0, v1];
      return prevValue.current;
    } else return clamp(value, min, max);
  })();

  const segments: Segment[] = React.useMemo(() => {
    if (typeof stops === "number") {
      if (stops === 0) return [];
      return (Array(stops + 1).fill({ length: 100 / stops }) as Segment[]).map(
        (segment, idx) => ({ length: segment.length * idx }),
      );
    }

    return (
      stops?.reduce(
        (result, { value, label }) => [
          ...result,
          { label, length: inLerp(0, max, value) * 100 },
        ],
        [] as Segment[],
      ) ?? []
    );
  }, [stops, max]);

  const isMounted = useIsMounted();

  const activeThumbRef = React.useRef<ActiveThumb | null>(null);

  const [isDragStarted, setIsDragStarted] = React.useState(false);
  const [isClickAllowed, setIsClickAllowed] = React.useState(true);

  const [valueDisplayState, setValueDisplayState] = React.useState({
    left: false,
    right: false,
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const dir = useDirection(rootRef);

  const handleThumbKeyDown = useEventCallback<
    React.KeyboardEvent<HTMLDivElement>
  >(event => {
    const isRtl = dir === "rtl";

    const increase = isRtl
      ? [
          SystemKeys.LEFT,
          orientation === "horizontal" ? SystemKeys.UP : SystemKeys.DOWN,
        ].includes(event.key)
      : [
          SystemKeys.RIGHT,
          orientation === "horizontal" ? SystemKeys.UP : SystemKeys.DOWN,
        ].includes(event.key);

    const decrease = isRtl
      ? [
          SystemKeys.RIGHT,
          orientation === "horizontal" ? SystemKeys.DOWN : SystemKeys.UP,
        ].includes(event.key)
      : [
          SystemKeys.LEFT,
          orientation === "horizontal" ? SystemKeys.DOWN : SystemKeys.UP,
        ].includes(event.key);

    if (!increase && !decrease) return;

    event.preventDefault();

    const activeThumb = getActiveThumb(event.currentTarget);
    const thumbInfo = getThumbInfo(activeThumb.index);
    const oppositeThumbInfo = getThumbInfo(
      ((activeThumb.index + 1) % 2) as 0 | 1,
    );

    activeThumbRef.current = null;
    thumbInfo.stateRef.current.zIndex = 2;
    oppositeThumbInfo.stateRef.current.zIndex = 1;

    const relativeMin = thumbInfo.minValue;
    const relativeMax = thumbInfo.maxValue;

    let newValue: number;

    if (typeof step === "undefined") {
      newValue = thumbInfo.value + (increase ? 1 : decrease ? -1 : 0);
    } else if (step === "snap") {
      const stopNums = segments.map(segment => (segment.length * max) / 100);
      const valIdx = stopNums.indexOf(thumbInfo.value);
      const nextIdx = clamp(
        increase ? valIdx + 1 : decrease ? valIdx - 1 : 0,
        0,
        stopNums.length - 1,
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newValue = stopNums[nextIdx] ?? stopNums[0]!;
    } else {
      newValue = thumbInfo.value + (increase ? step : decrease ? -step : 0);
    }

    const relativeValue = clamp(newValue, relativeMin, relativeMax);

    if (multiThumb) {
      const isChanged =
        (value as [number, number])[activeThumb.index] !== relativeValue;

      if (isChanged) {
        emitValueChange(
          activeThumb.index === 0
            ? [relativeValue, (valueState as [number, number])[1]]
            : [(valueState as [number, number])[0], relativeValue],
        );
      }
    } else emitValueChange(relativeValue);
  });

  const {
    handleBlur: handleLeftBlur,
    handleButtonRef: handleLeftRef,
    handleFocus: handleLeftFocus,
    handleKeyDown: handleLeftKeyDown,
    handleKeyUp: handleLeftKeyUp,
    isFocusedVisible: isLeftFocusedVisible,
  } = useButtonBase<HTMLDivElement>({
    disabled,
    onKeyDown: handleThumbKeyDown,
  });

  const {
    handleBlur: handleRightBlur,
    handleButtonRef: handleRightRef,
    handleFocus: handleRightFocus,
    handleKeyDown: handleRightKeyDown,
    handleKeyUp: handleRightKeyUp,
    isFocusedVisible: isRightFocusedVisible,
  } = useButtonBase<HTMLDivElement>({
    disabled,
    onKeyDown: handleThumbKeyDown,
  });

  const leftThumbRef = React.useRef<HTMLDivElement>(null);
  const rightThumbRef = React.useRef<HTMLDivElement>(null);

  const handleLeftThumbRef = useForkedRefs(leftThumbRef, handleLeftRef);
  const handleRightThumbRef = useForkedRefs(rightThumbRef, handleRightRef);

  const leftThumbStateRef = React.useRef<ThumbState>({
    active: false,
    zIndex: 1,
  });

  const rightThumbStateRef = React.useRef<ThumbState>({
    active: false,
    zIndex: 1,
  });

  React.useEffect(() => {
    if (!isLeftFocusedVisible) return;
    if (!renderThumbValueText) return;

    setValueDisplayState(s => ({ ...s, left: true }));
    return () => {
      setValueDisplayState(s => ({ ...s, left: false }));
    };
  }, [isLeftFocusedVisible, renderThumbValueText]);

  React.useEffect(() => {
    if (!isRightFocusedVisible) return;
    if (!renderThumbValueText) return;

    setValueDisplayState(s => ({ ...s, right: true }));
    return () => {
      setValueDisplayState(s => ({ ...s, right: false }));
    };
  }, [isRightFocusedVisible, renderThumbValueText]);

  const thumbs = (() => {
    const leftThumbValue = multiThumb
      ? (valueState as [number, number])[0]
      : (valueState as number);

    const rightThumbValue = multiThumb
      ? (valueState as [number, number])[1]
      : max;

    return {
      left: {
        value: leftThumbValue,
        minValue: min,
        maxValue: rightThumbValue,
        ref: handleLeftThumbRef,
        stateRef: leftThumbStateRef,
        label: getLabelInfo(
          multiThumb ? (labels as [Label, Label])[0] : (labels as Label),
        ),
      } as ThumbInfo,
      right: {
        value: rightThumbValue,
        minValue: leftThumbValue,
        maxValue: max,
        ref: handleRightThumbRef,
        stateRef: rightThumbStateRef,
        label: multiThumb ? getLabelInfo((labels as [Label, Label])[1]) : {},
      } as ThumbInfo,
    };
  })();

  const positions = (() => {
    const leftThumb = inLerp(0, max, thumbs.left.value) * 100;
    const rightThumb = inLerp(max, 0, thumbs.right.value) * 100;

    const range = {
      start: multiThumb ? leftThumb : 0,
      end: multiThumb ? rightThumb : 100 - leftThumb,
    };

    return { leftThumb, rightThumb, range };
  })();

  const emitValueChange = (newValue: number | [number, number]) => {
    if (disabled || !isMounted()) return;

    setValue(newValue);
    onChange?.(newValue, activeThumbRef.current);
  };

  const getActiveThumb = (eventTarget: HTMLDivElement): ActiveThumb => ({
    element: eventTarget,
    index:
      eventTarget === leftThumbRef.current
        ? 0
        : eventTarget === rightThumbRef.current
        ? 1
        : 0,
  });

  const getThumbInfo = (index: 0 | 1): ThumbInfo =>
    index === 0 ? thumbs.left : thumbs.right;

  const handleDragStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!rootRef.current) return;

    const activeThumb = getActiveThumb(event.currentTarget);

    activeThumbRef.current = activeThumb;

    setIsDragStarted(true);
    setIsClickAllowed(false);

    const thumb = getThumbInfo(activeThumb.index);
    const oppositeThumb = getThumbInfo(((activeThumb.index + 1) % 2) as 0 | 1);

    const thumbState = thumb.stateRef.current;
    const oppositeThumbState = oppositeThumb.stateRef.current;

    thumbState.active = true;
    thumbState.zIndex = 2;
    oppositeThumbState.zIndex = 1;

    setValueDisplayState(s => ({
      ...s,
      [activeThumb.index === 0 ? "left" : "right"]: true,
    }));
  };

  const handleDragEnd = (): void => {
    if (!activeThumbRef.current) return;

    const activeThumb = activeThumbRef.current;
    const thumbState = getThumbInfo(activeThumb.index).stateRef.current;

    if (!thumbState.active) return void (activeThumbRef.current = null);

    setIsDragStarted(false);
    setTimeout(() => setIsClickAllowed(true), 10);

    thumbState.active = false;
    activeThumbRef.current = null;

    setValueDisplayState(s => ({
      ...s,
      [activeThumb.index === 0 ? "left" : "right"]: false,
    }));
  };

  const handleDragging = (event: MouseEvent | TouchEvent) => {
    if (!rootRef.current) return;
    if (!activeThumbRef.current) return;

    const activeThumb = activeThumbRef.current;
    const thumbInfo = getThumbInfo(activeThumb.index);

    const thumbState = thumbInfo.stateRef.current;

    if (!thumbState.active) return;

    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }

    let clientXOrY =
      event.type === "touchstart"
        ? (event as TouchEvent).touches[0]?.[
            orientation === "horizontal" ? "clientX" : "clientY"
          ] ?? 0
        : (event as MouseEvent)[
            orientation === "horizontal" ? "clientX" : "clientY"
          ];

    const rect = getBoundingClientRect(rootRef.current);

    const leftOrTop = orientation === "horizontal" ? rect.left : rect.top;
    const widthOrHeight =
      orientation === "horizontal" ? rect.width : rect.height;

    clientXOrY = clientXOrY - leftOrTop;
    clientXOrY = clamp(clientXOrY, 0, widthOrHeight);

    const relativeValue = getRelativeValue(
      clientXOrY,
      widthOrHeight,
      thumbInfo,
      segments,
      { max, step },
    );

    if (multiThumb) {
      const isChanged =
        (value as [number, number])[activeThumb.index] !== relativeValue;

      if (isChanged) {
        emitValueChange(
          activeThumb.index === 0
            ? [relativeValue, (valueState as [number, number])[1]]
            : [(valueState as [number, number])[0], relativeValue],
        );
      }
    } else emitValueChange(relativeValue);
  };

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isClickAllowed || disabled || !isMounted()) return;
    if (!rootRef.current) return;

    let clientXOrY =
      orientation === "horizontal" ? event.clientX : event.clientY;

    const rect = getBoundingClientRect(rootRef.current);

    const leftOrTop = orientation === "horizontal" ? rect.left : rect.top;
    const widthOrHeight =
      orientation === "horizontal" ? rect.width : rect.height;

    clientXOrY = clientXOrY - leftOrTop;
    clientXOrY = clamp(clientXOrY, 0, widthOrHeight);

    const thumb = getNearestThumb(remap(clientXOrY, 0, widthOrHeight, 0, max), {
      left: getThumbInfo(0),
      right: multiThumb ? getThumbInfo(1) : null,
    });

    const relativeValue = getRelativeValue(
      clientXOrY,
      widthOrHeight,
      thumb,
      segments,
      { max, step },
    );

    if (multiThumb) {
      const isChanged =
        (value as [number, number])[thumb.index] !== relativeValue;

      if (isChanged) {
        emitValueChange(
          thumb.index === 0
            ? [relativeValue, (valueState as [number, number])[1]]
            : [(valueState as [number, number])[0], relativeValue],
        );
      }
    } else emitValueChange(relativeValue);

    onClick?.(event);
  };

  const leftThumbStyles: React.CSSProperties = {
    position: "absolute",
    transform:
      orientation === "horizontal" ? "translateX(-50%)" : "translateY(-50%)",
    zIndex: thumbs.left.stateRef.current.zIndex,
    ...{
      horizontal: {
        ...{
          ltr: { left: `${positions.leftThumb}%` },
          rtl: { right: `${positions.leftThumb}%` },
        }[dir ?? "ltr"],
      },
      vertical: { top: `${positions.leftThumb}%` },
    }[orientation],
  };

  const rightThumbStyles: React.CSSProperties = {
    position: "absolute",
    transform:
      orientation === "horizontal" ? "translateX(50%)" : "translateY(50%)",
    zIndex: thumbs.right.stateRef.current.zIndex,
    ...{
      horizontal: {
        ...{
          ltr: { right: `${positions.rightThumb}%` },
          rtl: { left: `${positions.rightThumb}%` },
        }[dir ?? "ltr"],
      },
      vertical: { bottom: `${positions.rightThumb}%` },
    }[orientation],
  };

  const rangeStyles: React.CSSProperties = {
    position: "absolute",
    ...{
      horizontal: {
        ...{
          ltr: {
            left: `${positions.range.start}%`,
            right: `${positions.range.end}%`,
          },
          rtl: {
            right: `${positions.range.start}%`,
            left: `${positions.range.end}%`,
          },
        }[dir ?? "ltr"],
      },
      vertical: {
        top: `${positions.range.start}%`,
        bottom: `${positions.range.end}%`,
      },
    }[orientation],
  };

  const trackStyles: React.CSSProperties = {
    position: "relative",
    ...{ horizontal: { width: "100%" }, vertical: { height: "100%" } }[
      orientation
    ],
  };

  const sliderProps = {
    role: "slider",
    "aria-orientation": orientation,
    onTouchStart: handleDragStart,
    onMouseDown: handleDragStart,
  };

  const handleMouseEnter = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      const activeThumb = getActiveThumb(event.currentTarget);
      const thumbState = getThumbInfo(activeThumb.index).stateRef.current;

      if (thumbState.active) return;

      setValueDisplayState(s => ({
        ...s,
        [activeThumb.index === 0 ? "left" : "right"]: true,
      }));
    },
  );

  const handleMouseLeave = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      const activeThumb = getActiveThumb(event.currentTarget);
      const thumbState = getThumbInfo(activeThumb.index).stateRef.current;

      if (thumbState.active) return;

      setValueDisplayState(s => ({
        ...s,
        [activeThumb.index === 0 ? "left" : "right"]: false,
      }));
    },
  );

  const handleSegmentLabelClick = useEventCallback<
    React.MouseEvent<HTMLDivElement>
  >(event => {
    event.stopPropagation();

    const parent = event.currentTarget.parentElement;

    if (!parent) return;

    const idxStringified = parent.getAttribute("data-segment-index");

    if (!idxStringified) return;

    const idx = Number(idxStringified);
    const newValue = segments[idx]?.length;

    if (typeof newValue === "undefined") return;

    const thumb = getNearestThumb(newValue, {
      left: getThumbInfo(0),
      right: multiThumb ? getThumbInfo(1) : null,
    });

    const relativeMin = thumb.minValue;
    const relativeMax = thumb.maxValue;

    const relativeValue = clamp(newValue, relativeMin, relativeMax);

    if (multiThumb) {
      const isChanged =
        (value as [number, number])[thumb.index] !== relativeValue;

      if (isChanged) {
        emitValueChange(
          thumb.index === 0
            ? [relativeValue, (valueState as [number, number])[1]]
            : [(valueState as [number, number])[0], relativeValue],
        );
      }
    } else emitValueChange(relativeValue);
  });

  const leftThumbProps = {
    ...sliderProps,
    "aria-label": thumbs.left.label.srOnlyLabel,
    "aria-labelledby": thumbs.left.label.labelledBy,
    "aria-valuetext": setThumbValueText?.(thumbs.left.value),
    "aria-valuenow": thumbs.left.value,
    "aria-valuemin": thumbs.left.minValue,
    "aria-valuemax": thumbs.left.maxValue,
    style: { ...leftThumbStyles, ...disableUserSelectCSSProperties },
    ref: thumbs.left.ref,
    onBlur: handleLeftBlur,
    onFocus: handleLeftFocus,
    onKeyDown: handleLeftKeyDown,
    onKeyUp: handleLeftKeyUp,
    onMouseEnter: renderThumbValueText ? handleMouseEnter : undefined,
    onMouseLeave: renderThumbValueText ? handleMouseLeave : undefined,
  };

  const rightThumbProps = multiThumb
    ? {
        ...sliderProps,
        "aria-label": thumbs.right.label.srOnlyLabel,
        "aria-labelledby": thumbs.right.label.labelledBy,
        "aria-valuetext": setThumbValueText?.(thumbs.right.value),
        "aria-valuenow": thumbs.right.value,
        "aria-valuemin": thumbs.right.minValue,
        "aria-valuemax": thumbs.right.maxValue,
        style: { ...rightThumbStyles, ...disableUserSelectCSSProperties },
        ref: thumbs.right.ref,
        onBlur: handleRightBlur,
        onFocus: handleRightFocus,
        onKeyDown: handleRightKeyDown,
        onKeyUp: handleRightKeyUp,
        onMouseEnter: renderThumbValueText ? handleMouseEnter : undefined,
        onMouseLeave: renderThumbValueText ? handleMouseLeave : undefined,
      }
    : null;

  const classes =
    typeof classesProp === "function"
      ? classesProp({
          disabled,
          orientation,
          leadingThumbState: {
            active: activeThumbRef.current?.index === 0,
            focusedVisible: isLeftFocusedVisible,
          },
          trailingThumbState: {
            active: activeThumbRef.current?.index === 1,
            focusedVisible: isRightFocusedVisible,
          },
        })
      : classesProp;

  if (typeof document !== "undefined") {
    /* eslint-disable react-hooks/rules-of-hooks */
    useEventListener({
      target: document,
      eventType: "touchend",
      handler: handleDragEnd,
      options: { passive: false },
    });
    useEventListener({
      target: document,
      eventType: "mouseup",
      handler: handleDragEnd,
      options: { passive: false },
    });
    useEventListener(
      {
        target: document,
        eventType: "touchmove",
        handler: handleDragging,
        options: { passive: false },
      },
      isDragStarted,
    );
    useEventListener(
      {
        target: document,
        eventType: "mousemove",
        handler: handleDragging,
        options: { passive: false },
      },
      isDragStarted,
    );
    /* eslint-enable react-hooks/rules-of-hooks */
  }

  return (
    <div
      {...otherProps}
      ref={handleRootRef}
      style={{ ...inlineStyle, position: "relative" }}
      className={classes?.root}
      onClick={handleTrackClick}
      data-slot={Slots.Root}
      aria-orientation={orientation}
      aria-disabled={disabled}
    >
      <div
        aria-hidden="true"
        className={classes?.track}
        data-slot={Slots.Track}
        style={trackStyles}
      >
        <div
          aria-hidden="true"
          className={classes?.range}
          data-slot={Slots.Range}
          style={rangeStyles}
        ></div>
        {!!segments.length && (
          <div
            aria-hidden="true"
            className={classes?.segments}
            data-slot={Slots.Segments}
          >
            {segments.map(({ length, label }, idx) => (
              <div
                key={String(length) + String(idx) + String(label)}
                className={classes?.segment}
                data-slot={Slots.Segment}
                data-segment-index={idx}
                style={{
                  position: "absolute",
                  ...{
                    horizontal: {
                      ...{
                        ltr: { left: `${length}%` },
                        rtl: { right: `${length}%` },
                      }[dir ?? "ltr"],
                    },
                    vertical: { top: `${length}%` },
                  }[orientation],
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    ...{
                      horizontal: {
                        ...{
                          ltr: { left: 0, transform: "translateX(-50%)" },
                          rtl: { right: 0, transform: "translateX(50%)" },
                        }[dir ?? "ltr"],
                      },
                      vertical: { top: 0, transform: "translateY(-50%)" },
                    }[orientation],
                  }}
                  className={classes?.segmentMark}
                  data-slot={Slots.SegmentMark}
                ></div>
                <div
                  className={classes?.segmentLabel}
                  data-slot={Slots.SegmentLabel}
                  onClick={handleSegmentLabelClick}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        {...leftThumbProps}
        tabIndex={0}
        className={[classes?.thumb, classes?.leadingThumb]
          .filter(Boolean)
          .join(" ")}
        data-thumb-index="0"
        data-slot={Slots.Thumb}
        data-active={activeThumbRef.current?.index === 0 ? "" : undefined}
        data-focus-visible={isLeftFocusedVisible ? "" : undefined}
      >
        <div aria-hidden="true" data-slot={Slots.ThumbText}>
          {renderThumbValueText?.(
            thumbs.left.value,
            valueDisplayState.left,
            leftThumbProps["aria-valuetext"],
          )}
        </div>
      </div>
      {multiThumb && (
        <div
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          {...rightThumbProps!}
          tabIndex={0}
          className={[classes?.thumb, classes?.trailingThumb]
            .filter(Boolean)
            .join(" ")}
          data-thumb-index="1"
          data-slot={Slots.Thumb}
          data-active={activeThumbRef.current?.index === 1 ? "" : undefined}
          data-focus-visible={isRightFocusedVisible ? "" : undefined}
        >
          <div aria-hidden="true" data-slot={Slots.ThumbText}>
            {
              renderThumbValueText?.(
                thumbs.right.value,
                valueDisplayState.right,
                rightThumbProps!["aria-valuetext"],
              )
              /* eslint-enable @typescript-eslint/no-non-null-assertion */
            }
          </div>
        </div>
      )}
    </div>
  );
};

const InputSlider = componentWithForwardedRef(InputSliderBase);

export default InputSlider;
