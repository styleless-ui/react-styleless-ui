import useForkedRefs from "@utilityjs/use-forked-refs";
import useIsMounted from "@utilityjs/use-is-mounted";
import useIsomorphicLayoutEffect from "@utilityjs/use-isomorphic-layout-effect";
import * as React from "react";
import useEventCallback from "./useEventCallback";
import useIsFocusVisible from "./useIsFocusVisible";

interface ButtonBaseProps<T extends HTMLElement = HTMLButtonElement> {
  disabled?: boolean;
  autoFocus?: boolean;
  onClick?: React.MouseEventHandler<T>;
  onBlur?: React.FocusEventHandler<T>;
  onFocus?: React.FocusEventHandler<T>;
  onKeyDown?: React.KeyboardEventHandler<T>;
  onKeyUp?: React.KeyboardEventHandler<T>;
}

const useButtonBase = <T extends HTMLElement = HTMLButtonElement>(
  props: ButtonBaseProps<T>
) => {
  const {
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    autoFocus = false,
    disabled = false
  } = props;

  const isMounted = useIsMounted();

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    ref: focusVisibleRef
  } = useIsFocusVisible<T>();

  const buttonRef = React.useRef<T>();
  const handleButtonRef = useForkedRefs(buttonRef, focusVisibleRef);

  const spaceKeyDownRef = React.useRef(false);
  const enterKeyDownRef = React.useRef(false);

  const [isFocusedVisible, setIsFocusedVisible] = React.useState(() =>
    disabled ? false : autoFocus
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(
    () => void (disabled && isFocusedVisible && setIsFocusedVisible(false))
  );
  React.useEffect(() => void (isFocusVisibleRef.current = isFocusedVisible));

  // Initial focus
  useIsomorphicLayoutEffect(() => {
    if (isFocusedVisible) buttonRef.current?.focus();
  }, []);

  const handleClick = useEventCallback<React.MouseEvent<T>>(event => {
    event.preventDefault();
    if (disabled || !isMounted()) return;

    onClick?.(event);
  });

  const handleFocus = useEventCallback<React.FocusEvent<T>>(event => {
    if (disabled || !isMounted()) return;

    // Fix for https://github.com/facebook/react/issues/7769
    if (!buttonRef.current) buttonRef.current = event.currentTarget;

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

    if (isFocusedVisible) {
      if (spaceKeyDownRef.current === false && event.key === " ")
        spaceKeyDownRef.current = true;
      if (
        enterKeyDownRef.current === false &&
        event.key.toLowerCase() === "enter"
      )
        enterKeyDownRef.current = true;
    }

    if (event.target === event.currentTarget) {
      if ([" ", "enter"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    }

    onKeyDown?.(event);
  });

  const handleKeyUp = useEventCallback<React.KeyboardEvent<T>>(event => {
    if (disabled || !isMounted()) return;

    if (isFocusedVisible) {
      if (event.key === " ") spaceKeyDownRef.current = false;
      if (event.key.toLowerCase() === "enter") enterKeyDownRef.current = false;
    }

    onKeyUp?.(event);

    if (
      event.target === event.currentTarget &&
      [" ", "enter"].includes(event.key.toLowerCase())
    ) {
      event.target.click();
    }
  });

  return {
    isFocusedVisible,
    handleBlur,
    handleClick,
    handleFocus,
    handleKeyDown,
    handleKeyUp,
    handleButtonRef
  };
};

export default useButtonBase;
