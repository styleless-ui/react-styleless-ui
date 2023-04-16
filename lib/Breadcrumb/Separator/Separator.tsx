import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";
import { SeparatorItemRoot as SeparatorItemRootSlot } from "../slots";

interface OwnProps {
  /**
   * The symbol which is used as separator.
   */
  separatorSymbol: JSX.Element | string;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type Props = Omit<
  MergeElementProps<"li", OwnProps>,
  "defaultChecked" | "defaultValue" | "children"
>;

const BreadcrumbSeparatorItemBase = (
  props: Props,
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
