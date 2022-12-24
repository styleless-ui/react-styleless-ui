import * as React from "react";
import type { PolymorphicProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import {
  ContentRoot as ContentRootSlot,
  DescriptionRoot as DescriptionRootSlot
} from "../slots";

interface DescriptionOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type DescriptionProps<E extends React.ElementType> = PolymorphicProps<
  E,
  DescriptionOwnProps
>;

const DialogDescriptionBase = <
  E extends React.ElementType,
  R extends HTMLElement
>(
  props: DescriptionProps<E>,
  ref: React.Ref<R>
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "span",
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__dialog-description");

  const rootRef = React.useRef<R>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: R | null) => {
    handleRef(node);

    if (!node) return;
    if (!id) return;

    const content = node.closest(`[data-slot='${ContentRootSlot}']`);

    if (content) {
      content.setAttribute("aria-describedby", id);
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][Dialog]: You should always wrap your content with `<Snackbar.Content>` to provide accessibility features."
      );
    }
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      data-slot={DescriptionRootSlot}
    >
      {children}
    </RootNode>
  );
};

const DialogDescription = componentWithForwardedRef(DialogDescriptionBase);

export default DialogDescription;
