import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId
} from "../../utils";
import ExpandableContext from "../context";

interface ExpandablePanelBaseProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type ExpandablePanelProps = Omit<
  MergeElementProps<"div", ExpandablePanelBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const ExpandablePanelBase = (
  props: ExpandablePanelProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const { children, className, id: idProp, ...otherProps } = props;

  const expandableCtx = React.useContext(ExpandableContext);

  const id = useDeterministicId(idProp, "styleless-ui__expandable-panel");

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);

    if (!node) return;

    const parent = node.closest('[data-slot="expandableRoot"]');
    if (!parent) return;

    const trigger = parent.querySelector<HTMLDivElement>(
      '[data-slot="expandableTrigger"]'
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
      role="region"
      aria-hidden={!expandableCtx?.isExpanded}
      data-slot="expandablePanel"
      className={className}
    >
      {children}
    </div>
  );
};

const ExpandablePanel = componentWithForwardedRef<
  HTMLDivElement,
  ExpandablePanelProps,
  typeof ExpandablePanelBase
>(ExpandablePanelBase);

export default ExpandablePanel;
