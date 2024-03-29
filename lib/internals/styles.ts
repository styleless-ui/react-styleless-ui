import { type CSSProperties } from "react";

export const visuallyHiddenCSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  border: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
} as CSSProperties;

export const disableUserSelectCSSProperties = {
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  MsUserSelect: "none",
  KhtmlUserSelect: "none",
  userSelect: "none",
  WebkitTouchCallout: "none",
  MsTouchAction: "pan-y",
  touchAction: "pan-y",
  WebkitTapHighlightColor: "transparent",
} as CSSProperties;
