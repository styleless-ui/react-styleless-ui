import * as React from "react";
import { logger } from "../../internals";
import type { PolymorphicProps } from "../../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import {
  ContentRoot as ContentRootSlot,
  DescriptionRoot as DescriptionRootSlot,
} from "../slots";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
};

export type Props<E extends React.ElementType = "p"> = PolymorphicProps<
  E,
  OwnProps
>;

const DescriptionBase = <
  E extends React.ElementType = "p",
  R extends HTMLElement = HTMLParagraphElement,
>(
  props: Props<E>,
  ref: React.Ref<R>,
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "p",
    ...otherProps
  } = props as Props<"p">;

  const id = useDeterministicId(idProp, "styleless-ui__dialog-description");

  const rootRef = React.useRef<R>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: R | null) => {
    handleRef(node);

    if (!node) return;

    const content = node.closest(`[data-slot='${ContentRootSlot}']`);

    if (content) {
      content.setAttribute("aria-describedby", id);
    } else {
      logger(
        "You should always wrap your content with <Dialog.Content> to provide " +
          "accessibility features.",
        { scope: "Dialog", type: "error" },
      );
    }
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={refCallback as React.LegacyRef<HTMLParagraphElement>}
      className={className}
      data-slot={DescriptionRootSlot}
    >
      {children}
    </RootNode>
  );
};

const Description = componentWithForwardedRef(
  DescriptionBase,
  "Dialog.Description",
);

export default Description;
