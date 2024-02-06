import * as React from "react";
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

  const expandableCtx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-content");

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);

    if (!node) return;

    const parent = node.closest(`[data-slot="${RootSlot}"]`);

    if (!parent) return;

    const trigger = parent.querySelector<HTMLDivElement>(
      `[data-slot="${TriggerRootSlot}"]`,
    );

    if (!trigger) return;

    const triggerId = trigger.id;

    triggerId && node.setAttribute("aria-labelledby", triggerId);
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      role="region"
      aria-hidden={!expandableCtx?.isExpanded}
      // @ts-expect-error React hasn't added `inert` yet
      inert={!expandableCtx?.isExpanded ? undefined : ""}
      data-slot={ContentRootSlot}
      data-expanded={!expandableCtx?.isExpanded ? "" : undefined}
    >
      {children}
    </div>
  );
};

const Content = componentWithForwardedRef(ContentBase, "Expandable.Content");

export default Content;
