import * as React from "react";
import Button from "../../Button";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { ActionRoot as ActionRootSlot } from "../slots";

export type RenderProps = {
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * Determines whether it is focused-visible or not.
   */
  focusedVisible: boolean;
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
};

export type Props<T extends React.ElementType = typeof Button> =
  MergeElementProps<
    T,
    OwnProps & {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      as?: T;
    }
  >;

const ActionBase = <
  T extends React.ElementType = React.ElementType,
  E extends HTMLElement = HTMLElement,
>(
  props: Props<T>,
  ref: React.Ref<E>,
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = Button,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__toast-action");

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={ref}
      className={className}
      type="button"
      data-slot={ActionRootSlot}
    >
      {children}
    </RootNode>
  );
};

const Action = componentWithForwardedRef(ActionBase, "Toast.Action");

export default Action;
