import * as React from "react";
import Portal from "../Portal";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useIsMounted,
  useOnChange,
  usePreviousValue,
  useScrollGuard,
} from "../utils";
import DialogContext from "./context";
import { Backdrop as BackdropSlot, Root as RootSlot } from "./slots";

type DialogClassesMap = Classes<"root" | "backdrop">;

interface OwnProps {
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
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   * @default false
   */
  keepMounted?: boolean;
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const DialogBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    open,
    children,
    id: idProp,
    role,
    keepMounted = false,
    focusAfterClosed,
    classes: classesProp,
    onBackdropClick,
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => enablePageScroll(), []);

  useOnChange(open, openState => {
    if (!isMounted()) return;

    previouslyFocusedElement.current =
      document.activeElement as HTMLElement | null;

    if (typeof prevOpen !== "boolean") return;

    if (openState) disablePageScroll();
    else enablePageScroll();
  });

  const classes =
    typeof classesProp === "function"
      ? classesProp({ openState: open })
      : classesProp;

  const context = React.useMemo(() => ({ open, role }), [role, open]);

  return keepMounted || (!keepMounted && open) ? (
    <Portal>
      <div
        data-slot="Portal:Root"
        role="presentation"
        tabIndex={-1}
        aria-hidden={!open}
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <div
          {...otherProps}
          id={id}
          ref={ref}
          className={classes?.root}
          data-slot={RootSlot}
        >
          <div
            aria-hidden="true"
            data-slot={BackdropSlot}
            className={classes?.backdrop}
            onClick={onBackdropClick}
          />
          <DialogContext.Provider value={context}>
            {children}
          </DialogContext.Provider>
        </div>
      </div>
    </Portal>
  ) : null;
};

const Dialog = componentWithForwardedRef(DialogBase);

export default Dialog;
