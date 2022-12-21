import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  computeAccessibleName,
  useButtonBase,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import ExpandableContext from "../context";
import {
  ContentRoot as ContentRootSlot,
  Root as RootSlot,
  TriggerRoot as TriggerRootSlot
} from "../slots";

interface TriggerBaseProps {
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

export type TriggerProps = Omit<
  MergeElementProps<"div", TriggerBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const ExpandableTriggerBase = (
  props: TriggerProps,
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
    expandableCtx?.handleExpandChange(!expandableCtx.isExpanded);
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

    const parent = node.closest(`[data-slot="${RootSlot}"]`);
    if (!parent) return;

    const content = parent.querySelector<HTMLDivElement>(
      `[data-slot="${ContentRootSlot}"]`
    );
    if (!content) return;

    const panelId = content.id;
    panelId && node.setAttribute("aria-controls", panelId);

    const accessibleName = computeAccessibleName(node);

    if (!accessibleName) {
      // eslint-disable-next-line no-console
      console.error(
        [
          "[StylelessUI][Expandable.Trigger]: Can't determine an accessible name.",
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

  return (
    <div
      {...otherProps}
      id={id}
      data-slot={TriggerRootSlot}
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

const ExpandableTrigger = componentWithForwardedRef(ExpandableTriggerBase);

export default ExpandableTrigger;
