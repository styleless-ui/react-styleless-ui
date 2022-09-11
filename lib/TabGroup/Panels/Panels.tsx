import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import { componentWithForwardedRef } from "../../utils";
import Panel from "../Panel";

interface TabPanelsBaseProps {
  /**
   * The content of the tabpanels.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type TabPanelsProps = Omit<
  MergeElementProps<"div", TabPanelsBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const TabPanelsBase = (
  props: TabPanelsProps,
  ref: React.Ref<HTMLDivElement>
) => {
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
      data-slot="tabPanelsRoot"
    >
      {children}
    </div>
  );
};

const TabPanels = componentWithForwardedRef<
  HTMLDivElement,
  TabPanelsProps,
  typeof TabPanelsBase
>(TabPanelsBase);

export default TabPanels;
