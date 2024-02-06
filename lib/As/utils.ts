import type { AnyObject } from "../types";

export const mergeProps = (slotProps: AnyObject, childProps: AnyObject) => {
  const overrideProps = Object.keys(childProps).reduce(
    (result, key) => {
      const slotPropValue = slotProps[key] as unknown;
      const childPropValue = childProps[key] as unknown;

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
            },
          };
        } else if (slotPropValue) overrideProps[key] = slotPropValue;
      } else if (isStyle) {
        return {
          ...result,
          [key]: {
            ...(slotPropValue as React.CSSProperties),
            ...(childPropValue as React.CSSProperties),
          },
        };
      } else if (isClassName) {
        return {
          ...result,
          [key]: [slotPropValue, childPropValue].filter(Boolean).join(" "),
        };
      }

      return result;
    },
    { ...childProps },
  );

  return { ...slotProps, ...overrideProps };
};
