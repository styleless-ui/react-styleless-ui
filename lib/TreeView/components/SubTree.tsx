import * as React from "react";
import { logger, resolvePropWithRenderContext } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { LevelContext, SizeContext } from "../contexts";
import { SubTreeRoot as SubTreeRootSlot } from "../slots";
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
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
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
  "defaultValue" | "defaultChecked"
>;

const SubTreeBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    className: classNameProp,
    children: childrenProp,
    keepMounted = false,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__treeview-subtree");

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

  const children = resolvePropWithRenderContext(childrenProp, renderProps);
  const className = resolvePropWithRenderContext(classNameProp, classNameProps);

  const { validChildren, sizeOfSet } = getValidChildren(
    children,
    "TreeView.SubTree",
  );

  if (!keepMounted && !openState) return null;

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={!openState ? "" : undefined}
      id={id}
      ref={ref}
      className={className}
      role="group"
      tabIndex={-1}
      aria-labelledby={itemCtx.id}
      data-for-entity={itemCtx.value}
      data-slot={SubTreeRootSlot}
      data-open={openState ? "" : undefined}
    >
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
