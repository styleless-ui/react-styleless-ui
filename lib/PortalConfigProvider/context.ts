import * as React from "react";

type ContextValue = {
  destinationQuery?: string;
};

const Context = React.createContext<ContextValue>({
  destinationQuery: undefined,
});

if (process.env.NODE_ENV !== "production")
  Context.displayName = "PortalConfigContext";

export {
  Context as PortalConfigContext,
  type ContextValue as PortalConfigContextValue,
};
