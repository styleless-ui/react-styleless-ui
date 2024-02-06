import * as React from "react";
import { FocusRedirect } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { ToastContext } from "../context";
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

  const toastCtx = React.useContext(ToastContext);

  const id = useDeterministicId(idProp, "styleless-ui__toast-content");

  return (
    <FocusRedirect enabled={toastCtx?.open}>
      <div
        {...otherProps}
        id={id}
        ref={ref}
        className={className}
        role={toastCtx?.role}
        data-slot={ContentRootSlot}
        aria-atomic="true"
        aria-live={
          toastCtx
            ? toastCtx.role === "alert"
              ? "assertive"
              : "polite"
            : "off"
        }
      >
        {children}
      </div>
    </FocusRedirect>
  );
};

const Content = componentWithForwardedRef(ContentBase, "Toast.Content");

export default Content;
