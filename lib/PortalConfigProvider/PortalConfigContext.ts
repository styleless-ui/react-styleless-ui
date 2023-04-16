import * as React from "react";

export interface PortalConfigContextValue {
  destinationQuery?: string;
}

const PortalConfigContext = React.createContext<PortalConfigContextValue>({
  destinationQuery: undefined,
});

if (process.env.NODE_ENV !== "production")
  PortalConfigContext.displayName = "PortalConfigContext";

export default PortalConfigContext;
