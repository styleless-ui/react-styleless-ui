import * as React from "react";
import FocusTrap from "../../FocusTrap";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
} from "../../utils";
import ToastContext from "../context";
import {
  ContentRoot as ContentRootSlot,
  ActionRoot as ActionRootSlot,
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

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ToastContentBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { className, children, id: idProp, ...otherProps } = props;

  const toastCtx = React.useContext(ToastContext);

  const id = useDeterministicId(idProp, "styleless-ui__toast-content");

  const [isTrappable, setIsTrappable] = React.useState(false);

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);

    if (!node) return;

    const actionEl = node.querySelector(`[data-slot="${ActionRootSlot}"]`);

    if (!actionEl) return setIsTrappable(false);

    setIsTrappable(true);
  };

  return (
    <FocusTrap enabled={toastCtx?.open && isTrappable}>
      <div
        {...otherProps}
        id={id}
        ref={refCallback}
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
    </FocusTrap>
  );
};

const ToastContent = componentWithForwardedRef(ToastContentBase);

export default ToastContent;
