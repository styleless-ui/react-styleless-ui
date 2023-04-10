import { getNodeName, getWindow } from "./dom";

declare global {
  interface Window {
    HTMLElement: typeof HTMLElement;
    Element: typeof Element;
    Node: typeof Node;
    ShadowRoot: typeof ShadowRoot;
    HTMLInputElement: typeof HTMLInputElement;
  }
}

export const isWindow = <T extends { toString?: () => string }>(
  input: unknown,
): input is Window =>
  !input ? false : (input as T).toString?.() === "[object Window]";

export const isElement = (input: unknown): input is Element =>
  input instanceof getWindow(input as Node).Element;

export const isHTMLElement = (input: unknown): input is HTMLElement =>
  input instanceof getWindow(input as Node).HTMLElement;

export const isHTMLInputElement = (input: unknown): input is HTMLInputElement =>
  input instanceof getWindow(input as Node).HTMLInputElement;

export const isNode = (input: unknown): input is Node =>
  input instanceof getWindow(input as Node).Node;

export const isShadowRoot = (node: Node): node is ShadowRoot =>
  node instanceof getWindow(node).ShadowRoot || node instanceof ShadowRoot;

export const isOverflowElement = (element: HTMLElement): boolean => {
  const { overflow, overflowX, overflowY } =
    getWindow(element).getComputedStyle(element);

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
 */
export const isContainingBlock = (element: Element): boolean => {
  const window = getWindow(element);

  const css = window.getComputedStyle(element);
  const isFirefox = window.navigator.userAgent
    .toLowerCase()
    .includes("firefox");

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    css.backdropFilter !== "none" ||
    css.transform !== "none" ||
    css.perspective !== "none" ||
    css.contain === "paint" ||
    ["transform", "perspective"].includes(css.willChange) ||
    (isFirefox && css.willChange === "filter") ||
    (isFirefox && (css.filter ? css.filter !== "none" : false))
  );
};

export const isFocusable = (node: Node): boolean => {
  if (!node) return false;

  if (isHTMLElement(node) && node.tabIndex < 0) return false;
  if (isHTMLInputElement(node) && node.disabled) return false;

  switch (getNodeName(node)) {
    case "a":
      return (
        !!(<HTMLAnchorElement>node).href &&
        (<HTMLAnchorElement>node).rel !== "ignore"
      );
    case "input":
      return (<HTMLInputElement>node).type !== "hidden";
    case "button":
    case "select":
    case "textarea":
      return true;
    default:
      return false;
  }
};

export { isFragment } from "react-is";
