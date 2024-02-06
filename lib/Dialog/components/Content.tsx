import * as React from "react";
import FocusTrap from "../../internals/FocusTrap";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { DialogContext } from "../context";
import { ContentRoot as ContentRootSlot } from "../slots";

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

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ContentBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
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

const Content = componentWithForwardedRef(ContentBase, "DialogContent");

export default Content;
