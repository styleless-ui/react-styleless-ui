import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef, isFragment } from "../../utils";
import { PanelsRoot as PanelsRootSlot } from "../slots";
import Panel from "./Panel";

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

const PanelsBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children: childrenProp, className, ...otherProps } = props;

  let panelIdx = 0;
  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child) || isFragment(child)) {
      logger(
        "The <TabGroup.Panels> component doesn't accept `Fragment` or any invalid element as children.",
        { scope: "TabGroup.Panels", type: "error" },
      );

      return null;
    }

    if ((child as React.ReactElement).type !== Panel) {
      logger(
        "The <TabGroup.Panels> component only accepts " +
          "<TabGroup.Panel> as children.",
        { scope: "TabGroup.Panels", type: "error" },
      );

      return null;
    }

    const props = { "data-index": panelIdx++ };

    return React.cloneElement(child, props);
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

const Panels = componentWithForwardedRef(PanelsBase, "TabGroup.Panels");

export default Panels;
