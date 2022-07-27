import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import { componentWithForwardedRef } from "../../utils";

interface BreadcrumbItemBaseProps {
  /**
   * The content of the breadcrumb item.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type BreadcrumbItemProps = Omit<
  MergeElementProps<"li", BreadcrumbItemBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const BreadcrumbItemBase = (
  props: BreadcrumbItemProps,
  ref: React.Ref<HTMLLIElement>
) => {
  const { className, children, ...otherProps } = props;

  return (
    <li {...otherProps} ref={ref} className={className}>
      {children}
    </li>
  );
};

const BreadcrumbItem = componentWithForwardedRef<
  HTMLLIElement,
  BreadcrumbItemProps,
  typeof BreadcrumbItemBase
>(BreadcrumbItemBase);

export default BreadcrumbItem;
