import * as React from "react";
import { CheckGroupContext } from "../CheckGroup/context";
import { SystemError, getLabelInfo, logger } from "../internals";
import type { ClassesWithRenderContext, MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  useCheckBase,
  useDeterministicId,
  useForkedRefs,
  useHandleTargetLabelClick,
} from "../utils";
import { CheckIcon, IndeterminateIcon } from "./components";
import * as Slots from "./slots";

export type ClassNameProps = {
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

type OwnProps = {
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ClassesWithRenderContext<
    "root" | "label" | "check",
    ClassNameProps
  >;
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
  "defaultValue" | "className"
>;

const CheckboxBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    label,
    value,
    checkComponent,
    id: idProp,
    classes: classesMap,
    overrideTabIndex,
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
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  });

  const id = useDeterministicId(idProp, "styleless-ui__checkbox");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const handleRef = useForkedRefs(ref, rootRef, checkBase.handleControllerRef);

  const labelProps = getLabelInfo(label, "Checkbox");

  const classesCtx: ClassNameProps = {
    disabled,
    indeterminated,
    checked: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classes =
    typeof classesMap === "function" ? classesMap(classesCtx) : classesMap;

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

  const renderIcon = () => {
    if (checkBase.checked) {
      return (
        <CheckIcon
          className={classes?.check}
          slot={Slots.Check}
          checkComponent={checkComponent}
        />
      );
    }

    if (indeterminated) {
      return (
        <IndeterminateIcon
          className={classes?.check}
          slot={Slots.Check}
          checkComponent={checkComponent}
        />
      );
    }

    return null;
  };

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
    "data-disabled": classesCtx.disabled ? "" : undefined,
    "data-focus-visible": classesCtx.focusedVisible ? "" : undefined,
    "data-checked": classesCtx.checked ? "" : undefined,
  };

  useHandleTargetLabelClick({
    visibleLabelId,
    labelInfo: labelProps,
    onClick: () => checkBase.controllerRef.current?.click(),
  });

  let tabIndex = disabled ? -1 : 0;

  if (typeof overrideTabIndex !== "undefined") tabIndex = overrideTabIndex;

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
        tabIndex={tabIndex}
        type="button"
        role="checkbox"
        aria-label={labelProps.srOnlyLabel}
        aria-checked={
          indeterminated && !checkBase.checked ? "mixed" : checkBase.checked
        }
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

const Checkbox = componentWithForwardedRef(CheckboxBase, "Checkbox");

export default Checkbox;
