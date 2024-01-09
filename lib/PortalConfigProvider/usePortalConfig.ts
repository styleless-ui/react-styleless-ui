import * as React from "react";
import { PortalConfigContext } from "./context";

const usePortalConfig = () => React.useContext(PortalConfigContext);

export default usePortalConfig;
