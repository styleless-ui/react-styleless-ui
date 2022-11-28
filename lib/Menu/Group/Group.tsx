import * as React from "react";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";

type ClassesMap = Record<"root" | "label", string>;

interface MenuGroupBaseProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ClassesMap;
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

export type MenuGroupProps = Omit<
  MergeElementProps<"div", MenuGroupBaseProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: MenuGroupProps["label"]) => {
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
          "[StylelessUI][MenuGroup]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const MenuGroupBase = (
  props: MenuGroupProps,
  ref: React.Ref<HTMLDivElement>
) => {
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
      role="group"
      id={id}
      ref={ref}
      data-slot="menuGroupRoot"
      className={classes?.root}
      tabIndex={-1}
      aria-label={labelProps.srOnlyLabel}
      aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
    >
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot="menuGroupLabel"
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
