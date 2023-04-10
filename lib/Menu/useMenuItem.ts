import * as React from "react";
import { useEventCallback, useIsMounted } from "../utils";

interface ItemHookProps {
  disabled: boolean;
  isActive: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  changeEmitter: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => void;
}

const useMenuItem = (props: ItemHookProps) => {
  const { changeEmitter, onClick, onMouseEnter, onMouseLeave, disabled } =
    props;

  const isMounted = useIsMounted();

  const emitChange: ItemHookProps["changeEmitter"] = event => {
    if (!isMounted() || disabled) return;

    changeEmitter?.(event);
  };

  const handleClick = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      emitChange(event);
      onClick?.(event);
    },
  );

  const handleMouseEnter = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      onMouseEnter?.(event);
    },
  );

  const handleMouseLeave = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (!isMounted() || disabled) return;

      onMouseLeave?.(event);
    },
  );

  return {
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useMenuItem;
