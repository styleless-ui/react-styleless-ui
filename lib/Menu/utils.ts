import * as React from "react";
import { SystemKeys } from "../internals";

type ItemsRegistry = React.RefObject<HTMLDivElement>[];

export const makeRegisterItem =
  (registry: ItemsRegistry) => (itemRef: React.RefObject<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const itemAlreadyExists = registry.some(i => i.current === itemRef.current);

    if (itemAlreadyExists) return;

    registry.push(itemRef);
  };

export const useSearchQuery = (itemsRegistry: ItemsRegistry) => {
  type QueryRecord = {
    index: number;
    ref: React.RefObject<HTMLDivElement>;
  };

  const queryCacheTimeoutRef = React.useRef(-1);
  const cachedQueryRef = React.useRef<Set<string>>(new Set());
  const cachedQueryRecordsRef = React.useRef<QueryRecord[]>([]);

  const searchQuery = React.useCallback(
    (
      event: KeyboardEvent,
      state: {
        value: HTMLDivElement | null;
        set: (value: HTMLDivElement | null) => void;
      },
    ) => {
      const cacheCleanup = () => {
        window.clearTimeout(queryCacheTimeoutRef.current);
        queryCacheTimeoutRef.current = window.setTimeout(() => {
          cachedQueryRef.current.clear();
          cachedQueryRecordsRef.current = [];
        }, 1500);
      };

      const isModifier = [
        SystemKeys.ALT,
        SystemKeys.SHIFT,
        SystemKeys.CONTROL,
        SystemKeys.META,
      ].includes(event.key);

      if (isModifier) {
        cacheCleanup();

        return;
      }

      const queryChar = event.key.toLowerCase();
      const cachedString = Array.from(cachedQueryRef.current).join("");

      const shouldUseCachedRecords = queryChar === cachedString;

      cachedQueryRef.current.add(queryChar);

      if (cachedQueryRef.current.size > 1) {
        cacheCleanup();

        return;
      }

      const queryRecords = shouldUseCachedRecords
        ? cachedQueryRecordsRef.current
        : itemsRegistry.reduce((result, itemRef, idx) => {
            const item = itemRef.current;

            if (!item) return result;

            if (item.getAttribute("aria-disabled") === "true") {
              return result;
            }

            const text = item?.textContent;
            const queryMatched =
              text?.toLowerCase().trim()[0] === queryChar.toLowerCase();

            if (queryMatched) {
              const newRecord: QueryRecord = {
                ref: itemRef,
                index: idx,
              };

              return [...result, newRecord];
            }

            return result;
          }, [] as Array<QueryRecord>);

      if (queryRecords.length) {
        const idx = queryRecords.findIndex(
          record => record.ref.current === state.value,
        );

        let nextIdx: number | undefined = undefined;

        if (idx >= 0) {
          nextIdx = queryRecords[(idx + 1) % queryRecords.length]?.index;
        } else nextIdx = queryRecords[0]?.index;

        state.set(
          typeof nextIdx !== "undefined"
            ? itemsRegistry[nextIdx]?.current ?? null
            : null,
        );
      }

      cachedQueryRecordsRef.current = queryRecords;

      cacheCleanup();
    },
    [itemsRegistry],
  );

  return searchQuery;
};
