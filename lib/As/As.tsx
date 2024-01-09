import * as React from "react";
import { componentWithForwardedRef } from "../utils";
import AsClone from "./AsClone";

interface OwnProps {
  /**
   * The content of the component. It should be a single non-fragment React element.
   */
  children: React.ReactElement;
}

export type Props = React.HTMLAttributes<HTMLElement> & OwnProps;

const AsBase = (props: Props, ref: React.Ref<HTMLElement>) => {
  const { children, ...otherProps } = props;

  return (
    <AsClone
      ref={ref}
      {...otherProps}
    >
      {children}
    </AsClone>
  );
};

const As = componentWithForwardedRef(AsBase);

export default As;
