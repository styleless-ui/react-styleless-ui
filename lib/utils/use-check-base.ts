import * as React from "react";
import {
  requestFormSubmit,
  useControlledProp,
  useEventCallback,
  useForkedRefs,
  useIsFocusVisible,
  useIsMounted,
  useIsomorphicLayoutEffect,
} from ".";
import { SystemKeys } from "../internals";

interface GenericGroupContext {
  value: string | string[];
  onChange: (newState: boolean, itemValue: string) => void;
  items?: [string, React.RefObject<HTMLButtonElement>][];
}

interface CheckBaseProps {
  strategy?: "check-control" | "radio-control";
  enterKeyFunctionality?: "request-form-submit" | "check";
  keyboardActivationBehavior?: "manual" | "automatic";
  value?: string;
  groupCtx?: GenericGroupContext;
  checked?: boolean;
  toggle?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (checkedState: boolean) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
}

const useCheckBase = (props: CheckBaseProps) => {
  const {
    checked: checkedProp,
    value = "",
    groupCtx,
    defaultChecked,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onKeyUp,
    keyboardActivationBehavior = "automatic",
    enterKeyFunctionality = "request-form-submit",
    strategy = "check-control",
    autoFocus = false,
    toggle = false,
    disabled = false,
  } = props;

  const isMounted = useIsMounted();

  const [checked, setChecked] = useControlledProp(
    checkedProp,
    defaultChecked,
    false,
  );

  const checkedState = groupCtx
    ? strategy === "check-control"
      ? groupCtx.value.includes(value)
      : groupCtx.value === value
    : checked;

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible<HTMLButtonElement>();

  const controllerRef = React.useRef<HTMLButtonElement>();
  const handleControllerRef = useForkedRefs(controllerRef, focusVisibleRef);

  const spaceKeyDownRef = React.useRef(false);
  const enterKeyDownRef = React.useRef(false);

  const [isFocusedVisible, setIsFocusedVisible] = React.useState(() =>
    disabled ? false : autoFocus,
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(
    () => void (disabled && isFocusedVisible && setIsFocusedVisible(false)),
  );
  React.useEffect(() => void (isFocusVisibleRef.current = isFocusedVisible));

  // Initial focus
  useIsomorphicLayoutEffect(() => {
    if (isFocusedVisible) controllerRef.current?.focus();
  }, []);

  const emitChange = (newChecked: boolean) => {
    if (disabled || !isMounted()) return;
    if (strategy === "radio-control" && checkedState && !toggle) return;

    setChecked(newChecked);
    groupCtx?.onChange(newChecked, value);
    onChange?.(newChecked);
  };

  const handleClick = useEventCallback<React.MouseEvent<HTMLButtonElement>>(
    event => {
      event.preventDefault();
      if (disabled || !isMounted()) return;

      emitChange(!checkedState);
    },
  );

  const handleFocus = useEventCallback<React.FocusEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      // Fix for https://github.com/facebook/react/issues/7769
      if (!controllerRef.current) controllerRef.current = event.currentTarget;

      handleFocusVisible(event);

      if (isFocusVisibleRef.current) setIsFocusedVisible(true);

      onFocus?.(event);
    },
  );

  const handleBlur = useEventCallback<React.FocusEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      handleBlurVisible(event);

      if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

      onBlur?.(event);
    },
  );

  const handleKeyDown = useEventCallback<
    React.KeyboardEvent<HTMLButtonElement>
  >(event => {
    if (disabled || !isMounted()) return;

    if (isFocusedVisible) {
      if (spaceKeyDownRef.current === false && event.key === SystemKeys.SPACE)
        spaceKeyDownRef.current = true;
      if (enterKeyDownRef.current === false && event.key === SystemKeys.ENTER)
        enterKeyDownRef.current = true;
    }

    if (event.target === event.currentTarget) {
      if ([SystemKeys.SPACE, SystemKeys.ENTER].includes(event.key)) {
        event.preventDefault();
      }

      if (groupCtx && isFocusedVisible) {
        const { items } = groupCtx;

        if (!items) return;

        const currentItemIdx = items.findIndex(r => r[0] === value);
        const currentItem = items[currentItemIdx]?.[1].current;

        const dir = currentItem
          ? window.getComputedStyle(currentItem).direction
          : "ltr";

        const goPrev = [
          SystemKeys.UP,
          dir === "ltr" ? SystemKeys.LEFT : SystemKeys.RIGHT,
        ].includes(event.key);

        const goNext = [
          SystemKeys.DOWN,
          dir === "ltr" ? SystemKeys.RIGHT : SystemKeys.LEFT,
        ].includes(event.key);

        let activeItem: (typeof items)[number] | null = null;

        const getAvailableItem = (
          idx: number,
          forward: boolean,
          prevIdxs: number[] = [],
        ): typeof activeItem => {
          const item = items[idx];

          if (prevIdxs.includes(idx)) return null;

          if (!item || !item[1].current || item[1].current.disabled) {
            const newIdx =
              (forward ? idx + 1 : idx - 1 + items.length) % items.length;

            return getAvailableItem(newIdx, forward, [...prevIdxs, idx]);
          }

          return item;
        };

        if (goPrev) {
          activeItem = getAvailableItem(
            (currentItemIdx - 1 + items.length) % items.length,
            false,
          );
        } else if (goNext) {
          activeItem = getAvailableItem(
            (currentItemIdx + 1) % items.length,
            true,
          );
        }

        if (activeItem) {
          event.preventDefault();

          activeItem[1].current?.focus();
          if (keyboardActivationBehavior === "automatic")
            activeItem[1].current?.click();
        }
      }
    }

    onKeyDown?.(event);
  });

  const handleKeyUp = useEventCallback<React.KeyboardEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      if (isFocusedVisible) {
        if (event.key === SystemKeys.SPACE) spaceKeyDownRef.current = false;
        if (event.key === SystemKeys.ENTER) enterKeyDownRef.current = false;
      }

      onKeyUp?.(event);

      if (event.target === event.currentTarget) {
        if (event.key === SystemKeys.SPACE) emitChange(!checkedState);
        else if (event.key === SystemKeys.ENTER) {
          enterKeyFunctionality === "request-form-submit"
            ? requestFormSubmit(event.target as HTMLElement)
            : emitChange(!checkedState);
        }
      }
    },
  );

  return {
    checked: checkedState,
    isFocusedVisible,
    controllerRef,
    emitChange,
    handleBlur,
    handleClick,
    handleFocus,
    handleKeyDown,
    handleKeyUp,
    handleControllerRef,
  };
};

export default useCheckBase;
