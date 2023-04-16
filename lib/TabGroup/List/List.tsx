import * as React from "react";
import type { Classes, MergeElementProps } from "../../typings";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import TabGroupContext from "../context";
import { ListLabel as ListLabelSlot, ListRoot as ListRootSlot } from "../slots";
import Tab from "../Tab";

interface OwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label">;
  /**
   * The label of the tablist.
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
         * Identifies the element (or elements) that labels the tablist.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const getLabelInfo = (labelInput: Props["label"]) => {
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
          "[StylelessUI][TabGroup.List]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      );
    }
  }

  return props;
};

const TabListBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    children: childrenProp,
    id: idProp,
    classes,
    ...otherProps
  } = props;

  const tabGroupCtx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__tablist");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  let tabIdx = 0;
  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child)) return null;

    if ((child as React.ReactElement).type === Tab) {
      const props = { "data-index": tabIdx++ };

      return React.cloneElement(child, props);
    }

    return child;
  });

  return (
    <>
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot={ListLabelSlot}
          className={classes?.label}
        >
          {visibleLabel}
        </span>
      )}
      <div
        {...otherProps}
        id={id}
        ref={ref}
        role="tablist"
        data-slot={ListRootSlot}
        className={classes?.root}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
        aria-orientation={tabGroupCtx?.orientation}
      >
        {children}
      </div>
    </>
  );
};

const TabList = componentWithForwardedRef(TabListBase);

export default TabList;
