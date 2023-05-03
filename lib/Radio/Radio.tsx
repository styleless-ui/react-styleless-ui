import * as React from "react";
import RadioGroupContext from "../RadioGroup/context";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import * as Slots from "./slots";

type RadioClassesMap = Classes<"root" | "label" | "check">;

type ClassesContext = {
  /** The `checked` state of the radio. */
  checked: boolean;
  /** The `disabled` state of the radio. */
  disabled: boolean;
  /** The `:focus-visible` of the radio. */
  focusedVisible: boolean;
};

interface OwnProps {
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
   * The Callback is fired when the state changes.
   */
  onChange?: (checkedState: boolean) => void;
  /**
   * The component to be used as the check element.
   */
  checkComponent?: React.ReactElement;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
}

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "className"
>;

const getLabelInfo = (labelInput: Props["label"]) => {
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
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      );
    }
  }

  return props;
};

const _DefaultCheck = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 8 8">
    <circle cx={4} cy={4} r={4} fill="currentColor" stroke="none" />
  </svg>
);

const RadioBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    label,
    value,
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

  const radioGroupCtx = React.useContext(RadioGroupContext);

  if (radioGroupCtx && typeof value === "undefined") {
    throw new Error(
      [
        "[StylelessUI][Radio]: The `value` property is missing.",
        "It's mandatory to provide a `value` property " +
          "when <RadioGroup /> is a wrapper for <Radio />.",
      ].join("\n"),
    );
  }

  const checkBase = useCheckBase({
    value,
    groupCtx: radioGroupCtx
      ? {
          value: radioGroupCtx.value,
          onChange: radioGroupCtx.onChange,
          items: radioGroupCtx.radios,
        }
      : undefined,
    strategy: "radio-control",
    autoFocus,
    disabled,
    checked: checkedProp,
    defaultChecked,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  });

  const id = useDeterministicId(idProp, "styleless-ui__radio");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const rootRef = React.useRef<HTMLButtonElement>(null);

  const handleRef = useForkedRefs(ref, rootRef, checkBase.handleControllerRef);

  const labelProps = getLabelInfo(label);

  const classesCtx: ClassesContext = {
    disabled,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classes =
    typeof classesMap === "function" ? classesMap(classesCtx) : classesMap;

  React.useEffect(() => {
    const labelTarget =
      labelProps.visibleLabel && visibleLabelId
        ? document.getElementById(visibleLabelId)
        : labelProps.labelledBy
        ? document.getElementById(labelProps.labelledBy)
        : null;

    if (!labelTarget) return;

    const handleTargetClick = () => checkBase.controllerRef.current?.click();

    labelTarget.addEventListener("click", handleTargetClick);

    return () => {
      labelTarget.removeEventListener("click", handleTargetClick);
    };
  }, [
    checkBase.controllerRef,
    labelProps.labelledBy,
    labelProps.visibleLabel,
    visibleLabelId,
  ]);

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);

    if (!node) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    radioGroupCtx?.registerRadio(value!, rootRef);
    if (!radioGroupCtx) node.tabIndex = disabled ? -1 : 0;
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-disabled": classesCtx.disabled ? "" : undefined,
    "data-focus-visible": classesCtx.focusedVisible ? "" : undefined,
    "data-checked": classesCtx.checked ? "" : undefined,
  };

  return (
    <>
      <button
        {...otherProps}
        id={id}
        role="radio"
        className={classes?.root}
        type="button"
        ref={refCallback}
        disabled={disabled}
        onFocus={checkBase.handleFocus}
        onBlur={checkBase.handleBlur}
        onKeyDown={checkBase.handleKeyDown}
        onKeyUp={checkBase.handleKeyUp}
        onClick={checkBase.handleClick}
        aria-checked={checkBase.checked}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={
          labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
        }
        {...dataAttrs}
      >
        {checkBase.checked && (
          <div
            className={classes?.check}
            data-slot={Slots.Check}
            aria-hidden="true"
          >
            {checkComponent ?? <_DefaultCheck />}
          </div>
        )}
      </button>
      {labelProps.visibleLabel && (
        <label
          id={visibleLabelId}
          data-slot={Slots.Label}
          className={classes?.label}
        >
          {labelProps.visibleLabel}
        </label>
      )}
    </>
  );
};

const Radio = componentWithForwardedRef(RadioBase);

export default Radio;
