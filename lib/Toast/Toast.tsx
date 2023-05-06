import * as React from "react";
import Portal from "../Portal";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useIsMounted,
  useOnChange,
  usePreviousValue,
} from "../utils";
import ToastContext from "./context";
import { Root as ToastRootSlot } from "./slots";

interface OwnProps {
  /**
   * The content of the toast.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the toast.
   */
  className?: string | ((ctx: { openState: boolean }) => string);
  /**
   * If `true`, the toast will be opened.
   */
  open: boolean;
  /**
   * The DOM node reference or selector to focus when the toast closes.
   *
   * If not provided, the previously focused element will be focused.
   */
  focusAfterClosed?: React.RefObject<HTMLElement> | string;
  /**
   * The `status` role defines a live region containing advisory information for the user that is not important enough to be an `alert`.
   *
   * The `alert` role is for important, and usually time-sensitive, information.
   * @default "alert"
   */
  role: "alert" | "status";
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   * @default false
   */
  keepMounted?: boolean;
  /**
   * The time in milliseconds that should elapse before automatically closing the toast.
   */
  duration?: number;
  /**
   * The Callback is fired when the duration ends.
   */
  onDurationEnd?: () => void;
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ToastBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    open,
    duration,
    style,
    onDurationEnd,
    id: idProp,
    focusAfterClosed,
    role,
    keepMounted = false,
    children,
    className: classNameProp,
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const id = useDeterministicId(idProp, "styleless-ui__toast");

  const timeoutRef = React.useRef<number>(NaN);
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  const prevOpen = usePreviousValue(open);

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

  React.useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  useOnChange(open, openState => {
    if (!isMounted()) return;

    previouslyFocusedElement.current =
      document.activeElement as HTMLElement | null;

    if (openState && duration && onDurationEnd) {
      timeoutRef.current = window.setTimeout(onDurationEnd, duration);
    } else window.clearTimeout(timeoutRef.current);
  });

  const className =
    typeof classNameProp === "function"
      ? classNameProp({ openState: open })
      : classNameProp;

  const context = React.useMemo(() => ({ role, open }), [role, open]);

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
          style={{ ...(style ?? {}), position: "fixed" }}
          id={id}
          ref={ref}
          className={className}
          data-slot={ToastRootSlot}
          data-open={open ? "" : undefined}
        >
          <ToastContext.Provider value={context}>
            {children}
          </ToastContext.Provider>
        </div>
      </div>
    </Portal>
  ) : null;
};

const Toast = componentWithForwardedRef(ToastBase);

export default Toast;
