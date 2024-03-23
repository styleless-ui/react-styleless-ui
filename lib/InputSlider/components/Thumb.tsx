import * as React from "react";
import { disableUserSelectCSSProperties } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  useForkedRefs,
  useIsFocusVisible,
  useIsMounted,
  useIsomorphicLayoutEffect,
} from "../../utils";
import type { Orientation, ThumbInfo } from "../types";

export type RenderProps = {
  /**
   * The text associated with the `value` state.
   */
  valueText: string;
  /**
   * Determines whether it is focused-visible or not.
   */
  focusedVisible: boolean;
};

export type ClassNameProps = Omit<RenderProps, "valueText">;

export type SharedProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * A value to replace `tabIndex` with.
   */
  overrideTabIndex?: number;
  /**
   * If `true`, the thumb will be focused automatically.
   *
   * @default false
   */
  autoFocus?: boolean;
};

type OwnProps = SharedProps & {
  disabled: boolean;
  readOnly: boolean;
  orientation: Orientation;
  position: number;
  thumbInfo: ThumbInfo;
  valueText: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  | "defaultValue"
  | "defaultChecked"
  | "value"
  | "checked"
  | "onChange"
  | "onChangeCapture"
>;

const ThumbBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    className: classNameProp,
    children: childrenProp,
    style: styleProp,
    autoFocus = false,
    readOnly,
    overrideTabIndex,
    disabled,
    orientation,
    position,
    thumbInfo,
    valueText,
    onFocus,
    onBlur,
    ...otherProps
  } = props;

  const {
    index,
    maxValue,
    minValue,
    name,
    ref: thumbRef,
    state,
    value,
  } = thumbInfo;

  const { zIndex } = state;

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const isMounted = useIsMounted();

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible<HTMLDivElement>();

  const handleRootRef = useForkedRefs(ref, rootRef, thumbRef, focusVisibleRef);

  const [isFocusedVisible, setIsFocusedVisible] = React.useState(() =>
    disabled ? false : autoFocus,
  );

  if (disabled && isFocusedVisible) setIsFocusedVisible(false);

  React.useEffect(() => void (isFocusVisibleRef.current = isFocusedVisible));

  // Initial focus
  useIsomorphicLayoutEffect(() => {
    if (isFocusedVisible) rootRef.current?.focus();
  }, []);

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (disabled || !isMounted()) return;

    // Fix for https://github.com/facebook/react/issues/7769
    if (!rootRef.current) rootRef.current = event.currentTarget;

    handleFocusVisible(event);

    if (isFocusVisibleRef.current) setIsFocusedVisible(true);

    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (disabled || !isMounted()) return;

    handleBlurVisible(event);

    if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

    onBlur?.(event);
  };

  const renderProps: RenderProps = {
    valueText,
    focusedVisible: isFocusedVisible,
  };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    ...disableUserSelectCSSProperties,
    ...{
      horizontal: {
        supremum: { right: `${position}%` },
        infimum: { left: `${position}%` },
      },
      vertical: {
        supremum: { bottom: `${position}%` },
        infimum: { top: `${position}%` },
      },
    }[orientation][name],
    zIndex,
    position: "absolute",
    transform: `translate${orientation === "horizontal" ? "X" : "Y"}(${
      name === "infimum" ? -50 : 50
    }%)`,
  };

  let tabIndex = disabled ? -1 : 0;

  if (typeof overrideTabIndex !== "undefined") tabIndex = overrideTabIndex;

  return (
    <div
      {...otherProps}
      ref={handleRootRef}
      role="slider"
      style={style}
      className={className}
      tabIndex={tabIndex}
      onBlur={handleBlur}
      onFocus={handleFocus}
      aria-readonly={readOnly}
      aria-valuetext={valueText}
      aria-valuenow={value}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-disabled={disabled}
      aria-orientation={orientation}
      data-thumb-index={index}
      data-thumb-name={name}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-focus-visible={isFocusedVisible ? "" : undefined}
    >
      {children}
    </div>
  );
};

const Thumb = componentWithForwardedRef(ThumbBase, "InputSlider.Thumb");

export default Thumb;
