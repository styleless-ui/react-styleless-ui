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
  MergeElementProps<"li", SeparatorItemOwnProps>,
  "defaultChecked" | "defaultValue" | "children"
>;

const BreadcrumbSeparatorItemBase = (
  props: SeparatorItemProps,
  ref: React.Ref<HTMLLIElement>,
) => {
  const { className, ...otherProps } = props;

  return (
    <li
      {...otherProps}
      role="separator"
      ref={ref}
      className={className}
      data-slot={SeparatorItemRootSlot}
    />
  );
};

const BreadcrumbSeparatorItem = componentWithForwardedRef(
  BreadcrumbSeparatorItemBase,
);

export default BreadcrumbSeparatorItem;
