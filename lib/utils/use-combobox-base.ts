import * as React from "react";
import { flushSync } from "react-dom";
import {
  isPrintableKey,
  useEventCallback,
  useForkedRefs,
  useIsFocusVisible,
  useIsMounted,
  useIsomorphicLayoutEffect,
  useJumpToChar,
  useOnChange,
} from ".";
import { SystemKeys } from "../internals";

type Props<T extends HTMLElement> = {
  disabled: boolean;
  autoFocus: boolean;
  searchable: boolean;
  activeDescendant: HTMLElement | null;
  listOpenState: boolean;
  onClick?: React.MouseEventHandler<T>;
  onBlur?: React.FocusEventHandler<T>;
  onFocus?: React.FocusEventHandler<T>;
  onKeyDown?: React.KeyboardEventHandler<T>;
  onKeyUp?: React.KeyboardEventHandler<T>;
  onPrintableKeyDown?: React.KeyboardEventHandler<T>;
  onEscapeKeyDown?: React.KeyboardEventHandler<T>;
  onBackSpaceKeyDown?: React.KeyboardEventHandler<T>;
  onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  getListItems: () => HTMLElement[];
  onFilteredEntities: (entities: null | string[]) => void;
  onListOpenChange: (nextListOpenState: boolean) => void;
  onActiveDescendantChange: (nextActiveDescendant: HTMLElement | null) => void;
};

const useComboboxBase = <T extends HTMLElement>(props: Props<T>) => {
  const {
    onClick,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onInputChange,
    onPrintableKeyDown,
    onEscapeKeyDown,
    onBackSpaceKeyDown,
    getListItems,
    onActiveDescendantChange,
    onListOpenChange,
    onFilteredEntities,
    listOpenState,
    activeDescendant,
    searchable = false,
    disabled = false,
    autoFocus = false,
  } = props;

  const isMounted = useIsMounted();

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible<T>();

  const jumpToChar = useJumpToChar({
    activeDescendantElement: activeDescendant,
    getListItems,
    onActiveDescendantElementChange: onActiveDescendantChange,
  });

  const ref = React.useRef<T>();
  const handleRef = useForkedRefs(ref, focusVisibleRef);

  const isSelectOnly = !searchable;

  const [isFocusedVisible, setIsFocusedVisible] = React.useState(() =>
    disabled ? false : autoFocus,
  );

  if (disabled && isFocusedVisible) setIsFocusedVisible(false);

  // Sync focus visible states
  React.useEffect(() => void (isFocusVisibleRef.current = isFocusedVisible));

  // Initial focus
  useIsomorphicLayoutEffect(() => {
    if (!isFocusedVisible) return;

    ref.current?.focus();
  }, []);

  useOnChange(listOpenState, currentOpenState => {
    if (currentOpenState) return;
    if (!(ref.current instanceof HTMLInputElement)) return;

    ref.current.value = "";
    onFilteredEntities(null);
  });

  const handleClick = useEventCallback<React.MouseEvent<T>>(event => {
    event.preventDefault();

    if (disabled || !isMounted()) return;

    onClick?.(event);
  });

  const handleFocus = useEventCallback<React.FocusEvent<T>>(event => {
    if (disabled || !isMounted()) return;

    // Fix for https://github.com/facebook/react/issues/7769
    if (!ref.current) ref.current = event.currentTarget;

    handleFocusVisible(event);

    if (isFocusVisibleRef.current) setIsFocusedVisible(true);

    onFocus?.(event);
  });

  const handleBlur = useEventCallback<React.FocusEvent<T>>(event => {
    if (disabled || !isMounted()) return;

    handleBlurVisible(event);

    if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

    onBlur?.(event);
  });

  const handleKeyDown = useEventCallback<React.KeyboardEvent<T>>(event => {
    if (disabled || !isMounted()) return;

    onKeyDown?.(event);

    const getAvailableItem = (
      items: (HTMLElement | null)[],
      idx: number,
      forward: boolean,
      prevIdxs: number[] = [],
    ): HTMLElement | null => {
      const item = items[idx];

      if (!item) return null;
      if (prevIdxs.includes(idx)) return null;

      if (
        item.getAttribute("aria-disabled") === "true" ||
        item.hasAttribute("data-hidden") ||
        item.getAttribute("aria-hidden") === "true"
      ) {
        const newIdx =
          (forward ? idx + 1 : idx - 1 + items.length) % items.length;

        return getAvailableItem(items, newIdx, forward, [...prevIdxs, idx]);
      }

      return item;
    };

    switch (event.key) {
      case SystemKeys.DOWN: {
        event.preventDefault();

        if (!listOpenState) {
          flushSync(() => {
            onListOpenChange(true);
          });

          const items = getListItems();
          const nextActive = getAvailableItem(items, 0, true);

          onActiveDescendantChange(nextActive);

          return;
        }

        const items = getListItems();

        const currentIdx = activeDescendant
          ? items.findIndex(item => item === activeDescendant)
          : -1;

        const nextIdx = (currentIdx + 1) % items.length;

        const nextActive = getAvailableItem(items, nextIdx, true);

        onActiveDescendantChange(nextActive);

        break;
      }

      case SystemKeys.UP: {
        event.preventDefault();

        if (!listOpenState) {
          flushSync(() => {
            onListOpenChange(true);
          });

          const items = getListItems();
          const nextActive = getAvailableItem(items, 0, true);

          onActiveDescendantChange(nextActive);

          return;
        }

        const items = getListItems();

        const currentIdx = activeDescendant
          ? items.findIndex(item => item === activeDescendant)
          : -1;

        const nextIdx =
          currentIdx === -1
            ? 0
            : (currentIdx - 1 + items.length) % items.length;

        const nextActive = getAvailableItem(items, nextIdx, false);

        onActiveDescendantChange(nextActive);

        break;
      }

      case SystemKeys.HOME: {
        event.preventDefault();

        if (!listOpenState) {
          flushSync(() => {
            onListOpenChange(true);
          });

          const items = getListItems();
          const nextActive = getAvailableItem(items, 0, true);

          onActiveDescendantChange(nextActive);

          return;
        }

        const items = getListItems();
        const nextActive = getAvailableItem(items, 0, false);

        onActiveDescendantChange(nextActive);

        break;
      }

      case SystemKeys.END: {
        event.preventDefault();

        if (!listOpenState) {
          flushSync(() => {
            onListOpenChange(true);
          });

          const items = getListItems();
          const nextActive = getAvailableItem(items, items.length - 1, true);

          onActiveDescendantChange(nextActive);

          return;
        }

        const items = getListItems();
        const nextActive = getAvailableItem(items, items.length - 1, false);

        onActiveDescendantChange(nextActive);

        break;
      }

      case SystemKeys.ESCAPE: {
        return onEscapeKeyDown?.(event);
      }

      case SystemKeys.TAB: {
        return onListOpenChange(false);
      }

      case SystemKeys.BACKSPACE: {
        return onBackSpaceKeyDown?.(event);
      }

      case SystemKeys.ENTER: {
        if (!listOpenState) {
          if (!isSelectOnly) return;

          event.preventDefault();
          event.currentTarget.click();
        } else {
          event.preventDefault();
          activeDescendant?.click();
        }

        break;
      }

      default: {
        if (event.key === SystemKeys.SPACE && isSelectOnly) {
          event.preventDefault();

          if (!listOpenState) event.currentTarget.click();
          else activeDescendant?.click();

          return;
        }

        if (isSelectOnly) {
          if (isPrintableKey(event.key)) jumpToChar(event);

          return;
        }

        if (!isPrintableKey(event.key)) return;

        if (!listOpenState) onListOpenChange(true);

        onPrintableKeyDown?.(event);

        break;
      }
    }
  });

  const handleKeyUp = useEventCallback<React.KeyboardEvent<T>>(event => {
    if (disabled || !isMounted()) return;

    onKeyUp?.(event);
  });

  const handleQueryChange = useEventCallback<
    React.ChangeEvent<HTMLInputElement>
  >(event => {
    if (disabled || !isMounted()) return;

    const target = event.target;

    if (!(target instanceof HTMLInputElement)) return;

    const query = target.value;

    const items = getListItems();

    const entities = items
      .filter(item => {
        const text = item.textContent?.toLowerCase() ?? "";

        return text.includes(query.toLowerCase());
      })
      .map(item => item.getAttribute("data-entityname") ?? "");

    onFilteredEntities(entities);
    onInputChange?.(event);
  });

  return {
    isFocusedVisible,
    handleQueryChange,
    handleBlur,
    handleClick,
    handleFocus,
    handleKeyDown,
    handleKeyUp,
    handleRef,
  };
};

export default useComboboxBase;
