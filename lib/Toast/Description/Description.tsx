import * as React from "react";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import {
  ContentRoot as ContentRootSlot,
  DescriptionRoot as DescriptionRootSlot,
} from "../slots";

interface OwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type Props<T extends React.ElementType = "span"> = MergeElementProps<
  T,
  OwnProps & {
    /**
     * The component used for the root node.
     * Either a string to use a HTML element or a component.
     */
    as?: T;
  }
>;

const ToastDescriptionBase = <
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
    as: RootNode = "span",
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__toast-description");

  const rootRef = React.useRef<E>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  const refCallback = (node: E | null) => {
    handleRef(node);

    if (!node) return;
    if (!id) return;

    const content = node.closest(`[data-slot='${ContentRootSlot}']`);

    if (content) {
      content.setAttribute("aria-describedby", id);
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "[StylelessUI][Toast]: You should always wrap your content with `<Toast.Content>` to provide accessibility features.",
      );
    }
  };

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={refCallback}
      data-slot={DescriptionRootSlot}
      className={className}
    >
      {children}
    </RootNode>
  );
};

const ToastDescription = componentWithForwardedRef(ToastDescriptionBase);

export default ToastDescription;
