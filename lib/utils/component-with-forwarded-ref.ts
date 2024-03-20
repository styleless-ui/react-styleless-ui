/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

const componentWithForwardedRef = <
  TComponent extends React.ForwardRefRenderFunction<any, any>,
>(
  component: TComponent,
  name: string,
): React.FC<Parameters<TComponent>[0]> => {
  const forwarded: React.FC<Parameters<TComponent>[0]> =
    React.forwardRef(component);

  forwarded.displayName = name;

  return forwarded;
};

export default componentWithForwardedRef;
