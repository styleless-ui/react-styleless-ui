import * as React from "react";
import { RadioGroupContext } from "../RadioGroup/context";
import { getLabelInfo } from "../internals";
import type { Classes, MergeElementProps } from "../typings";
import {
  SystemError,
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
  useHandleTargetLabelClick,
} from "../utils";
import { CheckIcon } from "./components";
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

type OwnProps = {
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
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "className"
>;

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
    throw new SystemError(
      [
        "The `value` property is missing.",
        "It's mandatory to provide a `value` property " +
          "when <RadioGroup /> is a wrapper for <Radio />.",
      ].join("\n"),
      "Radio",
    );
  }

  const groupCtx = radioGroupCtx
    ? {
        value: radioGroupCtx.value,
        onChange: radioGroupCtx.onChange,
        items: radioGroupCtx.radios,
      }
    : null;

  const checkBase = useCheckBase({
    value,
    groupCtx,
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

  const labelProps = getLabelInfo(label, "Radio");

  const classesCtx: ClassesContext = {
    disabled,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classes =
    typeof classesMap === "function" ? classesMap(classesCtx) : classesMap;

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);

    if (!node) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    radioGroupCtx?.registerRadio(value!, rootRef);
    if (!radioGroupCtx) node.tabIndex = disabled ? -1 : 0;
  };

  const renderIcon = () => {
    if (!checkBase.checked) return null;

    return (
      <CheckIcon
        className={classes?.check}
        slot={Slots.Check}
        checkComponent={checkComponent}
      />
    );
  };

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <label
        id={visibleLabelId}
        data-slot={Slots.Label}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </label>
    );
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-disabled": classesCtx.disabled ? "" : undefined,
    "data-focus-visible": classesCtx.focusedVisible ? "" : undefined,
    "data-checked": classesCtx.checked ? "" : undefined,
  };

  useHandleTargetLabelClick({
    visibleLabelId,
    labelInfo: labelProps,
    onClick: () => checkBase.controllerRef.current?.click(),
  });

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
        {renderIcon()}
      </button>
      {renderLabel()}
    </>
  );
};

const Radio = componentWithForwardedRef(RadioBase, "Radio");

export default Radio;
