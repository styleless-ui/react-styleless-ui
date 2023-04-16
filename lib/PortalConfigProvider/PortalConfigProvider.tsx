import * as React from "react";
import PortalConfigContext, {
  type PortalConfigContextValue,
} from "./PortalConfigContext";

export interface Props {
  children: React.ReactNode;
  config: PortalConfigContextValue;
}

const PortalConfigProvider = (props: Props) => {
  const { config, children } = props;

  return (
    <PortalConfigContext.Provider value={config}>
      {children}
    </PortalConfigContext.Provider>
  );
};

export default PortalConfigProvider;
