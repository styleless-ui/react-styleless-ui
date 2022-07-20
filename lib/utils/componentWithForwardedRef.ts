import * as React from "react";

const componentWithForwardedRef = <
  RefType,
  Props,
  C extends React.ForwardRefRenderFunction<RefType, Props>
>(
  component: C
): C => {
  const forwarded = React.forwardRef(component);
  forwarded.displayName = component.displayName ?? component.name;

  return forwarded as unknown as C;
};

export default componentWithForwardedRef;
