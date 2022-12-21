import * as React from "react";
import type { UnknownObject } from "../typings";
import { componentWithForwardedRef, forkRefs, isFragment } from "../utils";

interface RootBaseProps {
  /**
   * The content of the component. It should be a single non-fragment React element.
   */
  children: React.ReactElement;
}

export type RootProps = React.HTMLAttributes<HTMLElement> & RootBaseProps;

const mergeProps = (slotProps: UnknownObject, childProps: UnknownObject) => {
  const overrideProps = Object.keys(childProps).reduce(
    (result, key) => {
      const slotPropValue = slotProps[key];
      const childPropValue = childProps[key];

      const isEventHandler = /^on[A-Z]/.test(key);
      const isStyle = key === "style";
      const isClassName = key === "className";

      if (isEventHandler) {
        const existsOnBoth = slotPropValue && childPropValue;

        if (existsOnBoth) {
          type EventHandler = (...args: unknown[]) => void;

          return {
            ...result,
            [key]: (...args: unknown[]) => {
              (childPropValue as EventHandler)(...args);
              (slotPropValue as EventHandler)(...args);
            }
          };
        } else if (slotPropValue) overrideProps[key] = slotPropValue;
      } else if (isStyle) {
        return {
          ...result,
          [key]: {
            ...(slotPropValue as React.CSSProperties),
            ...(childPropValue as React.CSSProperties)
          }
        };
      } else if (isClassName) {
        return {
          ...result,
          [key]: [slotPropValue, childPropValue].filter(Boolean).join(" ")
        };
      }

      return result;
    },
    { ...childProps }
  );

  return { ...slotProps, ...overrideProps };
};

const AsCloneBase = (
  props: RootProps & React.RefAttributes<HTMLElement>,
  ref: React.Ref<HTMLElement>
) => {
  const { children, ...otherProps } = props;

  if (React.isValidElement(children)) {
    type SingleElement = typeof children;

    if (isFragment(children)) {
      throw new Error(
        "[StylelessUI][As]: The component is not expected to receive a React Fragment child."
      );
    }

    const childProps = (children as SingleElement).props as UnknownObject;
    const cloneProps = mergeProps(otherProps, childProps);
    cloneProps.ref = forkRefs(
      ref,
      (children as SingleElement & { ref: React.Ref<unknown> }).ref
    );

    return React.cloneElement(children, cloneProps);
  }

  try {
    return React.Children.only(null);
  } catch {
    throw new Error(
      "[StylelessUI][As]: The component expected to receive a single React element child."
    );
  }
};

const AsClone = componentWithForwardedRef(AsCloneBase);

const AsBase = (props: RootProps, ref: React.Ref<HTMLElement>) => {
  const { children, ...otherProps } = props;

  return (
    <AsClone {...otherProps} ref={ref}>
      {children}
    </AsClone>
  );
};

const As = componentWithForwardedRef(AsBase);

export default As;
