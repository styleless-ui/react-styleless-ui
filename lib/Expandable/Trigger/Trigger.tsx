import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useButtonBase,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import ExpandableContext from "../context";

interface ExpandableTriggerBaseProps {
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

export type ExpandableTriggerProps = Omit<
  MergeElementProps<"div", ExpandableTriggerBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const ExpandableTriggerBase = (
  props: ExpandableTriggerProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    id: idProp,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onClick,
    ...otherProps
  } = props;

  const expandableCtx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-trigger");

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!expandableCtx) return onClick?.(event);

    expandableCtx.setIsExpanded(s => !s);
    onClick?.(event);
  };

  const buttonBase = useButtonBase({
    disabled,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onClick: handleClick
  });

  const handleRef = useForkedRefs(ref, buttonBase.handleButtonRef);

  const renderCtx = { disabled, focusedVisible: buttonBase.isFocusedVisible };

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  const refCallback = (node: HTMLDivElement | null) => {
    handleRef(node);
    if (!node) return;

    const parent = node.closest('[data-slot="expandableRoot"]');
    if (!parent) return;

    const panel = parent.querySelector<HTMLDivElement>(
      '[data-slot="expandablePanel"]'
    );
    if (!panel) return;

    const panelId = panel.id;
    panelId && node.setAttribute("aria-controls", panelId);
  };

  return (
    <div
      {...otherProps}
      id={id}
      data-slot="expandableTrigger"
      aria-disabled={disabled}
      aria-expanded={expandableCtx?.isExpanded}
      ref={refCallback}
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={className}
      onClick={buttonBase.handleClick}
      onBlur={buttonBase.handleBlur}
      onFocus={buttonBase.handleFocus}
      onKeyDown={buttonBase.handleKeyDown}
      onKeyUp={buttonBase.handleKeyUp}
    >
      {children}
    </div>
  );
};

const ExpandableTrigger = componentWithForwardedRef<
  HTMLDivElement,
  ExpandableTriggerProps,
  typeof ExpandableTriggerBase
>(ExpandableTriggerBase);

export default ExpandableTrigger;
