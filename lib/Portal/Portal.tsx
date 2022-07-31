import * as React from "react";
import { createPortal } from "react-dom";
import { useIsomorphicLayoutEffect } from "../utils";

export interface PortalProps {
  /**
   * A string containing one selector to match.
   * This string must be a valid CSS selector string;
   * if it isn't, a `SyntaxError` exception is thrown.
   *
   * If not provided, `document.body` will be used as the default container.
   */
  containerQuerySelector?: string;
  /**
   * The children to render into the container.
   */
  children: React.ReactNode;
  /**
   * If `true`, the `children` will be under the DOM hierarchy of the parent component.
   * @default false
   */
  disabled?: boolean;
}

const getContainer = (querySelector?: string) =>
  querySelector
    ? document.querySelector<HTMLElement>(querySelector)
    : document.body;

const Portal = (props: PortalProps) => {
  const { containerQuerySelector, children, disabled = false } = props;

  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (disabled) return;

    setContainer(getContainer(containerQuerySelector));
  }, [disabled, containerQuerySelector]);

  if (disabled && React.isValidElement(children)) return <>{children}</>;

  return container ? createPortal(children, container) : null;
};

export default Portal;
