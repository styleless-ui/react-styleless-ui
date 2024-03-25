import * as React from "react";
import { getLabelInfo } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { GroupRoot as GroupRootSlot } from "../slots";

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
   * The label of the group.
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
         * Identifies the element (or elements) that labels the group.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  | "value"
  | "defaultValue"
  | "defaultChecked"
  | "checked"
  | "onChange"
  | "onChangeCapture"
>;

const GroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, label, id: idProp, ...otherProps } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-group");

  const labelInfo = getLabelInfo(label, "Menu.Group", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  return (
    <div
      {...otherProps}
      id={id}
      ref={ref}
      className={className}
      role="group"
      tabIndex={-1}
      data-slot={GroupRootSlot}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
    >
      {children}
    </div>
  );
};

const Group = componentWithForwardedRef(GroupBase, "Menu.Group");

export default Group;
