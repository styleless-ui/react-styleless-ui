import * as React from "react";
import { getLabelInfo, logger } from "../internals";
import type { MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  isFragment,
  useDeterministicId,
} from "../utils";
import { List } from "./components";
import { Root as RootSlot } from "./slots";

type OwnProps = {
  /**
   * The content of the breadcrumb.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
  /**
   * The label of the breadcrumb.
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
         * Identifies the element (or elements) that labels the breadcrumb.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"nav", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const BreadcrumbBase = (props: Props, ref: React.Ref<HTMLElement>) => {
  const {
    label,
    children: childrenProp,
    id: idProp,
    className,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__breadcrumb");

  const labelInfo = getLabelInfo(label, "Breadcrumb", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child) || isFragment(child)) {
      logger(
        "The <Breadcrumb.Root> component doesn't accept `Fragment` or any invalid element as children.",
        { scope: "Breadcrumb", type: "error" },
      );

      return null;
    }

    if ((child as React.ReactElement).type !== List) {
      logger(
        "The <Breadcrumb.Root> component only accepts <Breadcrumb.List> as a children.",
        { scope: "Breadcrumb", type: "error" },
      );

      return null;
    }

    return child as React.ReactElement;
  });

  return (
    <nav
      {...otherProps}
      id={id}
      ref={ref}
      className={className}
      data-slot={RootSlot}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
    >
      {children}
    </nav>
  );
};

const Breadcrumb = componentWithForwardedRef(BreadcrumbBase, "Breadcrumb");

export default Breadcrumb;
