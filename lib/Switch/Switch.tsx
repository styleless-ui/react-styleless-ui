import useControlledProp from "@utilityjs/use-controlled-prop";
import useDeterministicId from "@utilityjs/use-deterministic-id";
import useEventListener from "@utilityjs/use-event-listener";
import useForkedRefs from "@utilityjs/use-forked-refs";
import useIsMounted from "@utilityjs/use-is-mounted";
import useIsomorphicLayoutEffect from "@utilityjs/use-isomorphic-layout-effect";
import cls from "classnames";
import * as React from "react";
import { type ClassesMap, type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  requestFormSubmit,
  useEventCallback,
  useIsFocusVisible
} from "../utils";

type SwitchClassesMap = ClassesMap<
  "root" | "label" | "controller",
  "thumb" | "track"
>;

type ClassesContext = {
  /** The `checked` state of the switch. */
  checked: boolean;
  /** The `disabled` state of the switch. */
  disabled: boolean;
  /** The `:focus-visible` of the switch. */
  focusedVisible: boolean;
};

interface SwitchBaseProps {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes: ((ctx: ClassesContext) => SwitchClassesMap) | SwitchClassesMap;
  /**
   * The label of the switch.
   */
  label:
    | string
    | {
        /**
         * The label to use as `aria-label` property.
         */
        screenReaderLabel: string;
      }
    | {
        /**
         * Identifies the element (or elements) that labels the switch.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * If `true`, the switch will be focused automatically.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the switch will be checked.
   * @default false
   */
  checked?: boolean;
  /**
   * The default state of `checked`. Use when the component is not controlled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the switch will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback fires when the state has changed.
   */
  onChange?: (checkedState: boolean) => void;
  /**
   * The component to be used as the thumb element.
   */
  thumbComponent: React.ReactElement<{ className?: string }>;
  /**
   * The component to be used as the track element.
   */
  trackComponent: React.ReactElement<{ className?: string }>;
}

export type SwitchProps = Omit<
  MergeElementProps<"button", SwitchBaseProps>,
  "defaultValue" | "className"
>;

const getLabelInfo = (labelInput: SwitchProps["label"]) => {
  const props: {
    visibleLabel?: string;
    srOnlyLabel?: string;
    labelledBy?: string;
  } = {};

  if (typeof labelInput === "string") {
    props.visibleLabel = labelInput;
  } else {
    if ("screenReaderLabel" in labelInput) {
      props.srOnlyLabel = labelInput.screenReaderLabel;
    } else if ("labelledBy" in labelInput) {
      props.labelledBy = labelInput.labelledBy;
    } else {
      throw new Error(
        [
          "[StylelessUI][Switch]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const SwitchBase = (props: SwitchProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    thumbComponent,
    trackComponent,
    id: idProp,
    classes: classesMap,
    defaultChecked,
    checked: checkedProp,
    autoFocus = false,
    disabled = false,
    onChange,
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const [checked, setChecked] = useControlledProp(
    checkedProp,
    defaultChecked,
    false
  );

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef
  } = useIsFocusVisible<HTMLButtonElement>();

  const controllerRef = React.useRef<HTMLButtonElement>();
  const handleControllerRef = useForkedRefs(controllerRef, focusVisibleRef);

  const spaceKeyDownRef = React.useRef(false);
  const enterKeyDownRef = React.useRef(false);

  const [isFocusedVisible, setIsFocusedVisible] = React.useState(() =>
    disabled ? false : autoFocus
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(
    () => void (disabled && isFocusedVisible && setIsFocusedVisible(false))
  );
  React.useEffect(() => void (isFocusVisibleRef.current = isFocusedVisible));

  // Initial focus
  useIsomorphicLayoutEffect(() => {
    if (isFocusedVisible) controllerRef.current?.focus();
  }, []);

  const emitChange = (newChecked: boolean) => {
    if (disabled || !isMounted()) return;

    setChecked(newChecked);
    onChange?.(newChecked);
  };

  const handleClick = useEventCallback<React.MouseEvent<HTMLButtonElement>>(
    event => {
      event.preventDefault();
      if (disabled || !isMounted()) return;

      emitChange(!checked);
    }
  );

  const handleFocus = useEventCallback<React.FocusEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      // Fix for https://github.com/facebook/react/issues/7769
      if (!controllerRef.current) controllerRef.current = event.currentTarget;

      handleFocusVisible(event);

      if (isFocusVisibleRef.current) setIsFocusedVisible(true);

      otherProps.onFocus?.(event);
    }
  );

  const handleBlur = useEventCallback<React.FocusEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      handleBlurVisible(event);

      if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

      otherProps.onBlur?.(event);
    }
  );

  const handleKeyDown = useEventCallback<
    React.KeyboardEvent<HTMLButtonElement>
  >(event => {
    if (disabled || !isMounted()) return;

    if (isFocusedVisible) {
      if (spaceKeyDownRef.current === false && event.key === " ")
        spaceKeyDownRef.current = true;
      if (
        enterKeyDownRef.current === false &&
        event.key.toLowerCase() === "enter"
      )
        enterKeyDownRef.current = true;
    }

    if (
      event.target === event.currentTarget &&
      [" ", "enter"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
    }

    otherProps.onKeyDown?.(event);
  });

  const handleKeyUp = useEventCallback<React.KeyboardEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      if (isFocusedVisible) {
        if (event.key === " ") spaceKeyDownRef.current = false;
        if (event.key.toLowerCase() === "enter")
          enterKeyDownRef.current = false;
      }

      otherProps.onKeyUp?.(event);

      if (event.target === event.currentTarget) {
        if (event.key === " ") emitChange(!checked);
        else if (event.key.toLowerCase() === "enter")
          requestFormSubmit(event.target);
      }
    }
  );

  const id = useDeterministicId(idProp, "styleless-ui__switch");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const classesCtx: ClassesContext = {
    checked,
    disabled,
    focusedVisible: isFocusedVisible
  };

  const classes =
    typeof classesMap === "function" ? classesMap(classesCtx) : classesMap;

  if (typeof document !== "undefined") {
    const labelTarget =
      labelProps.visibleLabel && visibleLabelId
        ? document.getElementById(visibleLabelId)
        : labelProps.labelledBy
        ? document.getElementById(labelProps.labelledBy)
        : null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener({
      target: labelTarget,
      eventType: "click",
      handler: () => {
        if (!labelProps.visibleLabel) controllerRef.current?.click();
        controllerRef.current?.focus();
      }
    });
  }

  return (
    <div className={classes.root} ref={ref}>
      {visibleLabel && (
        <label
          id={visibleLabelId}
          htmlFor={id}
          data-slot="label"
          className={classes.label}
        >
          {visibleLabel}
        </label>
      )}
      <button
        {...otherProps}
        id={id}
        role="switch"
        className={classes.controller}
        type="button"
        tabIndex={disabled ? -1 : 0}
        ref={handleControllerRef}
        data-slot="root"
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        aria-checked={checked}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={labelProps.labelledBy}
      >
        {React.cloneElement(trackComponent, {
          className: cls(trackComponent.props.className, classes.track)
        })}
        {React.cloneElement(thumbComponent, {
          className: cls(thumbComponent.props.className, classes.thumb)
        })}
      </button>
    </div>
  );
};

const Switch = componentWithForwardedRef<
  HTMLDivElement,
  SwitchProps,
  typeof SwitchBase
>(SwitchBase);

export default Switch;
