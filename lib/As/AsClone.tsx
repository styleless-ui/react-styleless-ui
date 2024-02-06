import * as React from "react";
import { SystemError } from "../internals";
import type { UnknownObject } from "../types";
import { componentWithForwardedRef, forkRefs, isFragment } from "../utils";
import { type Props } from "./As";
import { mergeProps } from "./utils";

const AsCloneBase = (
  props: Props & React.RefAttributes<HTMLElement>,
  ref: React.Ref<HTMLElement>,
) => {
  const { children, ...otherProps } = props;

  if (React.isValidElement(children)) {
    type SingleElement = typeof children;

    if (isFragment(children)) {
      throw new SystemError(
        "The component is not expected to receive a React Fragment child.",
        "As",
      );
    }

    const childProps = (children as SingleElement).props as UnknownObject;
    const cloneProps = mergeProps(otherProps, childProps);

    cloneProps.ref = forkRefs(
      ref,
      (children as SingleElement & { ref: React.Ref<unknown> }).ref,
    );

    return React.cloneElement(children, cloneProps);
  }

  try {
    return React.Children.only(null);
  } catch {
    throw new SystemError(
      "The component expected to receive a single React element child.",
      "As",
    );
  }
};

const AsClone = componentWithForwardedRef(AsCloneBase, "AsClone");

export default AsClone;
