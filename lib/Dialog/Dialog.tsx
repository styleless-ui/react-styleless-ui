import useDeterministicId from "@utilityjs/use-deterministic-id";
import useEventListener from "@utilityjs/use-event-listener";
import useIsMounted from "@utilityjs/use-is-mounted";
import useOnChange from "@utilityjs/use-on-change";
import usePreviousValue from "@utilityjs/use-previous-value";
import useScrollGuard from "@utilityjs/use-scroll-guard";
import * as React from "react";
import FocusTrap from "../FocusTrap";
import { SystemKeys } from "../internals";
import Portal from "../Portal";
import { type MergeElementProps } from "../typings.d";
import { componentWithForwardedRef } from "../utils";
import DialogContext from "./context";

type DialogClassesMap = Record<"root" | "backdrop" | "panel", string>;

interface DialogBaseProps {
  /**
   * The content of the tab dialog.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?:
    | DialogClassesMap
    | ((ctx: { openState: boolean }) => DialogClassesMap);
  /**
   * If `true`, the dialog will be opened.
   */
  open: boolean;
  /**
   * The Callback fires when the dialog has opened.
   */
  onOpen?: () => void;
  /**
   * The Callback fires when the dialog has closed.
   */
  onClose?: () => void;
  /**
   * The DOM node reference or selector to focus when the dialog closes.
   *
   * If not provided, the previously focused element will be focused.
   */
  focusAfterClosed?: React.RefObject<HTMLElement> | string;
  /**
   * `alertdialog`: An alert dialog is a modal dialog that
   * interrupts the user's workflow to communicate an
   * important message and acquire a response.
   *
   * `dialog`: A modal dialog is a window overlaid on
   * either the primary window or another dialog window.
   */
  role: "dialog" | "alertdialog";
  /**
   * If `true`, the dialog will unmount.
   * Otherwise you have to control the visibility of the component with CSS styles.
   * @default true
   */
  unmountOnClose?: boolean;
  /**
   * Callback fired when the backdrop is clicked.
   */
  onBackdropClick?: React.MouseEventHandler<HTMLDivElement>;
  /**
   * Callback fired when the `Escape` key is released.
   */
  onEscapeKeyUp?: (event: KeyboardEvent) => void;
}

export type DialogProps = Omit<
  MergeElementProps<"div", DialogBaseProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const DialogBase = (props: DialogProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    open,
    children,
    id: idProp,
    role = "dialog",
    focusAfterClosed,
    classes: classesProp,
    unmountOnClose = true,
    onEscapeKeyUp,
    onBackdropClick,
    onOpen,
    onClose,
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const id = useDeterministicId(idProp, "styleless-ui__dialog");

  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  const prevOpen = usePreviousValue(open);

  const { disablePageScroll, enablePageScroll } = useScrollGuard();

  React.useEffect(() => {
    if (!open && typeof prevOpen === "boolean" && open !== prevOpen) {
      typeof focusAfterClosed === "string"
        ? document.querySelector<HTMLElement>(focusAfterClosed)?.focus()
        : typeof focusAfterClosed === "object"
        ? focusAfterClosed.current?.focus()
        : previouslyFocusedElement.current
        ? previouslyFocusedElement.current.focus()
        : document.body.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prevOpen]);

  useOnChange(open, openState => {
    if (!isMounted()) return;
    previouslyFocusedElement.current =
      document.activeElement as HTMLElement | null;

    if (typeof prevOpen !== "boolean") return;

    if (openState) {
      onOpen?.();
      disablePageScroll();
    } else {
      onClose?.();
      enablePageScroll();
    }
  });

  const classes =
    typeof classesProp === "function"
      ? classesProp({ openState: open })
      : classesProp;

  const context = React.useMemo(() => ({ id }), [id]);

  if (typeof document !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener(
      {
        target: document,
        eventType: "keyup",
        handler: event => {
          if (event.key === SystemKeys.Escape) onEscapeKeyUp?.(event);
        }
      },
      open && onEscapeKeyUp != null
    );
  }

  return unmountOnClose && open ? (
    <Portal>
      <div
        data-slot="portal"
        role="presentation"
        tabIndex={-1}
        aria-hidden={!open}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      >
        <div
          {...otherProps}
          data-slot="dialogRoot"
          ref={ref}
          className={classes?.root}
        >
          <div
            aria-hidden="true"
            data-slot="dialogBackdrop"
            className={classes?.backdrop}
            onClick={onBackdropClick}
          ></div>
          <FocusTrap enabled={open}>
            <div
              id={id}
              role={role}
              className={classes?.panel}
              aria-modal="true"
              data-slot="dialogPanel"
            >
              <DialogContext.Provider value={context}>
                {children}
              </DialogContext.Provider>
            </div>
          </FocusTrap>
        </div>
      </div>
    </Portal>
  ) : null;
};

const Dialog = componentWithForwardedRef<
  HTMLDivElement,
  DialogProps,
  typeof DialogBase
>(DialogBase);

export default Dialog;
