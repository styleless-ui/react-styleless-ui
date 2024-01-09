import * as React from "react";

const componentWithForwardedRef = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends React.ForwardRefRenderFunction<any, any>,
>(
  component: C,
): C => {
  const forwarded = React.forwardRef(component);

  forwarded.displayName = component.displayName ?? component.name;

  return forwarded as unknown as C;
};

export default componentWithForwardedRef;
