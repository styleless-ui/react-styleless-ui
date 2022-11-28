import * as React from "react";
import { getWindow, useIsServerHandoffComplete } from ".";

type Direction = "rtl" | "ltr";

const getDirection = <T extends HTMLElement = HTMLElement>(
  targetRef?: React.RefObject<T>
): Direction => {
  const _window = getWindow(targetRef?.current ?? window);

  if (targetRef && targetRef.current)
    return _window.getComputedStyle(targetRef.current).direction as Direction;

  return _window.getComputedStyle(document.body).direction as Direction;
};

const useDirection = <T extends HTMLElement = HTMLElement>(
  targetRef?: React.RefObject<T>
) => {
  const handoffCompletes = useIsServerHandoffComplete();

  const [direction, setDirection] = React.useState<Direction | null>(
    handoffCompletes ? getDirection(targetRef) : null
  );

  React.useEffect(() => {
    const newDirection = getDirection(targetRef);

    if (direction === newDirection) return;
    setDirection(newDirection);
  }, [direction, targetRef]);

  return direction;
};

export default useDirection;
