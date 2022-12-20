import * as React from "react";
import FocusTrap from "../../FocusTrap";
import { type MergeElementProps } from "../../typings.d";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import SnackbarContext from "../context";
import { Content as SnackbarContentSlot } from "../slots";

interface ContentBaseProps {
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
  MergeElementProps<"div", ContentBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const SnackbarContentBase = (
  props: ContentProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const { className, children, id: idProp, ...otherProps } = props;

  const snackbarCtx = React.useContext(SnackbarContext);

  const id = useDeterministicId(idProp, "styleless-ui__snackbar-content");

  const renderContent = () => (
    <div
      {...otherProps}
      id={id}
      ref={ref}
      className={className}
      role={snackbarCtx?.role}
      data-slot={SnackbarContentSlot}
      aria-atomic="true"
      aria-live={
        snackbarCtx
          ? ["alert", "alertdialog"].includes(snackbarCtx.role)
            ? "assertive"
            : "polite"
          : "off"
      }
    >
      {children}
    </div>
  );

  return snackbarCtx?.role === "alertdialog" ? (
    <FocusTrap enabled={snackbarCtx?.open}>{renderContent()}</FocusTrap>
  ) : (
    renderContent()
  );
};

const SnackbarContent = componentWithForwardedRef(SnackbarContentBase);

export default SnackbarContent;
