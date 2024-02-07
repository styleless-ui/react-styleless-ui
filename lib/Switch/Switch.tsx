import * as React from "react";
import { getLabelInfo } from "../internals";
import type { ClassesWithRenderContext, MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
  useHandleTargetLabelClick,
} from "../utils";
import * as Slots from "./slots";

export type ClassNameProps = {
  /**
   * The `checked` state of the switch.
   */
  checked: boolean;
  /**
   * The `disabled` state of the switch.
   */
  disabled: boolean;
  /**
   * The `:focus-visible` of the switch.
   */
  focusedVisible: boolean;
};

type OwnProps = {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ClassesWithRenderContext<
    "root" | "label" | "thumb" | "track",
    ClassNameProps
  >;
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
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "className"
>;

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
    groupCtx: null,
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

  const labelProps = getLabelInfo(label, "Switch");

  const classNameProps: ClassNameProps = {
    disabled,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classes =
    typeof classesMap === "function" ? classesMap(classNameProps) : classesMap;

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={Slots.Label}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-disabled": classNameProps.disabled ? "" : undefined,
    "data-focus-visible": classNameProps.focusedVisible ? "" : undefined,
    "data-checked": classNameProps.checked ? "" : undefined,
  };

  useHandleTargetLabelClick({
    visibleLabelId,
    labelInfo: labelProps,
    onClick: () => checkBase.controllerRef.current?.click(),
  });

  return (
    <>
      {renderLabel()}
      <button
        {...otherProps}
        id={id}
        role="switch"
        className={classes?.root}
        type="button"
        tabIndex={disabled ? -1 : 0}
        ref={handleRef}
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

const Switch = componentWithForwardedRef(SwitchBase, "Switch");

export default Switch;
