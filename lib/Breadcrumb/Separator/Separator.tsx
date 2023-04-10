import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";
import { SeparatorItemRoot as SeparatorItemRootSlot } from "../slots";

interface SeparatorItemOwnProps {
  /**
   * The symbol which is used as separator.
   */
  separatorSymbol: JSX.Element | string;
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
  const { className, separatorSymbol, ...otherProps } = props;

  return (
    <li
      {...otherProps}
      role="separator"
      ref={ref}
      className={className}
      data-slot={SeparatorItemRootSlot}
    >
      {separatorSymbol}
    </li>
  );
};

const BreadcrumbSeparatorItem = componentWithForwardedRef(
  BreadcrumbSeparatorItemBase,
);

export default BreadcrumbSeparatorItem;
