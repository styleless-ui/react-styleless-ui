import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  logger,
  useDeterministicId,
} from "../utils";
import { Item, SeparatorItem, type ItemProps } from "./components";
import {
  Label as LabelSlot,
  List as ListSlot,
  Root as RootSlot,
} from "./slots";
import { getLabelInfo } from "./utils";

interface OwnProps {
  /**
   * The content of the breadcrumb.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label" | "list">;
  /**
   * The label of the breadcrumb.
   */
  label:
    | string
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
}

export type Props = Omit<
  MergeElementProps<"nav", OwnProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const BreadcrumbBase = (props: Props, ref: React.Ref<HTMLElement>) => {
  const {
    label,
    children: childrenProp,
    id: idProp,
    classes,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__breadcrumb");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const listRefCallback = (node: HTMLOListElement | null) => {
    if (!node) return;

    const listItems = Array.from(node.children);
    const lastItem = listItems[listItems.length - 1];

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
        { scope: "Breadcrumb", type: "warn" },
      );
    }
  };

  const labelProps = getLabelInfo(label);

  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child)) return null;

    if (
      (child as React.ReactElement).type !== Item &&
      (child as React.ReactElement).type !== SeparatorItem
    ) {
      logger(
        "The Breadcrumb component only accepts <Breadcrumb.Item> and " +
          "<Breadcrumb.Separator> as a children",
        { scope: "Breadcrumb", type: "error" },
      );

      return null;
    }

    return child as React.ReactElement<ItemProps>;
  });

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={LabelSlot}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

  return (
    <>
      {renderLabel()}
      <nav
        {...otherProps}
        id={id}
        ref={ref}
        className={classes?.root}
        data-slot={RootSlot}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={
          labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
        }
      >
        <ol
          ref={listRefCallback}
          tabIndex={-1}
          className={classes?.list}
          data-slot={ListSlot}
        >
          {children}
        </ol>
      </nav>
    </>
  );
};

const Breadcrumb = componentWithForwardedRef(BreadcrumbBase, "Breadcrumb");

export default Breadcrumb;
