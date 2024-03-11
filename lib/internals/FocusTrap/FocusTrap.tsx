import * as React from "react";
import { SystemError, visuallyHiddenCSSProperties } from "..";
import {
  contains,
  isFocusable,
  useEventListener,
  useForkedRefs,
} from "../../utils";

export type Props = {
  /**
   * The content of the component.
   */
  children: JSX.Element;
  /**
   * If `true`, the focus will be trapped.
   *
   * @default false
   */
  enabled?: boolean;
  /**
   * Callback is called when focus is about to exit the trap.
   */
  onExit?: (event: FocusEvent) => void;
};

const FocusTrap = (props: Props) => {
  const { children, enabled = false, onExit } = props;

  const child = (() => {
    try {
      if (!React.isValidElement(children)) throw 0;
      return React.Children.only(
        children,
      ) as React.FunctionComponentElement<unknown>;
    } catch {
      throw new SystemError(
        "The `children` prop has to be a single valid element.",
        "FocusTrap",
      );
    }
  })();

  const ignoreFocusChanges = React.useRef(false);
  const lastFocus = React.useRef<Element | null>(null);

  const rootRef = React.useRef<HTMLElement>();
  const handleRootRef = useForkedRefs(rootRef, child.ref ?? null);

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

  const focusLastDescendant = (element?: Element): boolean => {
    const node = element ?? rootRef.current;

    return node
      ? Array.from(node.children)
          .reverse()
          .some(child => attemptFocus(child) || focusLastDescendant(child))
      : false;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => void (enabled && focusFirstDescendant()), [enabled]);

  const childProps = { ref: handleRootRef };

  if (typeof document !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener(
      {
        target: document,
        eventType: "focus",
        handler: event => {
          if (ignoreFocusChanges.current) return;
          if (!rootRef.current) return;

          if (contains(rootRef.current, event.target as Element)) {
            lastFocus.current = event.target as Element;
          } else {
            focusFirstDescendant();

            if (document.activeElement === lastFocus.current) {
              focusLastDescendant();
            }

            if (
              document.activeElement &&
              !contains(rootRef.current, document.activeElement)
            ) {
              (document.activeElement as HTMLElement)?.blur();

              onExit?.(event);
            }

            lastFocus.current = document.activeElement;
          }
        },
        options: { capture: true },
      },
      enabled,
    );
  }

  return (
    <>
      <div
        aria-hidden="true"
        tabIndex={enabled ? 0 : -1}
        style={visuallyHiddenCSSProperties}
      ></div>
      {React.cloneElement(child, childProps)}
      <div
        aria-hidden="true"
        tabIndex={enabled ? 0 : -1}
        style={visuallyHiddenCSSProperties}
      ></div>
    </>
  );
};

export default FocusTrap;
