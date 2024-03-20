import * as React from "react";
import Button from "../../Button";
import { logger } from "../../internals";
import type { PolymorphicProps } from "../../types";
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

export type Props<E extends React.ElementType = typeof Button<"div">> =
  PolymorphicProps<E>;

const TriggerBase = <
  E extends React.ElementType = typeof Button<"div">,
  R extends HTMLElement = HTMLDivElement,
>(
  props: Props<E>,
  ref: React.Ref<R>,
) => {
  type TProps = Props<typeof Button<"div">>;

  const {
    as: RootNode = Button<"div">,
    id: idProp,
    onClick,
    ...otherProps
  } = props as TProps;

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
    ctx.emitExpandChange(!ctx.isExpanded);
    onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
  };

  const refCallback = (node: R | null) => {
    setRef(ref, node);

    if (!node) return;

    const parent = node.closest(`[data-slot="${RootSlot}"]`);

    if (!parent) return;

    const content = parent.querySelector<HTMLDivElement>(
      `[data-slot="${ContentRootSlot}"]`,
    );

    if (!content) return;

    node.setAttribute("aria-controls", content.id);
    content.setAttribute("aria-labelledby", id);
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      onClick={handleClick as unknown as TProps["onClick"]}
      ref={refCallback as TProps["ref"]}
      data-slot={TriggerRootSlot}
      aria-expanded={ctx.isExpanded}
      data-expanded={ctx.isExpanded ? "" : undefined}
    />
  );
};

type PolymorphicComponent = <
  E extends React.ElementType = typeof Button<"div">,
>(
  props: Props<E>,
) => JSX.Element | null;

const Trigger: PolymorphicComponent = componentWithForwardedRef(
  TriggerBase,
  "Expandable.Trigger",
);

export default Trigger;
