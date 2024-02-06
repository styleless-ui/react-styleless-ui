import * as React from "react";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { SeparatorItemRoot as SeparatorItemRootSlot } from "../slots";

type OwnProps = {
  /**
   * The className applied to the component.
   */
  className?: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked" | "children"
>;

const SeparatorItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { className, ...otherProps } = props;

  return (
    <div
      {...otherProps}
      role="separator"
      ref={ref}
      className={className}
      data-slot={SeparatorItemRootSlot}
    />
  );
};

const SeparatorItem = componentWithForwardedRef(
  SeparatorItemBase,
  "Menu.SeparatorItem",
);

export default SeparatorItem;
