import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";

interface MenuSeparatorItemBaseProps {
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type MenuSeparatorItemProps = Omit<
  MergeElementProps<"div", MenuSeparatorItemBaseProps>,
  "defaultValue" | "defaultChecked" | "children"
>;

const MenuSeparatorItemBase = (
  props: MenuSeparatorItemProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const { className, ...otherProps } = props;

  return (
    <div {...otherProps} role="separator" ref={ref} className={className} />
  );
};

const MenuSeparatorItem = componentWithForwardedRef(MenuSeparatorItemBase);

export default MenuSeparatorItem;
