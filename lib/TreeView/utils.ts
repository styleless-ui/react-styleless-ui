import * as React from "react";
import { isFragment } from "react-is";
import { logger } from "../internals";
import { Item, type ItemProps } from "./components";

export const getListItems = (id: string) => {
  const root = document.getElementById(id);

  if (!root) return [];

  return Array.from(root.querySelectorAll<HTMLElement>("[role='treeitem']"));
};

export const getValidChildren = (children: React.ReactNode, scope: string) => {
  let sizeOfSet = 0;
  let position = 1;

  const validChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child) || isFragment(child)) {
      logger(
        `The <${scope}> component doesn't accept \`Fragment\` or any invalid element as children.`,
        { scope, type: "error" },
      );

      return null;
    }

    if ((child as React.ReactElement).type !== Item) {
      logger(
        `The <${scope}> component only accepts <TreeView.Item> as a children`,
        { scope, type: "error" },
      );

      return null;
    }

    sizeOfSet++;

    return React.cloneElement(child as React.ReactElement<ItemProps>, {
      "aria-posinset": position++,
    });
  });

  return { validChildren, sizeOfSet };
};

export const getAvailableItem = (
  items: (HTMLElement | null)[],
  idx: number,
  forward: boolean,
  prevIdxs: number[] = [],
): { item: HTMLElement | null; index: number } => {
  const item = items[idx];

  if (!item) return { item: null, index: idx };
  if (prevIdxs.includes(idx)) return { item: null, index: idx };

  if (
    item.getAttribute("aria-disabled") === "true" ||
    item.hasAttribute("data-hidden") ||
    item.getAttribute("aria-hidden") === "true"
  ) {
    const newIdx = (forward ? idx + 1 : idx - 1 + items.length) % items.length;

    return getAvailableItem(items, newIdx, forward, [...prevIdxs, idx]);
  }

  return { item, index: idx };
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const getCurrentFocusedElement = (
  items: HTMLElement[],
  activeElement: HTMLElement | null,
) => {
  if (items.length === 0) return null;

  if (activeElement) {
    const itemIdx = items.findIndex(item => item === activeElement);

    if (itemIdx !== -1) {
      return {
        item: items[itemIdx]!,
        index: itemIdx,
      };
    }
  }

  const selectedItemIdx = items.findIndex(item =>
    item.hasAttribute("data-selected"),
  );

  const idx = selectedItemIdx === -1 ? 0 : selectedItemIdx;

  return getAvailableItem(items, idx, true);
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */
