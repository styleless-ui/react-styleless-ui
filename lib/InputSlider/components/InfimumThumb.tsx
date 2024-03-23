import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { InputSliderContext } from "../context";
import { InfimumThumbRoot as InfimumThumbRootSlot } from "../slots";
import Thumb, {
  type ClassNameProps as ThumbClassNameProps,
  type RenderProps as ThumbRenderProps,
  type SharedProps as ThumbSharedProps,
} from "./Thumb";

export type RenderProps = ThumbRenderProps;
export type ClassNameProps = ThumbClassNameProps;

type OwnProps = ThumbSharedProps & {
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
  MergeElementProps<"div", OwnProps>,
  | "defaultValue"
  | "defaultChecked"
  | "value"
  | "checked"
  | "onChange"
  | "onChangeCapture"
>;

const InfimumThumbBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { label, onTouchStart, onMouseDown, onKeyDown, ...otherProps } = props;

  const ctx = React.useContext(InputSliderContext);

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <InputSlider.Root>.",
      {
        scope: "InputSlider.InfimumThumb",
        type: "error",
      },
    );

    return null;
  }

  const {
    getPositions,
    getThumbsInfo,
    handleThumbDragStart,
    handleThumbKeyDown,
    setThumbValueText,
    disabled,
    readOnly,
    multiThumb,
    orientation,
  } = ctx;

  if (!multiThumb) return null;

  const labelInfo = getLabelInfo(label, "InputSlider.InfimumThumb", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const position = getPositions().infimum;
  const thumbInfo = getThumbsInfo().infimum;

  const handleDragStart: typeof handleThumbDragStart = event => {
    if (disabled) return;

    handleThumbDragStart(event);

    if (event.nativeEvent instanceof MouseEvent) {
      onMouseDown?.(event as React.MouseEvent<HTMLDivElement>);
    } else onTouchStart?.(event as React.TouchEvent<HTMLDivElement>);
  };

  const handleKeyDown: typeof handleThumbKeyDown = event => {
    if (disabled) return;

    handleThumbKeyDown(event);
    onKeyDown?.(event);
  };

  return (
    <Thumb
      {...otherProps}
      ref={ref}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      disabled={disabled}
      readOnly={readOnly}
      orientation={orientation}
      position={position}
      thumbInfo={thumbInfo}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onKeyDown={handleKeyDown}
      valueText={setThumbValueText(thumbInfo.value)}
      data-slot={InfimumThumbRootSlot}
    />
  );
};

const InfimumThumb = componentWithForwardedRef(
  InfimumThumbBase,
  "InputSlider.InfimumThumb",
);

export default InfimumThumb;
