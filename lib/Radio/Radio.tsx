import * as React from "react";
import { RadioGroupContext } from "../RadioGroup/context";
import {
  SystemError,
  getLabelInfo,
  logger,
  resolvePropWithRenderContext,
} from "../internals";
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
   * The `checked` state of the radio.
   */
  checked: boolean;
  /**
   * The `readOnly` state of the radio.
   */
  readOnly: boolean;
  /**
   * The `disabled` state of the radio.
   */
  disabled: boolean;
  /**
   * The `:focus-visible` of the radio.
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
   * The label of the radio.
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
         * Identifies the element (or elements) that labels the radio.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * The value of the radio.
   *
   * Opt-in this prop when using with RadioGroup or
   * when using radio as a form control that has the `name` prop.
   *
   * Submitted with the form as part of a name/value pair.
   */
  value?: string;
  /**
   * If `true`, the radio will be focused automatically.
   *
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the radio will be checked.
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
   * If `true`, the radio will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the radio will be read-only.
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * A value to replace `tabIndex` with.
   */
  overrideTabIndex?: number;
  /**
   * The name of the form control when submitted.
   * Submitted with the form as part of a name/value pair.
   */
  name?: string;
  /**
   * The Callback is fired when the state changes.
   */
  onCheckedChange?: (checkedState: boolean) => void;
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "onChange" | "onChangeCapture"
>;

const RadioBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    label,
    value,
    name: nameProp,
    checked,
    defaultChecked,
    overrideTabIndex,
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    autoFocus = false,
    disabled = false,
    readOnly = false,
    onCheckedChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const radioGroupCtx = React.useContext(RadioGroupContext);

  if (radioGroupCtx) {
    if (typeof value === "undefined") {
      throw new SystemError(
        [
          "The `value` property is missing.",
          "It's mandatory to provide a `value` property " +
            "when <RadioGroup /> is a wrapper for <Radio />.",
        ].join("\n"),
        "Radio",
      );
    }

    if (typeof nameProp !== "undefined") {
      logger(
        "The `name` property shouldn't be set " +
          "when <RadioGroup /> is a wrapper for <Radio />. " +
          "Set the `name` property on the <RadioGroup /> instead.",
        { scope: "Radio", type: "warn" },
      );
    }

    if (
      typeof checked !== "undefined" ||
      typeof defaultChecked !== "undefined"
    ) {
      logger(
        "The `checked` or `defaultChecked` props shouldn't be set " +
          "when <RadioGroup /> is a wrapper for <Radio />. " +
          "Set the checked props on the <RadioGroup /> instead.",
        { scope: "Radio", type: "warn" },
      );
    }
  }

  const name = radioGroupCtx?.name != null ? radioGroupCtx.name : nameProp;

  const isDisabled =
    radioGroupCtx?.disabled != null ? radioGroupCtx.disabled : disabled;

  const isReadOnly =
    radioGroupCtx?.readOnly != null ? radioGroupCtx.readOnly : readOnly;

  const rootRef = React.useRef<HTMLButtonElement>(null);

  const checkBase = useCheckBase({
    value,
    groupCtx: radioGroupCtx,
    autoFocus,
    checked,
    defaultChecked,
    disabled: isDisabled,
    readOnly: isReadOnly,
    selectMode: "single",
    togglable: false,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    getGroupElement: () =>
      rootRef.current?.closest("[role='radiogroup']") ?? null,
    getGroupItems: group =>
      Array.from(
        group.querySelectorAll<HTMLElement>(`[data-slot='${Slots.Root}']`),
      ),
    onChange: onCheckedChange,
  });

  const id = useDeterministicId(idProp, "styleless-ui__radio");

  const handleRef = useForkedRefs(ref, rootRef, checkBase.handleControllerRef);

  const labelInfo = getLabelInfo(label, "Radio", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const renderProps: RenderProps = {
    disabled: isDisabled,
    readOnly: isReadOnly,
    checked: checkBase.checked as boolean,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classNameProps: ClassNameProps = renderProps;

  const children = resolvePropWithRenderContext(childrenProp, renderProps);
  const className = resolvePropWithRenderContext(classNameProp, classNameProps);

  const calcTabIndex = () => {
    if (typeof overrideTabIndex !== "undefined") return overrideTabIndex;
    if (isDisabled) return -1;
    if (!radioGroupCtx) return 0;

    const forcedTabableItem = radioGroupCtx.forcedTabability;

    if (forcedTabableItem && forcedTabableItem === value) return 0;

    const isSelected = radioGroupCtx.value === value;

    if (!isSelected) return -1;

    return 0;
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-disabled": isDisabled ? "" : undefined,
    "data-readonly": isReadOnly ? "" : undefined,
    "data-focus-visible": checkBase.isFocusedVisible ? "" : undefined,
    "data-checked": checkBase.checked ? "" : undefined,
    "data-entity": value,
  };

  const renderHiddenInput = () => {
    if (!name || !value || !checkBase.checked) return null;

    return (
      <input
        type="hidden"
        name={name}
        value={value}
        disabled={isDisabled}
      />
    );
  };

  return (
    <button
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={isDisabled ? "" : undefined}
      id={id}
      tabIndex={calcTabIndex()}
      role="radio"
      className={className}
      type="button"
      ref={handleRef}
      disabled={isDisabled}
      onFocus={checkBase.handleFocus}
      onBlur={checkBase.handleBlur}
      onKeyDown={checkBase.handleKeyDown}
      onKeyUp={checkBase.handleKeyUp}
      onClick={checkBase.handleClick}
      aria-checked={checkBase.checked}
      aria-readonly={isReadOnly}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      {...dataAttrs}
    >
      {children}
      {renderHiddenInput()}
    </button>
  );
};

const Radio = componentWithForwardedRef(RadioBase, "Radio");

export default Radio;
