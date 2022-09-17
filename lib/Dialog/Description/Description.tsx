import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import DialogContext from "../context";

interface DialogDescriptionBaseProps {
  /**
   * The content of the dialog title.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type DialogDescriptionProps<T extends React.ElementType = "span"> =
  MergeElementProps<
    T,
    DialogDescriptionBaseProps & {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      as?: T;
    }
  >;

const DialogDescriptionBase = <
  T extends React.ElementType = "strong",
  E extends HTMLElement = HTMLElement
>(
  props: DialogDescriptionProps<T>,
  ref: React.Ref<E>
) => {
  const {
    className,
    children,
    id: idProp,
    as: RootNode = "span",
    ...otherProps
  } = props;

  const dialogCtx = React.useContext(DialogContext);

  const id = useDeterministicId(idProp, "styleless-ui__dialog-description");

  const rootRef = React.useRef<E>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  React.useEffect(() => {
    const rootId = dialogCtx?.id;

    if (!rootId) return;
    if (!id) return;

    document.getElementById(rootId)?.setAttribute("aria-describedby", id);
  }, [dialogCtx, id]);

  return (
    <RootNode
      {...otherProps}
      id={id}
      ref={handleRef}
      data-slot="dialogDescription"
      className={className}
    >
      {children}
    </RootNode>
  );
};

const DialogDescription = componentWithForwardedRef(DialogDescriptionBase);

export default DialogDescription;
