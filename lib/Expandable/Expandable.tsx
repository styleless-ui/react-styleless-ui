import * as React from "react";
import { resolvePropWithRenderContext } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import { componentWithForwardedRef, useControlledProp } from "../utils";
import { ExpandableContext } from "./context";
import { Root as RootSlot } from "./slots";

export type RenderProps = {
  /**
   * Determines whether it is expanded or not.
   */
  expanded: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
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

  const renderProps: RenderProps = {
    expanded: isExpanded,
  };

  const classNameProps: ClassNameProps = renderProps;

  const className = resolvePropWithRenderContext(classNameProp, classNameProps);
  const children = resolvePropWithRenderContext(childrenProp, renderProps);

  const emitExpandChange = (expandState: boolean) => {
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
        value={{
          isExpanded,
          emitExpandChange,
        }}
      >
        {children}
      </ExpandableContext.Provider>
    </div>
  );
};

const Expandable = componentWithForwardedRef(ExpandableBase, "Expandable");

export default Expandable;
