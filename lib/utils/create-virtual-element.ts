import type { VirtualElement } from "../types";

const createVirtualElement = (
  width: number,
  height: number,
  x: number,
  y: number,
): VirtualElement => ({
  getBoundingClientRect: () => ({
    width,
    height,
    x,
    y,
    left: x,
    top: y,
    right: width + x,
    bottom: height + y,
  }),
});

export default createVirtualElement;
