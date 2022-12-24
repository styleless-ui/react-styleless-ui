import * as React from "react";
import Button from "../../Button";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { ActionRoot as ActionRootSlot } from "../slots";

interface ActionOwnProps {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        disabled: boolean;
        focusedVisible: boolean;
      }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: { disabled: boolean; focusedVisible: boolean }) => string);
}

export type ActionProps<T extends React.ElementType = typeof Button> =
  MergeElementProps<
    T,
    ActionOwnProps & {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      as?: T;
    }
  >;

const SnackbarActionBase = <
  T extends React.ElementType = React.ElementType,
  E extends HTMLElement = HTMLElement
>(
  props: ActionProps<T>,
  ref: React.Ref<E>
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = Button,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__snackbar-action");

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

const SnackbarAction = componentWithForwardedRef(SnackbarActionBase);

export default SnackbarAction;
