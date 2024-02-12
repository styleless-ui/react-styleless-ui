import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type { Classes, MergeElementProps } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { TabGroupContext } from "../context";
import { ListLabel as ListLabelSlot, ListRoot as ListRootSlot } from "../slots";

type OwnProps = {
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
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const ListBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { label, children, id: idProp, classes, ...otherProps } = props;

  const ctx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__tablist");
  const visibleLabelId = id ? `${id}__label` : undefined;

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <TabGroup.Root>.",
      {
        scope: "TabGroup.List",
        type: "error",
      },
    );

    return null;
  }

  const labelProps = getLabelInfo(label, "TabGroup.List");

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={ListLabelSlot}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

  return (
    <>
      {renderLabel()}
      <div
        {...otherProps}
        id={id}
        ref={ref}
        role="tablist"
        data-slot={ListRootSlot}
        className={classes?.root}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={
          labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
        }
        aria-orientation={ctx.orientation}
      >
        {children}
      </div>
    </>
  );
};

const List = componentWithForwardedRef(ListBase, "TabGroup.List");

export default List;
