import * as React from "react";
import FocusTrap from "../../FocusTrap";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
} from "../../utils";
import SnackbarContext from "../context";
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

const SnackbarContentBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { className, children, id: idProp, ...otherProps } = props;

  const snackbarCtx = React.useContext(SnackbarContext);

  const id = useDeterministicId(idProp, "styleless-ui__snackbar-content");

  const [isTrappable, setIsTrappable] = React.useState(false);

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);

    if (!node) return;

    const actionEl = node.querySelector(`[data-slot="${ActionRootSlot}"]`);

    if (!actionEl) return setIsTrappable(false);

    setIsTrappable(true);
  };

  return (
    <FocusTrap enabled={snackbarCtx?.open && isTrappable}>
      <div
        {...otherProps}
        id={id}
        ref={refCallback}
        className={className}
        role={snackbarCtx?.role}
        data-slot={ContentRootSlot}
        aria-atomic="true"
        aria-live={
          snackbarCtx
            ? snackbarCtx.role === "alert"
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

const SnackbarContent = componentWithForwardedRef(SnackbarContentBase);

export default SnackbarContent;
