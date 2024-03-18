import * as React from "react";
import Portal from "../Portal";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useIsMounted,
  useOnChange,
} from "../utils";
import { ToastContext } from "./context";
import { Root as ToastRootSlot } from "./slots";

export type RenderProps = {
  /**
   * The `open` state of the component.
   */
  open: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the toast.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the toast.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * If `true`, the toast will be opened.
   */
  open: boolean;
  /**
   * The `status` role defines a live region containing advisory information for the user that is not important enough to be an `alert`.
   *
   * The `alert` role is for important, and usually time-sensitive, information.
   *
   * @default "alert"
   */
  role: "alert" | "status";
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   *
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
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const ToastBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    style: styleProp,
    className: classNameProp,
    children: childrenProp,
    id: idProp,
    open,
    duration,
    role,
    onDurationEnd,
    keepMounted = false,
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const id = useDeterministicId(idProp, "styleless-ui__toast");

  const timeoutRef = React.useRef<number>(NaN);
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  useOnChange(open, openState => {
    if (!isMounted()) return;

    if (openState) {
      previouslyFocusedElement.current =
        document.activeElement as HTMLElement | null;

      if (duration && onDurationEnd) {
        timeoutRef.current = window.setTimeout(onDurationEnd, duration);
      }
    } else {
      window.clearTimeout(timeoutRef.current);

      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      } else document.body.focus();
    }
  });

  const renderProps: RenderProps = { open };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    position: "fixed",
  };

  const context = React.useMemo(() => ({ role, open }), [role, open]);

  if (!keepMounted && !open) return null;

  return (
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
          style={style}
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
  );
};

const Toast = componentWithForwardedRef(ToastBase, "Toast");

export default Toast;
