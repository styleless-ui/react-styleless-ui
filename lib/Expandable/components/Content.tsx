import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
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

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ContentBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, id: idProp, ...otherProps } = props;

  const ctx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-content");

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <Expandable.Root>.",
      {
        scope: "Expandable.Content",
        type: "error",
      },
    );

    return null;
  }

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);

    if (!node) return;

    const parent = node.closest(`[data-slot="${RootSlot}"]`);

    if (!parent) return;

    const trigger = parent.querySelector<HTMLElement>(
      `[data-slot="${TriggerRootSlot}"]`,
    );

    if (!trigger) return;

    node.setAttribute("aria-labelledby", trigger.id);
    trigger.setAttribute("aria-controls", id);
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      role="region"
      // @ts-expect-error React hasn't added `inert` yet
      inert={!ctx.isExpanded ? undefined : ""}
      aria-hidden={!ctx.isExpanded}
      data-slot={ContentRootSlot}
      data-expanded={!ctx.isExpanded ? "" : undefined}
    >
      {children}
    </div>
  );
};

const Content = componentWithForwardedRef(ContentBase, "Expandable.Content");

export default Content;
