import * as React from "react";
import CheckGroupContext from "../CheckGroup/context";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import * as Slots from "./slots";

type CheckboxClassesMap = Classes<"root" | "label" | "check">;

type ClassesContext = {
  /** The `checked` state of the checkbox. */
  checked: boolean;
  /** The `disabled` state of the checkbox. */
  disabled: boolean;
  /** The `:focus-visible` of the checkbox. */
  focusedVisible: boolean;
};

interface RootOwnProps {
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
   * If `true`, the checkbox will appear indeterminate.
   * This does not set the native input element to indeterminate due to inconsistent behavior across browsers.
   * @default false;
   */
  indeterminated?: boolean;
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

export type RootProps = Omit<
  MergeElementProps<"button", RootOwnProps>,
  "defaultValue" | "className"
>;

const getLabelInfo = (labelInput: RootProps["label"]) => {
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
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      );
    }
  }

  return props;
};

const _DefaultCheckIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 12 8">
    <polyline
      fill="none"
      stroke="currentcolor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(5.974874, 2.353553) rotate(-45.000000) translate(-5.974874, -2.353553) "
      points="2 0.292893219 2 4.29289322 9.94974747 4.41421356"
    />
  </svg>
);

const _DefaultIndeterminateIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 12 8">
    <polyline
      fill="none"
      stroke="currentcolor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      points="2 4 10 4"
    />
  </svg>
);

const CheckboxBase = (props: RootProps, ref: React.Ref<HTMLButtonElement>) => {
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
    indeterminated = false,
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
          "when <CheckGroup /> is a wrapper for <Checkbox />.",
      ].join("\n"),
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
    onKeyUp,
  });

  const id = useDeterministicId(idProp, "styleless-ui__checkbox");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const handleRef = useForkedRefs(ref, checkBase.handleControllerRef);

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
    if (!indeterminated) return;

    const controls = node.getAttribute("aria-controls");

    if (controls) return;

    // eslint-disable-next-line no-console
    console.warn(
      "[StylelessUI][Checkbox]: You must provide the set of checkbox IDs controlled by the mixed (`indeterminate`) checkbox by the `aria-controls` property.",
    );
  };

  return (
    <>
      <button
        {...otherProps}
        id={id}
        className={classes?.root}
        ref={refCallback}
        disabled={disabled}
        onFocus={checkBase.handleFocus}
        onBlur={checkBase.handleBlur}
        onKeyDown={checkBase.handleKeyDown}
        onKeyUp={checkBase.handleKeyUp}
        onClick={checkBase.handleClick}
        tabIndex={disabled ? -1 : 0}
        type="button"
        role="checkbox"
        data-slot={Slots.Root}
        aria-label={labelProps.srOnlyLabel}
        aria-checked={
          indeterminated && !checkBase.checked ? "mixed" : checkBase.checked
        }
        aria-labelledby={
          labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
        }
      >
        {checkBase.checked ? (
          <div
            className={classes?.check}
            data-slot={Slots.Check}
            aria-hidden="true"
          >
            {checkComponent ?? <_DefaultCheckIcon />}
          </div>
        ) : indeterminated ? (
          <div
            className={classes?.check}
            data-slot={Slots.Check}
            aria-hidden="true"
          >
            {checkComponent ?? <_DefaultIndeterminateIcon />}
          </div>
        ) : null}
      </button>
      {labelProps.visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot={Slots.Label}
          className={classes?.label}
        >
          {labelProps.visibleLabel}
        </span>
      )}
    </>
  );
};

const Checkbox = componentWithForwardedRef(CheckboxBase);

export default Checkbox;
