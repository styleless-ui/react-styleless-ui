import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type {
  ClassesWithRenderContext,
  MergeElementProps,
  PropWithRenderContext,
} from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { LevelContext, SizeContext } from "../contexts";
import {
  SubTreeLabel as SubTreeLabelSlot,
  SubTreeRoot as SubTreeRootSlot,
} from "../slots";
import { getValidChildren } from "../utils";
import { TreeViewItemContext } from "./Item/context";

export type RenderProps = {
  /**
   * The `open` state of the component.
   */
  open: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ClassesWithRenderContext<"root" | "label", ClassNameProps>;
  /**
   * The label of the subtree.
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
         * Identifies the element (or elements) that labels the subtree.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   *
   * @default false
   */
  keepMounted?: boolean;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked" | "className"
>;

const SubTreeBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    classes: classesProp,
    children: childrenProp,
    keepMounted = false,
    label,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__treeview-subtree");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const currentLevel = React.useContext(LevelContext) ?? 1;
  const itemCtx = React.useContext(TreeViewItemContext);

  if (!itemCtx) {
    logger(
      "You have to use this component as a descendant of <TreeView.Item>.",
      {
        scope: "TreeView.SubTree",
        type: "error",
      },
    );

    return null;
  }

  const openState = itemCtx.isExpanded;

  const renderProps: RenderProps = { open: openState };
  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const classes =
    typeof classesProp === "function"
      ? classesProp(classNameProps)
      : classesProp;

  const { validChildren, sizeOfSet } = getValidChildren(
    children,
    "TreeView.SubTree",
  );

  const labelProps = getLabelInfo(label, "TreeView.SubTree");

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={SubTreeLabelSlot}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

  if (!keepMounted && !openState) return null;

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={!openState ? "" : undefined}
      id={id}
      ref={ref}
      className={classes?.root}
      role="group"
      tabIndex={-1}
      data-for={itemCtx.value}
      data-slot={SubTreeRootSlot}
      data-open={openState ? "" : undefined}
      aria-label={labelProps.srOnlyLabel}
      aria-labelledby={
        labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
      }
    >
      {renderLabel()}
      <LevelContext.Provider value={currentLevel + 1}>
        <SizeContext.Provider value={sizeOfSet}>
          {validChildren}
        </SizeContext.Provider>
      </LevelContext.Provider>
    </div>
  );
};

const SubTree = componentWithForwardedRef(SubTreeBase, "TreeView.SubTree");

export default SubTree;
