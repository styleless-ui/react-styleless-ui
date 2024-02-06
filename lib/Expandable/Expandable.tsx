import * as React from "react";
import type { MergeElementProps } from "../types";
import { componentWithForwardedRef, useControlledProp } from "../utils";
import { ExpandableContext } from "./context";
import { Root as RootSlot } from "./slots";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: { expanded: boolean }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?: string | ((ctx: { expanded: boolean }) => string);
  /**
   * If `true`, the panel will be opened.
   */
  expanded?: boolean;
  /**
   * The default state of the `expanded`. Use when `expanded` is not controlled.
   */
  defaultExpanded?: boolean;
  /**
   * The Callback is fired when the `expand` state changes.
   *
   * Only updates from `<Expandable.Trigger>` component trigger the callback.
   */
  onExpandChange?: (isExpanded: boolean) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ExpandableBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    onExpandChange,
    expanded,
    defaultExpanded,
    children: childrenProp,
    className: classNameProp,
    ...otherProps
  } = props;

  const [isExpanded, setIsExpanded] = useControlledProp(
    expanded,
    defaultExpanded,
    false,
  );

  const className =
    typeof classNameProp === "function"
      ? classNameProp({ expanded: isExpanded })
      : classNameProp;

  const children =
    typeof childrenProp === "function"
      ? childrenProp({ expanded: isExpanded })
      : childrenProp;

  const handleExpandChange = (expandState: boolean) => {
    setIsExpanded(expandState);
    onExpandChange?.(expandState);
  };

  return (
    <div
      {...otherProps}
      role="heading"
      ref={ref}
      className={className}
      data-slot={RootSlot}
      data-expanded={isExpanded ? "" : undefined}
    >
      <ExpandableContext.Provider
        value={{ isExpanded, setIsExpanded, handleExpandChange }}
      >
        {children}
      </ExpandableContext.Provider>
    </div>
  );
};

const Expandable = componentWithForwardedRef(ExpandableBase, "Expandable");

export default Expandable;
