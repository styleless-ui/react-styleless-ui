import * as React from "react";

const useIsInitialRenderComplete = () => {
  const [isInitialRenderComplete, setIsInitialRenderComplete] =
    React.useState(false);

  React.useEffect(() => {
    setIsInitialRenderComplete(true);
  }, []);

  return isInitialRenderComplete;
};

export default useIsInitialRenderComplete;
