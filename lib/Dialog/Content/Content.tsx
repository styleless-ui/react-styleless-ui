import * as React from "react";
import FocusTrap from "../../FocusTrap";
import type { MergeElementProps } from "../../typings";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import DialogContext from "../context";
import { ContentRoot as ContentRootSlot } from "../slots";

interface ContentOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type ContentProps = Omit<
  MergeElementProps<"div", ContentOwnProps>,
  "defaultChecked" | "defaultValue"
>;

const DialogContentBase = (
  props: ContentProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const { className, children, id: idProp, ...otherProps } = props;

  const dialogCtx = React.useContext(DialogContext);

  const id = useDeterministicId(idProp, "styleless-ui__dialog-content");

  return (
    <FocusTrap enabled={dialogCtx?.open}>
      <div
        {...otherProps}
        id={id}
        ref={ref}
        className={className}
        role={dialogCtx?.role}
        data-slot={ContentRootSlot}
        aria-modal="true"
      >
        {children}
      </div>
    </FocusTrap>
  );
};

const DialogContent = componentWithForwardedRef(DialogContentBase);

export default DialogContent;
