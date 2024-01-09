export const getContainer = (querySelector?: string) =>
  querySelector
    ? document.querySelector<HTMLElement>(querySelector)
    : document.body;
