import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { MenuContext } from "../context";
import { ItemsRoot as ItemsRootSlot } from "../slots";

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

  if (!menuCtx) {
    logger("You have to use this component as a descendant of <Menu.Root>.", {
      scope: "Menu.Items",
      type: "error",
    });

    return null;
  }

  const labelProps = getLabelInfo(label, "Menu.Items", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

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
      aria-activedescendant={menuCtx.activeElement?.id ?? undefined}
    >
      {children}
    </div>
  );
};

const Items = componentWithForwardedRef(ItemsBase, "Menu.Items");

export default Items;
