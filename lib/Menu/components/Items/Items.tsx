import * as React from "react";
import type { MergeElementProps } from "../../../typings";
import { componentWithForwardedRef } from "../../../utils";
import { MenuContext } from "../../context";
import { ItemsRoot as ItemsRootSlot } from "../../slots";
import { getLabelInfo } from "./utils";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
  /**
   * The label of the menu.
   */
  label:
    | {
        /**
         * The label to use as `aria-label` property.
         */
        screenReaderLabel: string;
      }
    | {
        /**
         * Identifies the element (or elements) that labels the menu.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const ItemsBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, label, ...otherProps } = props;

  const menuCtx = React.useContext(MenuContext);

  const labelProps = getLabelInfo(label);

  return (
    <div
      {...otherProps}
      ref={ref}
      className={className}
      role="menu"
      tabIndex={-1}
      data-slot={ItemsRootSlot}
      aria-label={labelProps.srOnlyLabel}
      aria-labelledby={labelProps.labelledBy}
      aria-activedescendant={menuCtx?.activeElement?.id ?? undefined}
    >
      {children}
    </div>
  );
};

const Items = componentWithForwardedRef(ItemsBase, "MenuItems");

export default Items;
