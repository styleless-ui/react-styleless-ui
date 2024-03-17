import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { TabGroupContext, TabGroupListContext } from "../context";
import { ListRoot as ListRootSlot } from "../slots";

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
   * The label of the tablist.
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
         * Identifies the element (or elements) that labels the tablist.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ListBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { label, children, id: idProp, className, ...otherProps } = props;

  const ctx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__tablist");

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

  const labelInfo = getLabelInfo(label, "TabGroup.List", {
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
      role="tablist"
      data-slot={ListRootSlot}
      className={className}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      aria-orientation={ctx.orientation}
    >
      <TabGroupListContext.Provider value={true}>
        {children}
      </TabGroupListContext.Provider>
    </div>
  );
};

const List = componentWithForwardedRef(ListBase, "TabGroup.List");

export default List;
