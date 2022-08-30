import * as React from "react";
import { SystemKeys } from "../internals";
import { useEventCallback, useIsMounted } from "../utils";

interface ItemHookProps {
  disabled: boolean;
  isActive: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  changeEmitter: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>
  ) => void;
}

const useMenuItem = (props: ItemHookProps) => {
  const {
    changeEmitter,
    onClick,
    onKeyDown,
    onKeyUp,
    onMouseEnter,
    onMouseLeave,
    disabled,
    isActive
  } = props;

  const isMounted = useIsMounted();

  const spaceKeyDownRef = React.useRef(false);
  const enterKeyDownRef = React.useRef(false);

  const emitChange: ItemHookProps["changeEmitter"] = event => {
    if (!isMounted() || disabled) return;

    changeEmitter?.(event);
  };

  const handleKeyDown = useEventCallback<React.KeyboardEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      if (isActive) {
        if (spaceKeyDownRef.current === false && event.key === SystemKeys.SPACE)
          spaceKeyDownRef.current = true;
        if (enterKeyDownRef.current === false && event.key === SystemKeys.ENTER)
          enterKeyDownRef.current = true;
      }

      if (event.target === event.currentTarget) {
        if ([SystemKeys.SPACE, SystemKeys.ENTER].includes(event.key))
          event.preventDefault();
      }

      onKeyDown?.(event);
    }
  );

  const handleKeyUp = useEventCallback<React.KeyboardEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      if (isActive) {
        if (event.key === SystemKeys.SPACE) spaceKeyDownRef.current = false;
        if (event.key === SystemKeys.ENTER) enterKeyDownRef.current = false;
      }

      if (event.target === event.currentTarget) {
        if ([SystemKeys.SPACE, SystemKeys.ENTER].includes(event.key))
          emitChange(event);
      }

      onKeyUp?.(event);
    }
  );

  const handleClick = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      emitChange(event);
      onClick?.(event);
    }
  );

  const handleMouseEnter = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      onMouseEnter?.(event);
    }
  );

  const handleMouseLeave = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      onMouseLeave?.(event);
    }
  );

  return {
    handleClick,
    handleKeyDown,
    handleKeyUp,
    handleMouseEnter,
    handleMouseLeave
  };
};

export default useMenuItem;
