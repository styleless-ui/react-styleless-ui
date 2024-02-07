import * as React from "react";

type ContextValue = {
  /**
   * A function that will resolve the container element for the portals.
   *
   * Please note that this function is only called on the client-side.
   */
  resolveContainer: () => HTMLElement | null;
};

const Context = React.createContext<ContextValue | null>(null);

if (process.env.NODE_ENV !== "production")
  Context.displayName = "PortalConfigContext";

export {
  Context as PortalConfigContext,
  type ContextValue as PortalConfigContextValue,
};
