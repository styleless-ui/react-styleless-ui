import { type Props } from "./Tooltip";

export const getExactAnchorElement = (anchorElement: Props["anchorElement"]) =>
  typeof anchorElement === "string"
    ? typeof document !== "undefined"
      ? document.getElementById(anchorElement)
      : null
    : "current" in anchorElement
    ? anchorElement.current
    : anchorElement;
