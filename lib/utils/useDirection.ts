import * as React from "react";
import { getWindow, useIsServerHandoffComplete } from ".";

type Direction = "rtl" | "ltr";

const getDirection = <T extends HTMLElement = HTMLElement>(
  target?: T
): Direction => {
  const _window = getWindow(target ?? window);

  if (target) return _window.getComputedStyle(target).direction as Direction;
  return _window.getComputedStyle(document.body).direction as Direction;
};

const useDirection = <T extends HTMLElement = HTMLElement>(target?: T) => {
  const handoffCompletes = useIsServerHandoffComplete();

  const [direction, setDirection] = React.useState<Direction | null>(
    handoffCompletes ? getDirection(target) : null
  );

  React.useEffect(() => {
    if (direction) return;

    setDirection(getDirection(target));
  }, [direction, target]);

  return direction;
};

export default useDirection;
