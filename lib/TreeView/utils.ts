import * as React from "react";
import { isFragment } from "react-is";
import { logger } from "../internals";
import { Item, type ItemProps } from "./components";

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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const getCurrentFocusedElement = (
  items: HTMLElement[],
  activeElement: HTMLElement | null,
  selectedEntities: string | string[] | null,
) => {
  if (items.length === 0) return null;

  if (activeElement) {
    const itemIdx = items.findIndex(item => item === activeElement);

    if (itemIdx > -1) {
      return {
        item: items[itemIdx]!,
        index: itemIdx,
      };
    }
  }

  const hasSelectedEntities =
    selectedEntities == null ? false : selectedEntities.length > 0;

  if (!hasSelectedEntities) {
    return {
      item: items[0]!,
      index: 0,
    };
  }

  const selectedItemIdx = items.findIndex(item =>
    item.hasAttribute("data-selected"),
  );

  if (selectedItemIdx === -1) {
    return {
      item: items[0]!,
      index: 0,
    };
  }

  return {
    item: items[selectedItemIdx]!,
    index: selectedItemIdx,
  };
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */
