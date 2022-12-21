import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import {
  ContentRoot as ContentRootSlot,
  TitleRoot as TitleRootSlot
} from "../slots";

interface TitleBaseProps {
  /**
   * The content of the component.
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

const DialogTitleBase = <
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

  const id = useDeterministicId(idProp, "styleless-ui__dialog-title");

  const rootRef = React.useRef<E>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: E | null) => {
    handleRef(node);

    if (!node) return;
    if (!id) return;

    const content = node.closest(`[data-slot='${ContentRootSlot}']`);

    if (content) {
      content.setAttribute("aria-labelledby", id);
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][Dialog]: You should always wrap your content with `<Dialog.Content>` to provide accessibility features."
      );
    }
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={refCallback}
      data-slot={TitleRootSlot}
      className={className}
    >
      {children}
    </RootNode>
  );
};

const DialogTitle = componentWithForwardedRef(DialogTitleBase);

export default DialogTitle;
