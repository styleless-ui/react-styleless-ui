import * as React from "react";
import { ToggleGroupContext } from "../ToggleGroup/context";
import { SystemError, logger } from "../internals";
import type { MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  useCheckBase,
  useForkedRefs,
} from "../utils";
import * as Slots from "./slots";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        disabled: boolean;
        active: boolean;
        focusedVisible: boolean;
      }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: {
        disabled: boolean;
        active: boolean;
        focusedVisible: boolean;
      }) => string);
  /**
   * The value of the toggle. Use when it is a ToggleGroup's child.
   */
  value?: string;
  /**
   * If `true`, the toggle will be focused automatically.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * If `true`, the toggle will be active.
   * @default false
   */
  active?: boolean;
  /**
   * The default state of `active`. Use when the component is not controlled.
   * @default false
   */
  defaultActive?: boolean;
  /**
   * If `true`, the toggle will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback is fired when the state of `active` changes.
   */
  onActiveChange?: (activeState: boolean) => void;
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const ToggleBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    value,
    children: childrenProp,
    className: classNameProp,
    defaultActive,
    active,
    autoFocus = false,
    disabled = false,
    onActiveChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const toggleGroupCtx = React.useContext(ToggleGroupContext);

  if (toggleGroupCtx && typeof value === "undefined") {
    throw new SystemError(
      [
        "The `value` property is missing.",
        "It's mandatory to provide a `value` property " +
          "when <ToggleGroup /> is a wrapper for <Toggle />.",
      ].join("\n"),
      "Toggle",
    );
  }

  const groupCtx = toggleGroupCtx
    ? {
        value: toggleGroupCtx.value,
        onChange: toggleGroupCtx.onChange,
        items: toggleGroupCtx.toggles,
      }
    : null;

  const checkBase = useCheckBase({
    value,
    autoFocus,
    disabled,
    checked: active,
    toggle: true,
    keyboardActivationBehavior: toggleGroupCtx?.keyboardActivationBehavior,
    strategy: toggleGroupCtx?.multiple ? "check-control" : "radio-control",
    defaultChecked: defaultActive,
    enterKeyFunctionality: "check",
    groupCtx,
    onChange: onActiveChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  });

  const rootRef = React.useRef<HTMLButtonElement>(null);
  const handleRef = useForkedRefs(ref, rootRef, checkBase.handleControllerRef);

  const renderCtx = {
    disabled,
    active: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);

    if (!node) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    toggleGroupCtx?.registerToggle(value!, rootRef);
    if (!toggleGroupCtx) node.tabIndex = disabled ? -1 : 0;

    const accessibleName = computeAccessibleName(node);

    if (!accessibleName) {
      logger(
        [
          "Can't determine an accessible name.",
          "It's mandatory to provide an accessible name for the component. " +
            "Possible accessible names:",
          ". Set `aria-label` attribute.",
          ". Set `aria-labelledby` attribute.",
          ". Set `title` attribute.",
          ". Use an informative content.",
          ". Use a <label> with `for` attribute referencing to this component.",
        ].join("\n"),
        { scope: "Toggle", type: "error" },
      );
    }
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-active": renderCtx.active ? "" : undefined,
    "data-disable": renderCtx.disabled ? "" : undefined,
    "data-focus-visible": renderCtx.focusedVisible ? "" : undefined,
  };

  return (
    <button
      {...otherProps}
      className={className}
      type="button"
      ref={refCallback}
      disabled={disabled}
      onFocus={checkBase.handleFocus}
      onBlur={checkBase.handleBlur}
      onKeyDown={checkBase.handleKeyDown}
      onKeyUp={checkBase.handleKeyUp}
      onClick={checkBase.handleClick}
      aria-pressed={checkBase.checked}
      {...dataAttrs}
    >
      {children}
    </button>
  );
};

const Toggle = componentWithForwardedRef(ToggleBase, "Toggle");

export default Toggle;
