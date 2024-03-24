import * as React from "react";
import Button from "../../Button";
import { getLabelInfo, logger } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { SpinButtonContext } from "../context";
import { DecrementButtonRoot as DecrementButtonRootSlot } from "../slots";

export type RenderProps = {
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * The label of the component.
   */
  label:
    | {
        /**
         * The label to use as `aria-label` property.
         */
        screenReaderLabel: string;
      }
    | {
        /**
         * Identifies the element (or elements) that labels the component.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const DecrementButtonBase = (
  props: Props,
  ref: React.Ref<HTMLButtonElement>,
) => {
  const { className, children, label, onClick, ...otherProps } = props;

  const ctx = React.useContext(SpinButtonContext);

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <SpinButton.Root>.",
      {
        scope: "SpinButton.DecrementButton",
        type: "error",
      },
    );

    return null;
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = event => {
    if (ctx.disabled) {
      event.preventDefault();

      return;
    }

    ctx.handleDecrease(1);

    onClick?.(event);
  };

  const labelInfo = getLabelInfo(label, "SpinButton.DecrementButton", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  return (
    <Button
      {...otherProps}
      ref={ref}
      as="button"
      type="button"
      overrideTabIndex={-1}
      className={className}
      onClick={handleClick}
      disabled={ctx.disabled || ctx.isLowerBoundDisabled}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      data-slot={DecrementButtonRootSlot}
    >
      {children}
    </Button>
  );
};

const DecrementButton = componentWithForwardedRef(
  DecrementButtonBase,
  "SpinButton.DecrementButton",
);

export default DecrementButton;
