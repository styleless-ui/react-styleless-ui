import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import SnackbarContext from "../context";
import {
  Content as SnackbarContentSlot,
  Title as SnackbarTitleSlot
} from "../slots";

interface TitleBaseProps {
  /**
   * The content of the snackbar title.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type TitleProps<T extends React.ElementType = "strong"> =
  MergeElementProps<
    T,
    TitleBaseProps & {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      as?: T;
    }
  >;

const SnackbarTitleBase = <
  T extends React.ElementType = React.ElementType,
  E extends HTMLElement = HTMLElement
>(
  props: TitleProps<T>,
  ref: React.Ref<E>
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "strong",
    ...otherProps
  } = props;

  const snackbarCtx = React.useContext(SnackbarContext);

  const id = useDeterministicId(idProp, "styleless-ui__snackbar-title");

  const rootRef = React.useRef<E>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: E | null) => {
    handleRef(node);

    const rootId = snackbarCtx?.id;
    if (!rootId) return;

    if (!node) return;
    if (!id) return;

    const content = node.closest(`[data-slot='${SnackbarContentSlot}']`);

    if (content) {
      content.setAttribute("aria-labelledby", id);
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][Snackbar]: You should always wrap your content with `<Snackbar.Content>` to provide accessibility features."
      );
    }
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={refCallback}
      data-slot={SnackbarTitleSlot}
      className={className}
    >
      {children}
    </RootNode>
  );
};

const SnackbarTitle = componentWithForwardedRef(SnackbarTitleBase);

export default SnackbarTitle;
