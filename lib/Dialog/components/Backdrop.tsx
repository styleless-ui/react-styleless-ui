import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { DialogContext } from "../context";
import { BackdropRoot as BackdropRootSlot } from "../slots";

type OwnProps = {
  /**
   * The className applied to the component.
   */
  className?: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue" | "children"
>;

const BackdropBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { className, onClick, ...otherProps } = props;

  const ctx = React.useContext(DialogContext);

  if (!ctx) {
    logger("You have to use this component as a descendant of <Dialog.Root>.", {
      scope: "Dialog.Backdrop",
      type: "error",
    });

    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);

    if (event.isDefaultPrevented()) return;

    ctx.emitClose();
  };

  return (
    <div
      {...otherProps}
      ref={ref}
      className={className}
      onClick={handleClick}
      aria-hidden="true"
      data-slot={BackdropRootSlot}
    />
  );
};

const Backdrop = componentWithForwardedRef(BackdropBase, "Dialog.Backdrop");

export default Backdrop;
