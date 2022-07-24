import useDeterministicId from "@utilityjs/use-deterministic-id";
import useEventListener from "@utilityjs/use-event-listener";
import useForkedRefs from "@utilityjs/use-forked-refs";
import cls from "classnames";
import * as React from "react";
import { type ClassesMap, type MergeElementProps } from "../typings.d";
import { componentWithForwardedRef, useCheckBase } from "../utils";

type RadioClassesMap = ClassesMap<"root" | "label" | "check", never>;

type ClassesContext = {
  /** The `checked` state of the radio. */
  checked: boolean;
  /** The `disabled` state of the radio. */
  disabled: boolean;
  /** The `:focus-visible` of the radio. */
  focusedVisible: boolean;
};

interface RadioBaseProps {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ((ctx: ClassesContext) => RadioClassesMap) | RadioClassesMap;
  /**
   * The label of the radio.
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
         * Identifies the element (or elements) that labels the radio.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * The value of the radio.
   */
  value?: string;
  /**
   * If `true`, the radio will be focused automatically.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the radio will be checked.
   * @default false
   */
  checked?: boolean;
  /**
   * The default state of `checked`. Use when the component is not controlled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the radio will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback fires when the state has changed.
   */
  onChange?: (checkedState: boolean) => void;
  /**
   * The component to be used as the check element.
   */
  checkComponent?: React.ReactElement<{ className?: string }>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
}

export type RadioProps = Omit<
  MergeElementProps<"button", RadioBaseProps>,
  "defaultValue" | "className"
>;

const getLabelInfo = (labelInput: RadioProps["label"]) => {
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
          "[StylelessUI][Radio]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const _DefaultCheck = ({ className }: { className?: string }) => (
  <svg
    width={8}
    height={8}
    aria-hidden="true"
    focusable="false"
    className={className}
    viewBox="0 0 8 8"
  >
    <circle cx={4} cy={4} r={4} fill="currentColor" stroke="none" />
  </svg>
);

const RadioBase = (props: RadioProps, ref: React.Ref<HTMLButtonElement>) => {
  const {
    label,
    checkComponent,
    defaultChecked,
    id: idProp,
    classes: classesMap,
    checked: checkedProp,
    autoFocus = false,
    disabled = false,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const checkBase = useCheckBase({
    strategy: "radio-control",
    autoFocus,
    disabled,
    checked: checkedProp,
    defaultChecked,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp
  });

  const id = useDeterministicId(idProp, "styleless-ui__radio");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const handleRef = useForkedRefs(ref, checkBase.handleControllerRef);

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const classesCtx: ClassesContext = {
    disabled,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible
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
        if (!labelProps.visibleLabel) checkBase.controllerRef.current?.click();
        checkBase.controllerRef.current?.focus();
      }
    });
  }

  return (
    <>
      <button
        {...otherProps}
        id={id}
        role="radio"
        className={classes?.root}
        type="button"
        tabIndex={disabled ? -1 : 0}
        ref={handleRef}
        data-slot="root"
        disabled={disabled}
        onFocus={checkBase.handleFocus}
        onBlur={checkBase.handleBlur}
        onKeyDown={checkBase.handleKeyDown}
        onKeyUp={checkBase.handleKeyUp}
        onClick={checkBase.handleClick}
        aria-checked={checkBase.checked}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={labelProps.labelledBy}
      >
        {checkBase.checked &&
          (checkComponent ? (
            React.cloneElement(checkComponent, {
              className: cls(checkComponent.props.className, classes?.check)
            })
          ) : (
            <_DefaultCheck className={classes?.check} />
          ))}
      </button>
      {visibleLabel && (
        <label
          id={visibleLabelId}
          htmlFor={id}
          data-slot="label"
          className={classes?.label}
        >
          {visibleLabel}
        </label>
      )}
    </>
  );
};

const Radio = componentWithForwardedRef<
  HTMLButtonElement,
  RadioProps,
  typeof RadioBase
>(RadioBase);

export default Radio;
