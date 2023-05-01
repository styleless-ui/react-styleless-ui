import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import * as Slots from "./slots";

type SwitchClassesMap = Classes<"root" | "label" | "thumb" | "track">;

type ClassesContext = {
  /** The `checked` state of the switch. */
  checked: boolean;
  /** The `disabled` state of the switch. */
  disabled: boolean;
  /** The `:focus-visible` of the switch. */
  focusedVisible: boolean;
};

interface OwnProps {
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
   * The Callback is fired when the state changes.
   */
  onChange?: (checkedState: boolean) => void;
  /**
   * The component to be used as the thumb element.
   */
  thumbComponent: React.ReactElement;
  /**
   * The component to be used as the track element.
   */
  trackComponent: React.ReactElement;
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
          "[StylelessUI][Switch]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      );
    }
  }

  return props;
};

const SwitchBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
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
    onKeyUp,
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

  return (
    <>
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot={Slots.Label}
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
        data-slot={Slots.Root}
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
        <div
          className={classes?.track}
          data-slot={Slots.Track}
          aria-hidden="true"
        >
          {trackComponent}
        </div>
        <div
          className={classes?.thumb}
          data-slot={Slots.Thumb}
          aria-hidden="true"
        >
          {thumbComponent}
        </div>
      </button>
    </>
  );
};

const Switch = componentWithForwardedRef(SwitchBase);

export default Switch;
