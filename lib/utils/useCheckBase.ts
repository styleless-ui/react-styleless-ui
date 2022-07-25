import useControlledProp from "@utilityjs/use-controlled-prop";
import useForkedRefs from "@utilityjs/use-forked-refs";
import useIsMounted from "@utilityjs/use-is-mounted";
import useIsomorphicLayoutEffect from "@utilityjs/use-isomorphic-layout-effect";
import * as React from "react";
import { type ICheckGroupContext } from "../CheckGroup/context";
import { type IRadioGroupContext } from "../RadioGroup/context";
import {
  requestFormSubmit,
  useEventCallback,
  useIsFocusVisible
} from "../utils";

interface CheckBaseProps {
  strategy?: "check-control" | "radio-control";
  value?: string;
  groupCtx?: ICheckGroupContext | IRadioGroupContext;
  checked?: boolean;
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
    strategy = "check-control",
    autoFocus = false,
    disabled = false
  } = props;

  const isMounted = useIsMounted();

  const [checked, setChecked] = useControlledProp(
    checkedProp,
    defaultChecked,
    false
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
    ref: focusVisibleRef
  } = useIsFocusVisible<HTMLButtonElement>();

  const controllerRef = React.useRef<HTMLButtonElement>();
  const handleControllerRef = useForkedRefs(controllerRef, focusVisibleRef);

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
    if (isFocusedVisible) controllerRef.current?.focus();
  }, []);

  const emitChange = (newChecked: boolean) => {
    if (disabled || !isMounted()) return;
    if (strategy === "radio-control" && checkedState) return;

    setChecked(newChecked);
    groupCtx?.onChange(newChecked, value);
    onChange?.(newChecked);
  };

  const handleClick = useEventCallback<React.MouseEvent<HTMLButtonElement>>(
    event => {
      event.preventDefault();
      if (disabled || !isMounted()) return;

      emitChange(!checkedState);
    }
  );

  const handleFocus = useEventCallback<React.FocusEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      // Fix for https://github.com/facebook/react/issues/7769
      if (!controllerRef.current) controllerRef.current = event.currentTarget;

      handleFocusVisible(event);

      if (isFocusVisibleRef.current) setIsFocusedVisible(true);

      onFocus?.(event);
    }
  );

  const handleBlur = useEventCallback<React.FocusEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      handleBlurVisible(event);

      if (isFocusVisibleRef.current === false) setIsFocusedVisible(false);

      onBlur?.(event);
    }
  );

  const handleKeyDown = useEventCallback<
    React.KeyboardEvent<HTMLButtonElement>
  >(event => {
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

      if (strategy === "radio-control" && groupCtx && isFocusedVisible) {
        const { radios } = <IRadioGroupContext>groupCtx;
        const currentRadiosIdx = radios.findIndex(r => r[0] === value);

        const currentRadio = radios[currentRadiosIdx][1].current;

        const dir = currentRadio
          ? window.getComputedStyle(currentRadio).direction
          : "ltr";

        if (
          ["arrowup", dir === "ltr" ? "arrowleft" : "arrowright"].includes(
            event.key.toLowerCase()
          )
        ) {
          event.preventDefault();

          const nextRadio =
            radios[(currentRadiosIdx - 1 + radios.length) % radios.length];

          nextRadio[1].current?.click();
          nextRadio[1].current?.focus();
        } else if (
          ["arrowdown", dir === "ltr" ? "arrowright" : "arrowleft"].includes(
            event.key.toLowerCase()
          )
        ) {
          event.preventDefault();

          const nextRadio = radios[(currentRadiosIdx + 1) % radios.length];

          nextRadio[1].current?.click();
          nextRadio[1].current?.focus();
        }
      }
    }

    onKeyDown?.(event);
  });

  const handleKeyUp = useEventCallback<React.KeyboardEvent<HTMLButtonElement>>(
    event => {
      if (disabled || !isMounted()) return;

      if (isFocusedVisible) {
        if (event.key === " ") spaceKeyDownRef.current = false;
        if (event.key.toLowerCase() === "enter")
          enterKeyDownRef.current = false;
      }

      onKeyUp?.(event);

      if (event.target === event.currentTarget) {
        if (event.key === " ") emitChange(!checkedState);
        else if (event.key.toLowerCase() === "enter")
          requestFormSubmit(event.target);
      }
    }
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
    handleControllerRef
  };
};

export default useCheckBase;
