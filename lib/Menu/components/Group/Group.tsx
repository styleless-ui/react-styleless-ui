import * as React from "react";
import type { Classes, MergeElementProps } from "../../../typings";
import { componentWithForwardedRef, useDeterministicId } from "../../../utils";
import {
  GroupLabel as GroupLabelSlot,
  GroupRoot as GroupRootSlot,
} from "../../slots";
import { getLabelInfo } from "./utils";

interface OwnProps {
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

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked"
>;

const GroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { children, classes, label, id: idProp, ...otherProps } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={GroupLabelSlot}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

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
      aria-labelledby={
        labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
      }
    >
      {renderLabel()}
      {children}
    </div>
  );
};

const Group = componentWithForwardedRef(GroupBase, "MenuGroup");

export default Group;
