import * as React from "react";
import { type ClassesMap, type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useEventListener,
  useForkedRefs
} from "../utils";

type SwitchClassesMap = ClassesMap<"root" | "label" | "thumb" | "track", never>;

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
  classes?: ((ctx: ClassesContext) => SwitchClassesMap) | SwitchClassesMap;
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
   * The value of the switch.
   */
  value?: string;
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
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
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

const mergeClasses = (
  ...classNames: Array<string | undefined>
): string | undefined =>
  classNames.reduce((result, className) => {
    if (typeof result === "undefined")
      return typeof className !== "undefined" ? className : undefined;
    else if (typeof className !== "undefined")
      return result + " " + className.trim();

    return result;
  }, undefined);

const SwitchBase = (props: SwitchProps, ref: React.Ref<HTMLButtonElement>) => {
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
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const checkBase = useCheckBase({
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

  const id = useDeterministicId(idProp, "styleless-ui__switch");
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
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot="switchLabel"
          className={classes?.label}
        >
          {visibleLabel}
        </span>
      )}
      <button
        {...otherProps}
        id={id}
        role="switch"
        className={classes?.root}
        type="button"
        tabIndex={disabled ? -1 : 0}
        ref={handleRef}
        data-slot="switchRoot"
        disabled={disabled}
        onFocus={checkBase.handleFocus}
        onBlur={checkBase.handleBlur}
        onKeyDown={checkBase.handleKeyDown}
        onKeyUp={checkBase.handleKeyUp}
        onClick={checkBase.handleClick}
        aria-checked={checkBase.checked}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
      >
        {React.cloneElement(trackComponent, {
          className: mergeClasses(
            trackComponent.props.className,
            classes?.track
          )
        })}
        {React.cloneElement(thumbComponent, {
          className: mergeClasses(
            thumbComponent.props.className,
            classes?.thumb
          )
        })}
      </button>
    </>
  );
};

const Switch = componentWithForwardedRef<
  HTMLButtonElement,
  SwitchProps,
  typeof SwitchBase
>(SwitchBase);

export default Switch;
