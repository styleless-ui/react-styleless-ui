import * as React from "react";
import Button from "../../Button";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId
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
  const { children, className, id: idProp, onClick, ...otherProps } = props;

  const expandableCtx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-trigger");

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    expandableCtx?.handleExpandChange(!expandableCtx.isExpanded);
    onClick?.(event);
  };

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);
    if (!node) return;

    const parent = node.closest(`[data-slot="${RootSlot}"]`);
    if (!parent) return;

    const content = parent.querySelector<HTMLDivElement>(
      `[data-slot="${ContentRootSlot}"]`
    );
    if (!content) return;

    const panelId = content.id;
    panelId && node.setAttribute("aria-controls", panelId);
  };

  return (
    <Button
      {...otherProps}
      as="div"
      id={id}
      onClick={handleClick}
      ref={refCallback}
      className={className}
      data-slot={TriggerRootSlot}
      aria-expanded={expandableCtx?.isExpanded}
    >
      {children}
    </Button>
  );
};

const ExpandableTrigger = componentWithForwardedRef(ExpandableTriggerBase);

export default ExpandableTrigger;
