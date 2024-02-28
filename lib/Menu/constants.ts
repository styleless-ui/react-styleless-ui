import { createCustomEvent } from "../utils";

export const ExpandSubMenuEvent = createCustomEvent("Menu", "expandSubMenu", {
  bubbles: true,
  cancelable: true,
});

export const CollapseSubMenuEvent = createCustomEvent(
  "Menu",
  "collapseSubMenu",
  {
    bubbles: true,
    cancelable: true,
  },
);
