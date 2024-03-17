import * as React from "react";
import { CheckGroupContext } from "../CheckGroup/context";
import { SystemError, getLabelInfo, logger } from "../internals";
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
   * The `checked` state of the checkbox.
   */
  checked: boolean;
  /**
   * The `disabled` state of the checkbox.
   */
  disabled: boolean;
  /**
   * The `indeterminated` state of the checkbox.
   */
  indeterminated: boolean;
  /**
   * The `:focus-visible` of the checkbox.
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
   * The label of the checkbox.
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
  onCheckedChange?: (checkedState: boolean) => void;
  /**
   * A value to replace `tabIndex` with.
   */
  overrideTabIndex?: number;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "onChange"
>;

const CheckboxBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    label,
    value,
    children: childrenProp,
    id: idProp,
    className: classNameMap,
    overrideTabIndex,
    defaultChecked,
    checked: checkedProp,
    autoFocus = false,
    disabled = false,
    indeterminated = false,
    onCheckedChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const checkGroupCtx = React.useContext(CheckGroupContext);

  if (checkGroupCtx && typeof value === "undefined") {
    throw new SystemError(
      [
        "The `value` property is missing.",
        "It's mandatory to provide a `value` property " +
          "when <CheckGroup /> is a wrapper for <Checkbox />.",
      ].join("\n"),
      "Checkbox",
    );
  }

  const rootRef = React.useRef<HTMLButtonElement>(null);

  const checkBase = useCheckBase({
    value,
    autoFocus,
    disabled,
    checked: checkedProp,
    groupCtx: checkGroupCtx,
    defaultChecked,
    selectMode: "multiple",
    togglable: true,
    getGroupElement: () => rootRef.current?.closest("[role='group']") ?? null,
    getGroupItems: group =>
      Array.from(
        group.querySelectorAll<HTMLElement>(`[data-slot='${Slots.Root}']`),
      ),
    onChange: onCheckedChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  });

  const id = useDeterministicId(idProp, "styleless-ui__checkbox");

  const handleRef = useForkedRefs(ref, rootRef, checkBase.handleControllerRef);

  const labelInfo = getLabelInfo(label, "Checkbox", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const renderProps: RenderProps = {
    disabled,
    indeterminated,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameMap === "function"
      ? classNameMap(classNameProps)
      : classNameMap;

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);

    if (!node) return;
    if (!indeterminated) return;

    const controls = node.getAttribute("aria-controls");

    if (controls) return;

    logger(
      "You must provide the set of checkbox IDs controlled by the mixed " +
        "(`indeterminate`) checkbox by the `aria-controls` property.",
      { scope: "Checkbox", type: "warn" },
    );
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-disabled": disabled ? "" : undefined,
    "data-indeterminated": indeterminated ? "" : undefined,
    "data-focus-visible": checkBase.isFocusedVisible ? "" : undefined,
    "data-checked": checkBase.checked ? "" : undefined,
  };

  let tabIndex = disabled ? -1 : 0;

  if (typeof overrideTabIndex !== "undefined") tabIndex = overrideTabIndex;

  return (
    <button
      {...otherProps}
      id={id}
      className={className}
      ref={refCallback}
      disabled={disabled}
      onFocus={checkBase.handleFocus}
      onBlur={checkBase.handleBlur}
      onKeyDown={checkBase.handleKeyDown}
      onKeyUp={checkBase.handleKeyUp}
      onClick={checkBase.handleClick}
      tabIndex={tabIndex}
      type="button"
      role="checkbox"
      aria-checked={
        indeterminated && !checkBase.checked ? "mixed" : checkBase.checked
      }
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      {...dataAttrs}
    >
      {children}
    </button>
  );
};

const Checkbox = componentWithForwardedRef(CheckboxBase, "Checkbox");

export default Checkbox;
