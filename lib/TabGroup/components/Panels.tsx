import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";
import { PanelsRoot as PanelsRootSlot } from "../slots";
import Panel from "./Panel";

interface OwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const PanelsBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children: childrenProp, className, ...otherProps } = props;

  let panelIdx = 0;
  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child)) return null;

    if ((child as React.ReactElement).type === Panel) {
      const props = { "data-index": panelIdx++ };

      return React.cloneElement(child, props);
    }

    return child;
  });

  return (
    <div
      {...otherProps}
      ref={ref}
      className={className}
      data-slot={PanelsRootSlot}
    >
      {children}
    </div>
  );
};

const Panels = componentWithForwardedRef(PanelsBase, "TabPanels");

export default Panels;
