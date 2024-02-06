import * as React from "react";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { ItemRoot as ItemRootSlot } from "../slots";

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
  MergeElementProps<"li", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ItemBase = (props: Props, ref: React.Ref<HTMLLIElement>) => {
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

const Item = componentWithForwardedRef(ItemBase, "Breadcrumb.Item");

export default Item;
