import * as React from "react";
import type { PolymorphicProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import {
  ContentRoot as ContentRootSlot,
  TitleRoot as TitleRootSlot,
} from "../slots";

interface TitleOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type TitleProps<E extends React.ElementType> = PolymorphicProps<
  E,
  TitleOwnProps
>;

const DialogTitleBase = <E extends React.ElementType, R extends HTMLElement>(
  props: TitleProps<E>,
  ref: React.Ref<R>,
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "strong",
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__dialog-title");

  const rootRef = React.useRef<R>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: R | null) => {
    handleRef(node);

    if (!node) return;
    if (!id) return;

    const content = node.closest(`[data-slot='${ContentRootSlot}']`);

    if (content) {
      content.setAttribute("aria-labelledby", id);
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][Dialog]: You should always wrap your content with `<Dialog.Content>` to provide accessibility features.",
      );
    }
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      data-slot={TitleRootSlot}
    >
      {children}
    </RootNode>
  );
};

const DialogTitle = componentWithForwardedRef(DialogTitleBase);

export default DialogTitle;
