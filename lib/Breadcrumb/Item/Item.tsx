import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import { componentWithForwardedRef } from "../../utils";
import BreadcrumbContext from "../context";

interface BreadcrumbItemBaseProps {
  /**
   * The content of the breadcrumb item.
   */
  children?: React.ReactNode;
}

export type BreadcrumbItemProps = Omit<
  MergeElementProps<"li", BreadcrumbItemBaseProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const BreadcrumbItemBase = (
  props: BreadcrumbItemProps,
  ref: React.Ref<HTMLLIElement>
) => {
  const { children, ...otherProps } = props;

  const ctx = React.useContext(BreadcrumbContext);

  return (
    <li {...otherProps} ref={ref} className={ctx?.classes?.item}>
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
