import * as React from "react";
import {
  SystemKeys,
  getLabelInfo,
  resolvePropWithRenderContext,
} from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  clamp,
  componentWithForwardedRef,
  contains,
  remap,
  useControlledProp,
  useEventCallback,
  useForkedRefs,
  useIsFocusVisible,
  useIsMounted,
  useIsomorphicLayoutEffect,
} from "../utils";
import { SpinButtonContext, type SpinButtonContextValue } from "./context";
import { Root as RootSlot } from "./slots";

export type RenderProps = {
  /**
   * The value of the component.
   */
  value: number;
  /**
   * The percentage value of the component.
   */
  percentageValue: number;
  /**
   * The text used to represent the value.
   */
  valueText: string;
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * The `readOnly` state of the component.
   */
  readOnly: boolean;
  /**
   * Determines whether it is focused-visible or not.
   */
  focusedVisible: boolean;
};

export type ClassNameProps = Pick<
  RenderProps,
  "disabled" | "readOnly" | "focusedVisible"
>;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * The minimum allowed value of the spin button.
   * Should not be greater than or equal to `max`.
   */
  min: number;
  /**
   * The maximum allowed value of the spin button.
   * Should not be less than or equal to `min`.
   */
  max: number;
  /**
   * The value of the component.
   */
  value?: number;
  /**
   * The default value. Use when the component's `value` state is not controlled.
   */
  defaultValue?: number;
  /**
   * If `true`, the component will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the component will be read-only.
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * If `true`, the component will be focused automatically.
   *
   * @default false
   */
  autoFocus?: boolean;
  /**
   * A function which returns a string value that provides a user-friendly name
   * for the current value of the component. This is important for screen reader users.
   */
  setValueText: (value: number) => string;
  /**
   * Callback is called when the value changes.
   */
  onValueChange?: (value: number) => void;
  /**
   * The label of the component.
   */
  label:
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
  /**
   * A value to replace `tabIndex` with.
   */
  overrideTabIndex?: number;
};

export type Props = Omit<MergeElementProps<"div", OwnProps>, "defaultChecked">;

const SpinButtonBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    min,
    max,
    value: valueProp,
    defaultValue,
    className: classNameProp,
    children: childrenProp,
    overrideTabIndex,
    label,
    disabled = false,
    autoFocus = false,
    readOnly = false,
    setValueText,
    onValueChange,
    onKeyDown,
    onFocus,
    onBlur,
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible<HTMLDivElement>();

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const handleRootRef = useForkedRefs(ref, rootRef, focusVisibleRef);

  const [isFocusedVisible, setIsFocusedVisible] = React.useState(() =>
    disabled ? false : autoFocus,
  );

  if (disabled && isFocusedVisible) setIsFocusedVisible(false);

  React.useEffect(() => void (isFocusVisibleRef.current = isFocusedVisible));

  // Initial focus
  useIsomorphicLayoutEffect(() => {
    if (isFocusedVisible) rootRef.current?.focus();
  }, []);

  const [value, setValue] = useControlledProp(valueProp, defaultValue, min);

  const labelInfo = getLabelInfo(label, "SpinButton", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const valueText = setValueText(value);
  const percentageValue = remap(value, min, max, 0, 100);

  const isUpperBoundDisabled = value >= max;
  const isLowerBoundDisabled = value <= min;

  const emitValueChange = (newValue: number) => {
    if (readOnly || disabled) return;
    if (value === newValue) return;

    setValue(newValue);
    onValueChange?.(newValue);
  };

  const handleFocus = useEventCallback<React.FocusEvent<HTMLDivElement>>(
    event => {
      if (disabled || !isMounted()) {
        event.preventDefault();

        return;
      }

      // Fix for https://github.com/facebook/react/issues/7769
      if (!rootRef.current) rootRef.current = event.currentTarget;

      if (
        event.target !== event.currentTarget &&
        contains(event.currentTarget, event.target)
      ) {
        event.currentTarget.focus();
      }

      handleFocusVisible(event);

      if (isFocusVisibleRef.current) setIsFocusedVisible(true);

      onFocus?.(event);
    },
  );

  const handleBlur = useEventCallback<React.FocusEvent<HTMLDivElement>>(
    event => {
      if (disabled || !isMounted()) {
        event.preventDefault();

        return;
      }

      handleBlurVisible(event);

      if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

      onBlur?.(event);
    },
  );

  const handleIncrease = (step: number) => {
    if (readOnly || disabled || isUpperBoundDisabled) return;

    const newValue = clamp(value + step, min, max);

    emitValueChange(newValue);
  };

  const handleDecrease = (step: number) => {
    if (readOnly || disabled || isLowerBoundDisabled) return;

    const newValue = clamp(value - step, min, max);

    emitValueChange(newValue);
  };

  const handleKeyDown = useEventCallback<React.KeyboardEvent<HTMLDivElement>>(
    event => {
      if (disabled) {
        event.preventDefault();

        return;
      }

      if (!readOnly) {
        switch (event.key) {
          case SystemKeys.UP: {
            event.preventDefault();

            handleIncrease(1);

            break;
          }

          case SystemKeys.DOWN: {
            event.preventDefault();

            handleDecrease(1);

            break;
          }

          case SystemKeys.PAGE_UP: {
            event.preventDefault();

            handleIncrease(5);

            break;
          }

          case SystemKeys.PAGE_DOWN: {
            event.preventDefault();

            handleDecrease(5);

            break;
          }

          case SystemKeys.HOME: {
            event.preventDefault();

            emitValueChange(min);

            break;
          }

          case SystemKeys.END: {
            event.preventDefault();

            emitValueChange(max);

            break;
          }

          default: {
            break;
          }
        }
      }

      onKeyDown?.(event);
    },
  );

  const renderProps: RenderProps = {
    value,
    valueText,
    disabled,
    readOnly,
    percentageValue,
    focusedVisible: isFocusedVisible,
  };

  const classNameProps: ClassNameProps = {
    disabled,
    readOnly,
    focusedVisible: isFocusedVisible,
  };

  const children = resolvePropWithRenderContext(childrenProp, renderProps);
  const className = resolvePropWithRenderContext(classNameProp, classNameProps);

  const context: SpinButtonContextValue = {
    disabled,
    readOnly,
    isLowerBoundDisabled,
    isUpperBoundDisabled,
    handleDecrease,
    handleIncrease,
  };

  let tabIndex = disabled ? -1 : 0;

  if (typeof overrideTabIndex !== "undefined") tabIndex = overrideTabIndex;

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={disabled ? "" : undefined}
      role="spinbutton"
      ref={handleRootRef}
      className={className}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-disabled={disabled}
      aria-readonly={readOnly}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      data-slot={RootSlot}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-focus-visible={isFocusedVisible ? "" : undefined}
    >
      <SpinButtonContext.Provider value={context}>
        {children}
      </SpinButtonContext.Provider>
    </div>
  );
};

const SpinButton = componentWithForwardedRef(SpinButtonBase, "SpinButton");

export default SpinButton;
