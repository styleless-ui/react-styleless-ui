import * as React from "react";
import { logger } from "../../internals";
import type { PolymorphicComponent, PolymorphicProps } from "../../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import {
  ContentRoot as ContentRootSlot,
  TitleRoot as TitleRootSlot,
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

export type Props<E extends React.ElementType = "h2"> = PolymorphicProps<
  E,
  OwnProps
>;

const TitleBase = <
  E extends React.ElementType = "h2",
  R extends HTMLElement = HTMLHeadingElement,
>(
  props: Props<E>,
  ref: React.Ref<R>,
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "h2",
    ...otherProps
  } = props as Props<"h2">;

  const id = useDeterministicId(idProp, "styleless-ui__dialog-title");

  const rootRef = React.useRef<R>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: R | null) => {
    handleRef(node);

    if (!node) return;

    const content = node.closest(`[data-slot='${ContentRootSlot}']`);

    if (content) {
      content.setAttribute("aria-labelledby", id);
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
      ref={refCallback as React.LegacyRef<HTMLHeadingElement>}
      className={className}
      data-slot={TitleRootSlot}
    >
      {children}
    </RootNode>
  );
};

const Title: PolymorphicComponent<"h2", OwnProps> = componentWithForwardedRef(
  TitleBase,
  "Dialog.Title",
);

export default Title;
