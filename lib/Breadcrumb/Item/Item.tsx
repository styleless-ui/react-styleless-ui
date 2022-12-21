import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import { componentWithForwardedRef } from "../../utils";
import { ItemRoot as ItemRootSlot } from "../slots";

interface ItemBaseProps {
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
  MergeElementProps<"li", ItemBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const BreadcrumbItemBase = (
  props: ItemProps,
  ref: React.Ref<HTMLLIElement>
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
