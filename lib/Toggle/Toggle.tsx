import * as React from "react";
import { ToggleGroupContext } from "../ToggleGroup/context";
import { SystemError, logger } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  useCheckBase,
  useForkedRefs,
} from "../utils";
import * as Slots from "./slots";

export type RenderProps = {
  disabled: boolean;
  active: boolean;
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
      }
    : null;

  const rootRef = React.useRef<HTMLButtonElement>(null);

  const checkBase = useCheckBase({
    value,
    autoFocus,
    disabled,
    checked: active,
    togglable: true,
    keyboardActivationBehavior: toggleGroupCtx?.keyboardActivationBehavior,
    selectMode: toggleGroupCtx?.multiple ? "multiple" : "single",
    defaultChecked: defaultActive,
    enterKeyFunctionality: "check",
    groupCtx,
    getGroupElement: () => rootRef.current?.closest("[role='group']") ?? null,
    getGroupItems: group =>
      Array.from(
        group.querySelectorAll<HTMLElement>(`[data-slot='${Slots.Root}']`),
      ),
    onChange: onActiveChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
  });

  const handleRef = useForkedRefs(ref, rootRef, checkBase.handleControllerRef);

  const renderProps: RenderProps = {
    disabled,
    active: checkBase.checked,
    focusedVisible: checkBase.isFocusedVisible,
  };

  const classNameProps: ClassNameProps = renderProps;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);

    if (!node) return;

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

  const calcTabIndex = () => {
    if (disabled) return -1;
    if (!toggleGroupCtx) return 0;
    if (toggleGroupCtx.multiple) return 0;

    const forcedTabableItem = toggleGroupCtx.forcedTabability;

    if (forcedTabableItem && forcedTabableItem === value) return 0;

    const isSelected = toggleGroupCtx.value === value;

    if (!isSelected) return -1;

    return 0;
  };

  const dataAttrs = {
    "data-slot": Slots.Root,
    "data-active": renderProps.active ? "" : undefined,
    "data-disable": renderProps.disabled ? "" : undefined,
    "data-entity": value,
    "data-focus-visible": renderProps.focusedVisible ? "" : undefined,
  };

  return (
    <button
      {...otherProps}
      className={className}
      tabIndex={calcTabIndex()}
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
