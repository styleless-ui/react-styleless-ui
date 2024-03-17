import * as React from "react";
import {
  SystemError,
  SystemKeys,
  combineClasses,
  disableUserSelectCSSProperties,
  getLabelInfo,
} from "../internals";
import type { ClassesWithRenderContext, MergeElementProps } from "../types";
import {
  clamp,
  componentWithForwardedRef,
  getBoundingClientRect,
  inLerp,
  remap,
  useButtonBase,
  useControlledProp,
  useEventCallback,
  useEventListener,
  useForkedRefs,
  useIsMounted,
} from "../utils";
import { Segment, Thumb } from "./components";
import * as Slots from "./slots";
import { getNearestThumb, getRelativeValue } from "./utils";

type ActiveThumb = {
  index: 0 | 1;
  name: "infimum" | "supremum";
  element: HTMLDivElement;
};

type ThumbState = {
  active: boolean;
  zIndex: number;
};

export type Segment = { length: number; label?: string | React.ReactNode };

export type ThumbInfo = {
  index: 0 | 1;
  name: "infimum" | "supremum";
  value: number;
  minValue: number;
  maxValue: number;
  state: ThumbState;
  ref: React.RefCallback<HTMLDivElement | undefined>;
  setState: React.Dispatch<React.SetStateAction<ThumbState>>;
  label: { srOnlyLabel?: string; labelledBy?: string };
};

export type ClassNameProps = {
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * The orientation of the component.
   */
  orientation: "horizontal" | "vertical";
  /**
   * The state of the infimum thumb component.
   */
  infimumThumbState: { active: boolean; focusedVisible: boolean };
  /**
   * The state of the supremum thumb component.
   */
  supremumThumbState: { active: boolean; focusedVisible: boolean };
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
       * Identifies the element (or elements) that labels the component.
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
       */
      labelledBy: string;
    };

type OwnProps = {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ClassesWithRenderContext<
    | "root"
    | "track"
    | "range"
    | "thumb"
    | "infimumThumb"
    | "supremumThumb"
    | "segments"
    | "segment"
    | "segmentMark"
    | "segmentLabel",
    ClassNameProps
  >;
  /**
   * If `true`, the slider will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the slider will be a ranged slider.
   */
  multiThumb: boolean;
  /**
   * The orientation of the slider.
   *
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
    valueText: string,
  ) => React.ReactNode;
  /**
   * A function which returns a string value that provides a user-friendly name
   * for the current value of the slider. This is important for screen reader users.
   */
  setThumbValueText: (thumbValue: number) => string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  | "className"
  | "defaultChecked"
  | "defaultValue"
  | "onChange"
  | "onChangeCapture"
> &
  (
    | {
        multiThumb: false;
        /**
         * The label of the slider(s).
         */
        label: Label;
        /**
         * The value of the slider. For ranged sliders, provide an array with two values.
         */
        value?: number;
        /**
         * The default value of the slider. Use when the component is not controlled.
         */
        defaultValue?: number;
        /**
         * Callback fired when the slider's value changes.
         */
        onValueChange?: (
          value: number,
          activeThumb: ActiveThumb | null,
        ) => void;
      }
    | {
        multiThumb: true;
        label: [Label, Label];
        value?: [number, number];
        defaultValue?: [number, number];
        onValueChange?: (
          value: [number, number],
          activeThumb: ActiveThumb | null,
        ) => void;
      }
  );

const InputSliderBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    max,
    min,
    step,
    stops,
    onValueChange,
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
    throw new SystemError("The `min` property is missing.", "InputSlider");
  }

  if (typeof max === "undefined") {
    throw new SystemError("The `max` property is missing.", "InputSlider");
  }

  if (max < min) {
    throw new SystemError(
      "The `min` property must be less than or equal to `max` property.",
      "InputSlider",
    );
  }

  if (typeof stops === "undefined" && step === "snap") {
    throw new SystemError(
      'When using `step="snap"` you must also provide a valid `stops` property.',
      "InputSlider",
    );
  }

  const [value, setValue] = useControlledProp<number | [number, number]>(
    valueProp,
    defaultValue,
    multiThumb ? [min, max] : max,
  );

  if (multiThumb) {
    if (!Array.isArray(value)) {
      throw new SystemError(
        "The `value` and `defaultValue` " +
          "should be an array of exactly two numbers when `multiThumb={true}.`",
        "InputSlider",
      );
    }

    if (!Array.isArray(labels)) {
      throw new SystemError(
        "The `label` property " +
          "should be an array of exactly two labels when `multiThumb={true}.`",
        "InputSlider",
      );
    }
  }

  if (!multiThumb) {
    if (typeof value !== "number") {
      throw new SystemError(
        "The `value` and `defaultValue` " +
          "should be a number when `multiThumb={false}.`",
        "InputSlider",
      );
    }

    if (
      Array.isArray(labels) ||
      (typeof labels !== "object" &&
        !("screenReaderLabel" in labels) &&
        !("labelledBy" in labels))
    ) {
      throw new SystemError(
        "The `label` property " +
          "should be an object of shape `{ screenReaderLabel: string }` " +
          "or `{ labelledBy: string }` when `multiThumb={true}.`",
        "InputSlider",
      );
    }
  }

  const valueState = (() => {
    if (Array.isArray(value)) {
      const v0 = clamp(value[0], min, max);
      const v1 = clamp(value[1], min, max);

      if (v0 > v1) {
        throw new SystemError(
          "Invalid `value` provided. (`value[0] > value[1]`)",
          "InputSlider",
        );
      }

      return [v0, v1] as [number, number];
    } else return clamp(value, min, max);
  })();

  const segments: Segment[] = React.useMemo(() => {
    if (typeof stops === "number") {
      if (stops === 0) return [];

      const segArr = Array(stops + 1).fill({
        length: 100 / stops,
      }) as Segment[];

      return segArr.map((seg, idx) => ({ length: seg.length * idx }));
    }

    if (!stops) return [];

    return stops.reduce(
      (result, { value, label }) => [
        ...result,
        { label, length: inLerp(0, max, value) * 100 },
      ],
      [] as Segment[],
    );
  }, [stops, max]);

  const isMounted = useIsMounted();

  const activeThumbRef = React.useRef<ActiveThumb | null>(null);

  const [isDragStarted, setIsDragStarted] = React.useState(false);
  const [isClickAllowed, setIsClickAllowed] = React.useState(true);

  const [valueDisplayState, setValueDisplayState] = React.useState({
    infimum: false,
    supremum: false,
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const handleThumbKeyDown = useEventCallback<
    React.KeyboardEvent<HTMLDivElement>
  >(event => {
    const increase = [
      SystemKeys.RIGHT,
      orientation === "horizontal" ? SystemKeys.UP : SystemKeys.DOWN,
    ].includes(event.key);

    const decrease = [
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
    thumbInfo.state.zIndex = 2;
    oppositeThumbInfo.state.zIndex = 1;

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
    handleBlur: handleInfimumBlur,
    handleButtonRef: handleInfimumRef,
    handleFocus: handleInfimumFocus,
    handleKeyDown: handleInfimumKeyDown,
    handleKeyUp: handleInfimumKeyUp,
    isFocusedVisible: isInfimumFocusedVisible,
  } = useButtonBase<HTMLDivElement>({
    disabled,
    onKeyDown: handleThumbKeyDown,
  });

  const {
    handleBlur: handleSupremumBlur,
    handleButtonRef: handleSupremumRef,
    handleFocus: handleSupremumFocus,
    handleKeyDown: handleSupremumKeyDown,
    handleKeyUp: handleSupremumKeyUp,
    isFocusedVisible: isSupremumFocusedVisible,
  } = useButtonBase<HTMLDivElement>({
    disabled,
    onKeyDown: handleThumbKeyDown,
  });

  const infimumRef = React.useRef<HTMLDivElement>(null);
  const supremumRef = React.useRef<HTMLDivElement>(null);

  const handleInfimumThumbRef = useForkedRefs(infimumRef, handleInfimumRef);
  const handleSupremumThumbRef = useForkedRefs(supremumRef, handleSupremumRef);

  const [infimumState, setInfimumState] = React.useState<ThumbState>({
    active: false,
    zIndex: 1,
  });

  const [supremumStateRef, setSupremumState] = React.useState<ThumbState>({
    active: false,
    zIndex: 1,
  });

  React.useEffect(() => {
    if (!isInfimumFocusedVisible) return;
    if (!renderThumbValueText) return;

    setValueDisplayState(s => ({ ...s, infimum: true }));
    return () => {
      setValueDisplayState(s => ({ ...s, infimum: false }));
    };
  }, [isInfimumFocusedVisible, renderThumbValueText]);

  React.useEffect(() => {
    if (!isSupremumFocusedVisible) return;
    if (!renderThumbValueText) return;

    setValueDisplayState(s => ({ ...s, supremum: true }));
    return () => {
      setValueDisplayState(s => ({ ...s, supremum: false }));
    };
  }, [isSupremumFocusedVisible, renderThumbValueText]);

  const thumbs = (() => {
    const infimumValue = multiThumb ? (valueState as [number, number])[0] : min;

    const supremumValue = multiThumb
      ? (valueState as [number, number])[1]
      : (valueState as number);

    const infimumLabelInfo = multiThumb
      ? getLabelInfo((labels as [Label, Label])[0], "InputSlider", {
          customErrorMessage: [
            "Invalid `label` provided.",
            "Each `label` property must be in shape of " +
              "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
          ].join("\n"),
        })
      : {};

    const supremumLabelInfo = getLabelInfo(
      multiThumb ? (labels as [Label, Label])[1] : (labels as Label),
      "InputSlider",
      {
        customErrorMessage: [
          "Invalid `label` provided.",
          "Each `label` property must be in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      },
    );

    return {
      infimum: {
        index: 0,
        name: "infimum",
        value: infimumValue,
        minValue: min,
        maxValue: supremumValue,
        ref: handleInfimumThumbRef,
        state: infimumState,
        setState: setInfimumState,
        label: infimumLabelInfo,
      } satisfies ThumbInfo,
      supremum: {
        index: 1,
        name: "supremum",
        value: supremumValue,
        minValue: infimumValue,
        maxValue: max,
        ref: handleSupremumThumbRef,
        state: supremumStateRef,
        setState: setSupremumState,
        label: supremumLabelInfo,
      } satisfies ThumbInfo,
    };
  })();

  const positions = (() => {
    const infimum = inLerp(0, max, thumbs.infimum.value) * 100;
    const supremum = inLerp(max, 0, thumbs.supremum.value) * 100;

    const range = {
      start: multiThumb ? infimum : 0,
      end: multiThumb ? supremum : 100 - infimum,
    };

    return { infimum, supremum, range };
  })();

  const emitValueChange = (newValue: number | [number, number]) => {
    if (disabled || !isMounted()) return;

    setValue(newValue);
    // @ts-expect-error It's fine!
    onValueChange?.(newValue, activeThumbRef.current);
  };

  const getActiveThumb = (eventTarget: HTMLDivElement): ActiveThumb => {
    const isInfimum = eventTarget === infimumRef.current;
    const isSupremum = eventTarget === supremumRef.current;

    return {
      element: eventTarget,
      index: isInfimum ? 0 : isSupremum ? 1 : 1,
      name: isInfimum ? "infimum" : isSupremum ? "supremum" : "supremum",
    };
  };

  const getThumbInfo = (index: 0 | 1): ThumbInfo =>
    index === 0 ? thumbs.infimum : thumbs.supremum;

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

    thumb.setState({ active: true, zIndex: 2 });
    oppositeThumb.setState(s => ({ ...s, zIndex: 1 }));

    setValueDisplayState(s => ({
      ...s,
      [activeThumb.index === 0 ? "infimum" : "supremum"]: true,
    }));
  };

  const handleDragEnd = (): void => {
    if (!activeThumbRef.current) return;

    const activeThumb = activeThumbRef.current;
    const thumb = getThumbInfo(activeThumb.index);

    if (!thumb.state.active) return void (activeThumbRef.current = null);

    setIsDragStarted(false);
    setTimeout(() => setIsClickAllowed(true), 10);

    thumb.setState(s => ({ ...s, active: false }));
    activeThumbRef.current = null;

    setValueDisplayState(s => ({
      ...s,
      [activeThumb.index === 0 ? "infimum" : "supremum"]: false,
    }));
  };

  const handleDragging = (event: MouseEvent | TouchEvent) => {
    if (!rootRef.current) return;
    if (!activeThumbRef.current) return;

    const activeThumb = activeThumbRef.current;
    const thumbInfo = getThumbInfo(activeThumb.index);

    if (!thumbInfo.state.active) return;

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
      infimum: multiThumb ? getThumbInfo(0) : null,
      supremum: getThumbInfo(1),
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

  const handleMouseEnter = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      const activeThumb = getActiveThumb(event.currentTarget);
      const thumb = getThumbInfo(activeThumb.index);

      if (thumb.state.active) return;

      setValueDisplayState(s => ({
        ...s,
        [activeThumb.index === 0 ? "infimum" : "supremum"]: true,
      }));
    },
  );

  const handleMouseLeave = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      const activeThumb = getActiveThumb(event.currentTarget);
      const thumb = getThumbInfo(activeThumb.index);

      if (thumb.state.active) return;

      setValueDisplayState(s => ({
        ...s,
        [activeThumb.index === 0 ? "infimum" : "supremum"]: false,
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
      infimum: multiThumb ? getThumbInfo(0) : null,
      supremum: getThumbInfo(1),
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

  const infimumStyles: React.CSSProperties = {
    position: "absolute",
    transform:
      orientation === "horizontal" ? "translateX(-50%)" : "translateY(-50%)",
    zIndex: thumbs.infimum.state.zIndex,
    ...{
      horizontal: { left: `${positions.infimum}%` },
      vertical: { top: `${positions.infimum}%` },
    }[orientation],
  };

  const supremumStyles: React.CSSProperties = {
    position: "absolute",
    transform:
      orientation === "horizontal" ? "translateX(50%)" : "translateY(50%)",
    zIndex: thumbs.supremum.state.zIndex,
    ...{
      horizontal: { right: `${positions.supremum}%` },
      vertical: { bottom: `${positions.supremum}%` },
    }[orientation],
  };

  const rangeStyles: React.CSSProperties = {
    position: "absolute",
    ...{
      horizontal: {
        left: `${positions.range.start}%`,
        right: `${positions.range.end}%`,
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

  const classNameProps: ClassNameProps = {
    disabled,
    orientation,
    infimumThumbState: {
      active: activeThumbRef.current?.index === 0,
      focusedVisible: isInfimumFocusedVisible,
    },
    supremumThumbState: {
      active: activeThumbRef.current?.index === 1,
      focusedVisible: isSupremumFocusedVisible,
    },
  };

  const classes =
    typeof classesProp === "function"
      ? classesProp(classNameProps)
      : classesProp;

  const renderInfimumThumb = () => {
    if (!multiThumb) return null;

    const infimumProps = {
      style: { ...infimumStyles, ...disableUserSelectCSSProperties },
      onTouchStart: handleDragStart,
      onMouseDown: handleDragStart,
      onBlur: handleInfimumBlur,
      onFocus: handleInfimumFocus,
      onKeyDown: handleInfimumKeyDown,
      onKeyUp: handleInfimumKeyUp,
      onMouseEnter: renderThumbValueText ? handleMouseEnter : undefined,
      onMouseLeave: renderThumbValueText ? handleMouseLeave : undefined,
    };

    return (
      <Thumb
        {...infimumProps}
        orientation={orientation}
        thumbInfo={thumbs.infimum}
        className={combineClasses(classes?.thumb, classes?.infimumThumb)}
        isActive={activeThumbRef.current?.index === 0}
        isDisabled={disabled}
        isFocusedVisible={isInfimumFocusedVisible}
        isValueTextVisible={valueDisplayState.infimum}
        valueText={setThumbValueText(thumbs.infimum.value)}
        renderValueText={renderThumbValueText}
      />
    );
  };

  const renderSupremumThumb = () => {
    const supremumProps = {
      style: { ...supremumStyles, ...disableUserSelectCSSProperties },
      onTouchStart: handleDragStart,
      onMouseDown: handleDragStart,
      onBlur: handleSupremumBlur,
      onFocus: handleSupremumFocus,
      onKeyDown: handleSupremumKeyDown,
      onKeyUp: handleSupremumKeyUp,
      onMouseEnter: renderThumbValueText ? handleMouseEnter : undefined,
      onMouseLeave: renderThumbValueText ? handleMouseLeave : undefined,
    };

    return (
      <Thumb
        {...supremumProps}
        orientation={orientation}
        thumbInfo={thumbs.supremum}
        className={combineClasses(classes?.thumb, classes?.supremumThumb)}
        isActive={activeThumbRef.current?.index === 1}
        isDisabled={disabled}
        isFocusedVisible={isSupremumFocusedVisible}
        isValueTextVisible={valueDisplayState.supremum}
        valueText={setThumbValueText(thumbs.supremum.value)}
        renderValueText={renderThumbValueText}
      />
    );
  };

  const renderSegments = () => {
    if (segments.length === 0) return null;

    return (
      <div
        aria-hidden="true"
        className={classes?.segments}
        data-slot={Slots.Segments}
      >
        {segments.map(({ length, label }, idx) => (
          <Segment
            key={String(length) + String(idx) + String(label)}
            orientation={orientation}
            index={idx}
            label={label}
            length={length}
            onSegmentLabelClick={handleSegmentLabelClick}
            classes={{
              root: classes?.segment,
              mark: classes?.segmentMark,
              label: classes?.segmentLabel,
            }}
          />
        ))}
      </div>
    );
  };

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
      style={{ ...(inlineStyle ?? {}), position: "relative", direction: "ltr" }}
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
        {renderSegments()}
      </div>
      {renderInfimumThumb()}
      {renderSupremumThumb()}
    </div>
  );
};

const InputSlider = componentWithForwardedRef(InputSliderBase, "InputSlider");

export default InputSlider;
