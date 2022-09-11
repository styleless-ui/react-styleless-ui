import * as React from "react";
import CheckGroupContext from "../CheckGroup/context";
import { type ClassesMap, type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useEventListener,
  useForkedRefs
} from "../utils";

type CheckboxClassesMap = ClassesMap<"root" | "label" | "check", never>;

type ClassesContext = {
  /** The `checked` state of the checkbox. */
  checked: boolean;
  /** The `disabled` state of the checkbox. */
  disabled: boolean;
  /** The `:focus-visible` of the checkbox. */
  focusedVisible: boolean;
};

interface CheckboxBaseProps {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ((ctx: ClassesContext) => CheckboxClassesMap) | CheckboxClassesMap;
  /**
   * The label of the checkbox.
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
         * Identifies the element (or elements) that labels the checkbox.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * The value of the checkbox. Use when it is a CheckGroup's child.
   */
  value?: string;
  /**
   * If `true`, the checkbox will be focused automatically.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the checkbox will be checked.
   * @default false
   */
  checked?: boolean;
  /**
   * The default state of `checked`. Use when the component is not controlled.
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the checkbox will be disabled.
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

export type CheckboxProps = Omit<
  MergeElementProps<"button", CheckboxBaseProps>,
  "defaultValue" | "className"
>;

const getLabelInfo = (labelInput: CheckboxProps["label"]) => {
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
          "[StylelessUI][Checkbox]: Invalid `label` property.",
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
    width={12}
    height={8}
    aria-hidden="true"
    focusable="false"
    className={className}
    viewBox="0 0 12 8"
  >
    <polyline
      fill="none"
      stroke="currentcolor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(5.974874, 2.353553) rotate(-45.000000) translate(-5.974874, -2.353553) "
      points="2 0.292893219 2 4.29289322 9.94974747 4.41421356"
    ></polyline>
  </svg>
);

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

const CheckboxBase = (
  props: CheckboxProps,
  ref: React.Ref<HTMLButtonElement>
) => {
  const {
    label,
    value,
    checkComponent,
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

  const checkGroupCtx = React.useContext(CheckGroupContext);

  if (checkGroupCtx && typeof value === "undefined") {
    throw new Error(
      [
        "[StylelessUI][Checkbox]: The `value` property is missing.",
        "It's mandatory to provide a `value` property " +
          "when <CheckGroup /> is a wrapper for <Checkbox />."
      ].join("\n")
    );
  }

  const checkBase = useCheckBase({
    value,
    autoFocus,
    disabled,
    checked: checkedProp,
    groupCtx: checkGroupCtx,
    defaultChecked,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp
  });

  const id = useDeterministicId(idProp, "styleless-ui__checkbox");
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
        role="checkbox"
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
        aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
      >
        {checkBase.checked &&
          (checkComponent ? (
            React.cloneElement(checkComponent, {
              className: mergeClasses(
                checkComponent.props.className,
                classes?.check
              )
            })
          ) : (
            <_DefaultCheck className={classes?.check} />
          ))}
      </button>
      {visibleLabel && (
        <span id={visibleLabelId} data-slot="label" className={classes?.label}>
          {visibleLabel}
        </span>
      )}
    </>
  );
};

const Checkbox = componentWithForwardedRef<
  HTMLButtonElement,
  CheckboxProps,
  typeof CheckboxBase
>(CheckboxBase);

export default Checkbox;
