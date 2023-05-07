import * as React from "react";
import {
  contains,
  isFocusable,
  useEventListener,
  useForkedRefs,
} from "../../utils";

export interface Props {
  /**
   * The content of the component.
   */
  children: JSX.Element;
  /**
   * If `true`, the focus will be redirected here (once!).
   * @default false
   */
  enabled?: boolean;
}

const FocusRedirect = (props: Props) => {
  const { children, enabled = false } = props;

  const child = (() => {
    try {
      if (!React.isValidElement(children)) throw 0;
      return React.Children.only(
        children,
      ) as React.FunctionComponentElement<unknown>;
    } catch {
      throw new Error(
        "[StylelessUI][FocusTrap]: The `children` prop has to be a single valid element.",
      );
    }
  })();

  const ignoreFocusChanges = React.useRef(false);
  const isRedirectionCompleted = React.useRef(false);

  const reservedActiveElement = React.useRef<HTMLElement | null>(null);

  const rootRef = React.useRef<HTMLElement>();
  const handleRootRef = useForkedRefs(rootRef, child.ref ?? null);

  const childProps = { ref: handleRootRef };

  React.useEffect(() => {
    if (enabled) {
      reservedActiveElement.current =
        document.activeElement as HTMLElement | null;
    }

    isRedirectionCompleted.current = false;
  }, [enabled]);

  const attemptFocus = (element?: Element) => {
    const node = element ?? rootRef.current;

    if (!node) return false;
    if (!isFocusable(node)) return false;

    ignoreFocusChanges.current = true;

    try {
      (node as HTMLElement).focus();
      // eslint-disable-next-line no-empty
    } catch {}

    ignoreFocusChanges.current = false;

    return document.activeElement === node;
  };

  const focusFirstDescendant = (element?: Element): boolean => {
    const node = element ?? rootRef.current;

    return node
      ? Array.from(node.children).some(
          child => attemptFocus(child) || focusFirstDescendant(child),
        )
      : false;
  };

  if (typeof document !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener(
      {
        target: document,
        eventType: "focus",
        handler: event => {
          if (ignoreFocusChanges.current) return;
          if (!rootRef.current) return;
          if (contains(rootRef.current, event.target as Element)) return;
          else if (isRedirectionCompleted.current) {
            if (event.relatedTarget !== reservedActiveElement.current)
              reservedActiveElement.current?.focus();

            reservedActiveElement.current = null;
            return;
          }

          isRedirectionCompleted.current = true;
          const focused = focusFirstDescendant();

          if (!focused) {
            reservedActiveElement.current =
              document.activeElement as HTMLElement | null;
          }
        },
        options: { capture: true },
      },
      enabled,
    );
  }

  return React.cloneElement(child, childProps);
};

export default FocusRedirect;
