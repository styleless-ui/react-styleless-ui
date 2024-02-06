import * as React from "react";
import { isPrintableKey } from "./is";
import useEventCallback from "./use-event-callback";

type CharRecords = {
  index: number;
  element: HTMLElement;
};

type Config = {
  activeDescendantElement: HTMLElement | null;
  getListItems: () => HTMLElement[];
  onActiveDescendantElementChange: (element: HTMLElement | null) => void;
};

const useJumpToChar = <T extends HTMLElement>(config: Config) => {
  const {
    activeDescendantElement,
    onActiveDescendantElementChange,
    getListItems,
  } = config;

  const charCacheTimeoutRef = React.useRef(-1);
  const cachedChar = React.useRef("");
  const cachedCharRecords = React.useRef<CharRecords[]>([]);

  const cleaup = () => {
    window.clearTimeout(charCacheTimeoutRef.current);
    charCacheTimeoutRef.current = window.setTimeout(() => {
      cachedChar.current = "";
      cachedCharRecords.current = [];
    }, 1500);
  };

  const jumpToChar = useEventCallback<React.KeyboardEvent<T>>(event => {
    if (!isPrintableKey(event.key)) return;

    const queryChar = event.key.toLowerCase();

    const shouldUseCachedRecords = queryChar === cachedChar.current;

    cachedChar.current += shouldUseCachedRecords ? "" : queryChar;

    if (cachedChar.current.length > 1) {
      cleaup();

      return;
    }

    let records: CharRecords[] = cachedCharRecords.current;
    const items = getListItems();

    if (!shouldUseCachedRecords) {
      records = items.reduce((result, item, idx) => {
        if (
          item.getAttribute("aria-disabled") === "true" ||
          item.hasAttribute("data-hidden") ||
          item.getAttribute("aria-hidden") === "true"
        ) {
          return result;
        }

        const text = item.textContent;
        const queryMatched =
          text?.toLowerCase().trim()[0] === queryChar.toLowerCase();

        if (queryMatched) result.push({ index: idx, element: item });

        return result;
      }, [] as CharRecords[]);
    }

    if (records.length) {
      const idx = records.findIndex(
        record => record.element === activeDescendantElement,
      );

      let nextIdx: number | undefined = undefined;

      if (idx >= 0) {
        nextIdx = records[(idx + 1) % records.length]?.index;
      } else nextIdx = records[0]?.index;

      const nextActive =
        typeof nextIdx === "undefined" ? null : items[nextIdx] ?? null;

      onActiveDescendantElementChange(nextActive);
    }

    cachedCharRecords.current = records;

    cleaup();
  });

  return jumpToChar;
};

export default useJumpToChar;
