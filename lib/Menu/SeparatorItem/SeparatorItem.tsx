import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";
import { SeparatorItemRoot as SeparatorItemRootSlot } from "../slots";

interface SeparatorItemOwnProps {
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type SeparatorItemProps = Omit<
  MergeElementProps<"div", SeparatorItemOwnProps>,
  "defaultValue" | "defaultChecked" | "children"
>;

const MenuSeparatorItemBase = (
  props: SeparatorItemProps,
  ref: React.Ref<HTMLDivElement>
) => {
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

const MenuSeparatorItem = componentWithForwardedRef(MenuSeparatorItemBase);

export default MenuSeparatorItem;
