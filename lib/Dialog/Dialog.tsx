import * as React from "react";
import FocusTrap from "../FocusTrap";
import { SystemKeys } from "../internals";
import Portal from "../Portal";
import { type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useEventListener,
  useIsMounted,
  useOnChange,
  usePreviousValue,
  useScrollGuard
} from "../utils";
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
   * Callback fired when the backdrop is clicked.
   */
  onBackdropClick?: React.MouseEventHandler<HTMLDivElement>;
  /**
   * Callback fired when the `Escape` key is released.
   */
  onEscapeKeyUp?: (event: KeyboardEvent) => void;
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   * @default false
   */
  keepMounted?: boolean;
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
    keepMounted = false,
    focusAfterClosed,
    classes: classesProp,
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
          if (event.key === SystemKeys.ESCAPE) onEscapeKeyUp?.(event);
        }
      },
      open && onEscapeKeyUp != null
    );
  }

  return keepMounted || (!keepMounted && open) ? (
    <Portal>
      <div
        data-slot="portal"
        role="presentation"
        tabIndex={-1}
        aria-hidden={!open}
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
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

const Dialog = componentWithForwardedRef(DialogBase);

export default Dialog;
