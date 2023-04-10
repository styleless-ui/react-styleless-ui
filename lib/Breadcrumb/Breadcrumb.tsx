import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useRegisterNodeRef,
} from "../utils";
import BreadcrumbItem, { type ItemProps } from "./Item";
import BreadcrumbSeparatorItem from "./Separator/Separator";
import {
  Label as LabelSlot,
  List as ListSlot,
  Root as RootSlot,
} from "./slots";

interface RootOwnProps {
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

export type RootProps = Omit<
  MergeElementProps<"nav", RootOwnProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const getLabelInfo = (labelInput: RootProps["label"]) => {
  const props: {
    visibleLabel?: string;
    srOnlyLabel?: string;
    labelledBy?: string;
  } = {};

  if (typeof labelInput === "string") {
    props.visibleLabel = labelInput;
  } else {
    if ("screenReaderLabel" in labelInput) {
      props.srOnlyLabel = labelInput.screenReaderLabel;
    } else if ("labelledBy" in labelInput) {
      props.labelledBy = labelInput.labelledBy;
    } else {
      throw new Error(
        [
          "[StylelessUI][Breadcrumb]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      );
    }
  }

  return props;
};

const BreadcrumbBase = (props: RootProps, ref: React.Ref<HTMLElement>) => {
  const {
    label,
    children: childrenProp,
    id: idProp,
    classes,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__breadcrumb");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const registerListRef = useRegisterNodeRef(list => {
    const listItems = Array.from(list.children);
    const lastItem = listItems[listItems.length - 1];

    if (!lastItem?.firstElementChild) return;

    if (lastItem.firstElementChild.tagName === "A") {
      const anchorLink = lastItem.firstElementChild as HTMLAnchorElement;

      if (anchorLink.hasAttribute("aria-current")) return;

      // eslint-disable-next-line no-console
      console.warn(
        [
          "[StylelessUI][Breadcrumb]: The aria attribute `aria-current`" +
            " is missing from the last <BreadcrumbItem>'s anchor element.",
          "For more information check out: " +
            "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current",
        ].join("\n"),
      );
    }
  });

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child)) return null;

    if (
      (child as React.ReactElement).type !== BreadcrumbItem &&
      (child as React.ReactElement).type !== BreadcrumbSeparatorItem
    ) {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][Breadcrumb]: The Breadcrumb component only accepts <Breadcrumb.Item> and <Breadcrumb.Separator> as a children.",
      );

      return null;
    }

    return child as React.ReactElement<ItemProps>;
  });

  return (
    <>
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot={LabelSlot}
          className={classes?.label}
        >
          {visibleLabel}
        </span>
      )}
      <nav
        {...otherProps}
        id={id}
        ref={ref}
        className={classes?.root}
        data-slot={RootSlot}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
      >
        <ol
          ref={registerListRef}
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

const Breadcrumb =
  componentWithForwardedRef<typeof BreadcrumbBase>(BreadcrumbBase);

export default Breadcrumb;
