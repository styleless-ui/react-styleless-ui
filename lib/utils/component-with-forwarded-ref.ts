/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { Component } from "../types";

const componentWithForwardedRef = <
  TComponent extends React.ForwardRefRenderFunction<any, any>,
>(
  component: TComponent,
  name: string,
): Component<Parameters<TComponent>[0]> => {
  const forwarded = React.forwardRef(component);

  forwarded.displayName = name;

  return forwarded as unknown as Component<Parameters<TComponent>[0]>;
};

export default componentWithForwardedRef;
