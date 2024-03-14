import * as React from "react";
import { SystemKeys, getLabelInfo } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  clamp,
  componentWithForwardedRef,
  contains,
  remap,
  useControlledProp,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
  useHandleTargetLabelClick,
  useIsFocusVisible,
  useIsMounted,
  useIsomorphicLayoutEffect,
} from "../utils";
import { SpinButtonContext, type SpinButtonContextValue } from "./context";
import { Root as RootSlot } from "./slots";

export type RenderProps = {
  value: number;
  percentageValue: number;
  valueText: string;
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * Determines whether it is focused-visible or not.
   */
  focusedVisible: boolean;
};

export type ClassNameProps = Pick<RenderProps, "disabled" | "focusedVisible">;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  min: number;
  max: number;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  setValueText: (value: number) => string;
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
};

export type Props = Omit<MergeElementProps<"div", OwnProps>, "defaultChecked">;

const SpinButtonBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    min,
    max,
    value: valueProp,
    defaultValue,
    className: classNameProp,
    children: childrenProp,
    label,
    disabled = false,
    autoFocus = false,
    setValueText,
    onValueChange,
    onKeyDown,
    onFocus,
    onBlur,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__spinbutton");
  const visibleLabelId = `${id}__label`;

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
    if (value === newValue) return;

    setValue(newValue);
    onValueChange?.(newValue);
  };

  const handleFocus = useEventCallback<React.FocusEvent<HTMLDivElement>>(
    event => {
      if (disabled || !isMounted()) return;

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
      if (disabled || !isMounted()) return;

      handleBlurVisible(event);

      if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

      onBlur?.(event);
    },
  );

  const handleIncrease = (step: number) => {
    if (disabled || isUpperBoundDisabled) return;

    const newValue = clamp(value + step, min, max);

    emitValueChange(newValue);
  };

  const handleDecrease = (step: number) => {
    if (disabled || isLowerBoundDisabled) return;

    const newValue = clamp(value - step, min, max);

    emitValueChange(newValue);
  };

  const handleKeyDown = useEventCallback<React.KeyboardEvent<HTMLDivElement>>(
    event => {
      if (!disabled) {
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
    percentageValue,
    disabled,
    focusedVisible: isFocusedVisible,
  };

  const classNameProps: ClassNameProps = {
    disabled,
    focusedVisible: isFocusedVisible,
  };

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  useHandleTargetLabelClick({
    visibleLabelId,
    labelInfo,
    onClick: () => void 0,
  });

  const context: SpinButtonContextValue = {
    disabled,
    isLowerBoundDisabled,
    isUpperBoundDisabled,
    handleDecrease,
    handleIncrease,
  };

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={disabled ? "" : undefined}
      role="spinbutton"
      ref={handleRootRef}
      className={className}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-disabled={disabled}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      data-slot={RootSlot}
      data-disabled={disabled ? "" : undefined}
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
