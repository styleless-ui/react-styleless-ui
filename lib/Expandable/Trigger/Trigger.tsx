import * as React from "react";
import Button, { type ButtonProps as ButtonProps } from "../../Button";
import type { PolymorphicProps } from "../../typings";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
} from "../../utils";
import ExpandableContext from "../context";
import {
  ContentRoot as ContentRootSlot,
  Root as RootSlot,
  TriggerRoot as TriggerRootSlot,
} from "../slots";

interface OwnProps {
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
}

export type Props<E extends React.ElementType> = PolymorphicProps<E, OwnProps>;

const ExpandableTriggerBase = <
  E extends React.ElementType,
  R extends HTMLElement,
>(
  props: Props<E>,
  ref: React.Ref<R>,
) => {
  const { id: idProp, onClick, ...otherProps } = props;

  const expandableCtx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-trigger");

  const handleClick = (event: React.MouseEvent<R>) => {
    expandableCtx?.handleExpandChange(!expandableCtx.isExpanded);
    (onClick as React.MouseEventHandler<R>)?.(event);
  };

  const refCallback = (node: R | null) => {
    setRef(ref, node);
    if (!node) return;

    const parent = node.closest(`[data-slot="${RootSlot}"]`);

    if (!parent) return;

    const content = parent.querySelector<R>(`[data-slot="${ContentRootSlot}"]`);

    if (!content) return;

    const panelId = content.id;

    panelId && node.setAttribute("aria-controls", panelId);
  };

  return (
    <Button
      {...(otherProps as ButtonProps<E>)}
      id={id}
      onClick={handleClick}
      ref={refCallback}
      data-slot={TriggerRootSlot}
      aria-expanded={expandableCtx?.isExpanded}
    />
  );
};

const ExpandableTrigger = componentWithForwardedRef(ExpandableTriggerBase);

export default ExpandableTrigger;
