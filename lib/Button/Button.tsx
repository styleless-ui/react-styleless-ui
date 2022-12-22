import * as React from "react";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  getNodeName,
  useButtonBase,
  useDeterministicId,
  useForkedRefs
} from "../utils";
import * as Slots from "./slots";

interface RootBaseProps {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        disabled: boolean;
        focusedVisible: boolean;
      }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: { disabled: boolean; focusedVisible: boolean }) => string);
  /**
   * If `true`, the component will be disabled.
   * @default false
   */
  disabled?: boolean;
}

export type RootProps<T extends React.ElementType> = MergeElementProps<
  T,
  RootBaseProps & {
    /**
     * The component used for the root node.
     * Either a string to use a HTML element or a component.
     */
    as?: T;
  }
>;

const ButtonBase = <
  T extends React.ElementType = React.ElementType,
  E extends HTMLElement = HTMLElement
>(
  props: RootProps<T>,
  ref: React.Ref<E>
) => {
  const {
    className: classNameProp,
    children: childrenProp,
    id: idProp,
    as: RootNode = "button",
    onBlur,
    onFocus,
    onClick,
    onKeyDown,
    onKeyUp,
    autoFocus,
    disabled = false,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__button");

  const buttonBase = useButtonBase({
    onBlur,
    onClick,
    onFocus,
    onKeyDown,
    onKeyUp,
    autoFocus,
    disabled
  });

  const rootRef = React.useRef<HTMLElement>(null);
  const handleRef = useForkedRefs(ref, rootRef, buttonBase.handleButtonRef);

  const renderCtx = {
    disabled,
    focusedVisible: buttonBase.isFocusedVisible
  };

  const refCallback = (node: HTMLElement | null) => {
    handleRef(node);

    if (!node) return;

    const isNativeButton = getNodeName(node) === "button";
    if (!isNativeButton) {
      node.setAttribute("role", "button");
      node.setAttribute("aria-disabled", String(disabled));
    } else {
      (node as HTMLButtonElement).disabled = disabled;
    }

    const accessibleName = computeAccessibleName(node);

    if (!accessibleName) {
      // eslint-disable-next-line no-console
      console.error(
        [
          "[StylelessUI][Button]: Can't determine an accessible name.",
          "It's mandatory to provide an accessible name for the component. " +
            "Possible accessible names:",
          ". Set `aria-label` attribute.",
          ". Set `aria-labelledby` attribute.",
          ". Set `title` attribute.",
          ". Use an informative content.",
          ". Use a <label> with `for` attribute referencing to this component."
        ].join("\n")
      );
    }
  };

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  return (
    <RootNode
      id={id}
      ref={refCallback}
      className={className}
      tabIndex={disabled ? -1 : 0}
      autoFocus={autoFocus}
      onClick={buttonBase.handleClick}
      onBlur={buttonBase.handleBlur}
      onFocus={buttonBase.handleFocus}
      onKeyDown={buttonBase.handleKeyDown}
      onKeyUp={buttonBase.handleKeyUp}
      data-slot={Slots.Root}
      data-disabled={disabled ? "" : undefined}
      data-focus-visible={buttonBase.isFocusedVisible ? "" : undefined}
      {...otherProps}
    >
      {children}
    </RootNode>
  );
};

const Button = componentWithForwardedRef(ButtonBase);

export default Button;
