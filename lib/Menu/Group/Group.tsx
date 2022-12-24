import * as React from "react";
import type { Classes, MergeElementProps } from "../../typings";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import {
  GroupLabel as GroupLabelSlot,
  GroupRoot as GroupRootSlot
} from "../slots";

interface GroupOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label">;
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
         * Identifies the element (or elements) that labels the group.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
}

export type GroupProps = Omit<
  MergeElementProps<"div", GroupOwnProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: GroupProps["label"]) => {
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
          "[StylelessUI][Menu.Group]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const MenuGroupBase = (props: GroupProps, ref: React.Ref<HTMLDivElement>) => {
  const { children, classes, label, id: idProp, ...otherProps } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  return (
    <div
      {...otherProps}
      id={id}
      ref={ref}
      className={classes?.root}
      role="group"
      tabIndex={-1}
      data-slot={GroupRootSlot}
      aria-label={labelProps.srOnlyLabel}
      aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
    >
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot={GroupLabelSlot}
          className={classes?.label}
        >
          {visibleLabel}
        </span>
      )}

      {children}
    </div>
  );
};

const MenuGroup = componentWithForwardedRef(MenuGroupBase);

export default MenuGroup;
