import * as React from "react";
import Button, { type ButtonProps } from "../../Button";
import { logger } from "../../internals";
import type { PolymorphicProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
} from "../../utils";
import { ExpandableContext } from "../context";
import {
  ContentRoot as ContentRootSlot,
  Root as RootSlot,
  TriggerRoot as TriggerRootSlot,
} from "../slots";

export type RenderProps = {
  disabled: boolean;
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
};

export type Props<E extends React.ElementType> = PolymorphicProps<E, OwnProps>;

const TriggerBase = <E extends React.ElementType, R extends HTMLElement>(
  props: Props<E>,
  ref: React.Ref<R>,
) => {
  const { id: idProp, onClick, ...otherProps } = props;

  const ctx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-trigger");

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <Expandable.Root>.",
      {
        scope: "Expandable.Trigger",
        type: "error",
      },
    );

    return null;
  }

  const handleClick = (event: React.MouseEvent<R>) => {
    ctx.handleExpandChange(!ctx.isExpanded);
    (onClick as React.MouseEventHandler<R>)?.(event);
  };

  const refCallback = (node: R | null) => {
    setRef(ref, node);
    if (!node) return;

    const parent = node.closest(`[data-slot="${RootSlot}"]`);

    if (!parent) return;

    const content = parent.querySelector<R>(`[data-slot="${ContentRootSlot}"]`);

    if (!content) return;

    const contentId = content.id;

    contentId && node.setAttribute("aria-controls", contentId);
  };

  return (
    <Button
      {...(otherProps as ButtonProps<E>)}
      id={id}
      onClick={handleClick}
      ref={refCallback}
      data-slot={TriggerRootSlot}
      aria-expanded={ctx.isExpanded}
    />
  );
};

const Trigger = componentWithForwardedRef(TriggerBase, "Expandable.Trigger");

export default Trigger;
