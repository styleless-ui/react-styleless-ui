import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";
import { ItemRoot as ItemRootSlot } from "../slots";

interface ItemOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type ItemProps = Omit<
  MergeElementProps<"li", ItemOwnProps>,
  "defaultChecked" | "defaultValue"
>;

const BreadcrumbItemBase = (
  props: ItemProps,
  ref: React.Ref<HTMLLIElement>,
) => {
  const { className, children, ...otherProps } = props;

  return (
    <li
      {...otherProps}
      ref={ref}
      className={className}
      data-slot={ItemRootSlot}
    >
      {children}
    </li>
  );
};

const BreadcrumbItem = componentWithForwardedRef(BreadcrumbItemBase);

export default BreadcrumbItem;
