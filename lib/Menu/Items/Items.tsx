import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef } from "../../utils";
import { ItemsRoot as ItemsRootSlot } from "../slots";

interface OwnProps {
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
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const getLabelInfo = (labelInput: Props["label"]) => {
  const props: { srOnlyLabel?: string; labelledBy?: string } = {};

  if ("screenReaderLabel" in labelInput) {
    props.srOnlyLabel = labelInput.screenReaderLabel;
  } else if ("labelledBy" in labelInput) {
    props.labelledBy = labelInput.labelledBy;
  } else {
    throw new Error(
      [
        "[StylelessUI][Menu.Items]: Invalid `label` property.",
        "The `label` property must be in shape of " +
          "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
      ].join("\n"),
    );
  }

  return props;
};

const MenuItemsBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, label, ...otherProps } = props;

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
    >
      {children}
    </div>
  );
};

const MenuItems = componentWithForwardedRef(MenuItemsBase);

export default MenuItems;
