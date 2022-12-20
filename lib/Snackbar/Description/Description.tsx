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
  Description as SnackbarDescriptionSlot
} from "../slots";

interface DescriptionBaseProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type DescriptionProps<T extends React.ElementType = "span"> =
  MergeElementProps<
    T,
    DescriptionBaseProps & {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      as?: T;
    }
  >;

const SnackbarDescriptionBase = <
  T extends React.ElementType = React.ElementType,
  E extends HTMLElement = HTMLElement
>(
  props: DescriptionProps<T>,
  ref: React.Ref<E>
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "span",
    ...otherProps
  } = props;

  const snackbarCtx = React.useContext(SnackbarContext);

  const id = useDeterministicId(idProp, "styleless-ui__snackbar-description");

  const rootRef = React.useRef<E>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: E | null) => {
    handleRef(node);

    if (!node) return;

    const rootId = snackbarCtx?.id;

    if (!rootId) return;
    if (!id) return;

    const content = node.closest(`[data-slot='${SnackbarContentSlot}']`);

    if (content) {
      content.setAttribute("aria-describedby", id);
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
      data-slot={SnackbarDescriptionSlot}
      className={className}
    >
      {children}
    </RootNode>
  );
};

const SnackbarDescription = componentWithForwardedRef(SnackbarDescriptionBase);

export default SnackbarDescription;
