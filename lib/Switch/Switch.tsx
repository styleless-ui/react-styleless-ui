import * as React from "react";
import { getLabelInfo } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import * as Slots from "./slots";

export type RenderProps = {
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

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * The label of the switch.
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
         * Identifies the element (or elements) that labels the switch.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * If `true`, the switch will be focused automatically.
   *
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the switch will be checked.
   *
   * @default false
   */
  checked?: boolean;
  /**
   * The default state of `checked`. Use when the component is not controlled.
   *
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the switch will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * A value to replace `tabIndex` with.
   */
  overrideTabIndex?: number;
  /**
   * The Callback is fired when the state changes.
   */
  onCheckedChange?: (checkedState: boolean) => void;
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "onChange" | "onChangeCapture"
>;

const SwitchBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    label,
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    defaultChecked,
    checked: checkedProp,
    overrideTabIndex,
    autoFocus = false,
    disabled = false,
    onCheckedChange,
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
    selectMode: "multiple",
    togglable: true,
    getGroupElement: () => null,
    getGroupItems: () => [],
    onChange: onCheckedChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  });

  const id = useDeterministicId(idProp, "styleless-ui__switch");

  const handleRef = useForkedRefs(ref, checkBase.handleControllerRef);

  const labelInfo = getLabelInfo(label, "Switch", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const renderProps: RenderProps = {
    disabled,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-disabled": classNameProps.disabled ? "" : undefined,
    "data-focus-visible": classNameProps.focusedVisible ? "" : undefined,
    "data-checked": classNameProps.checked ? "" : undefined,
  };

  let tabIndex = disabled ? -1 : 0;

  if (typeof overrideTabIndex !== "undefined") tabIndex = overrideTabIndex;

  return (
    <button
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={disabled ? "" : undefined}
      id={id}
      role="switch"
      className={className}
      type="button"
      tabIndex={tabIndex}
      ref={handleRef}
      disabled={disabled}
      onFocus={checkBase.handleFocus}
      onBlur={checkBase.handleBlur}
      onKeyDown={checkBase.handleKeyDown}
      onKeyUp={checkBase.handleKeyUp}
      onClick={checkBase.handleClick}
      aria-checked={checkBase.checked}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      {...dataAttrs}
    >
      {children}
    </button>
  );
};

const Switch = componentWithForwardedRef(SwitchBase, "Switch");

export default Switch;
