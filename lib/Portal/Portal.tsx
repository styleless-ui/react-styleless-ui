import * as React from "react";
import * as ReactDOM from "react-dom";
import { usePortalConfig } from "../PortalConfigProvider";
import { useIsServerHandoffComplete } from "../utils";
import { getContainer } from "./utils";

export interface Props {
  /**
   * A string containing one selector to match.
   * This string must be a valid CSS selector string;
   * if it isn't, a `SyntaxError` exception is thrown.
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

const Portal = (props: Props) => {
  const { containerQuerySelector, children, disabled = false } = props;

  const { destinationQuery } = usePortalConfig();
  const isServerHandoffComplete = useIsServerHandoffComplete();

  const containerQuery = containerQuerySelector || destinationQuery;

  const container: HTMLElement | null = React.useMemo(
    () => (isServerHandoffComplete ? getContainer(containerQuery) : null),
    [containerQuery, isServerHandoffComplete],
  );

  if (disabled) return <>{children}</>;
  if (!container) return null;

  return ReactDOM.createPortal(children, container);
};

export default Portal;
