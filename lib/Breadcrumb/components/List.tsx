import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef, isFragment, setRef } from "../../utils";
import { ListRoot as ListRootSlot } from "../slots";
import Item from "./Item";
import SeparatorItem from "./SeparatorItem";

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
  MergeElementProps<"ol", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ListBase = (props: Props, ref: React.Ref<HTMLOListElement>) => {
  const { className, children: childrenProp, ...otherProps } = props;

  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child) || isFragment(child)) {
      logger(
        "The <Breadcrumb.List> component doesn't accept `Fragment` or any invalid element as children.",
        { scope: "Breadcrumb.List", type: "error" },
      );

      return null;
    }

    if (
      (child as React.ReactElement).type !== Item &&
      (child as React.ReactElement).type !== SeparatorItem
    ) {
      logger(
        "The <Breadcrumb.List> component only accepts <Breadcrumb.Item> and " +
          "<Breadcrumb.Separator> as a children.",
        { scope: "Breadcrumb.List", type: "error" },
      );

      return null;
    }

    return child as React.ReactElement;
  });

  const refCallback = (node: HTMLOListElement | null) => {
    setRef(ref, node);

    if (!node) return;

    const lastItem = node.lastElementChild;

    if (!lastItem?.firstElementChild) return;

    if (lastItem.firstElementChild.tagName === "A") {
      const anchorLink = lastItem.firstElementChild as HTMLAnchorElement;

      if (anchorLink.hasAttribute("aria-current")) return;

      logger(
        [
          "The aria attribute `aria-current`" +
            " is missing from the last <BreadcrumbItem>'s anchor element.",
          "For more information check out: " +
            "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current",
        ].join("\n"),
        { scope: "Breadcrumb.List", type: "warn" },
      );
    }
  };

  return (
    <ol
      {...otherProps}
      ref={refCallback}
      tabIndex={-1}
      className={className}
      data-slot={ListRootSlot}
    >
      {children}
    </ol>
  );
};

const List = componentWithForwardedRef(ListBase, "Breadcrumb.List");

export default List;
