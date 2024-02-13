import * as React from "react";
import type { Props as RootProps, ThumbInfo } from "../InputSlider";
import {
  InfimumThumb as InfumumThumbSlot,
  ThumbText as ThumbTextSlot,
} from "../slots";

type Props = React.ComponentPropsWithoutRef<"div"> & {
  className: string;
  isFocusedVisible: boolean;
  isActive: boolean;
  isDisabled: boolean;
  isValueTextVisible: boolean;
  thumbInfo: ThumbInfo;
  orientation: Exclude<RootProps["orientation"], undefined>;
  valueText: string;
  renderValueText: RootProps["renderThumbValueText"];
};

const Thumb = (props: Props) => {
  const {
    className,
    thumbInfo,
    orientation,
    isFocusedVisible,
    isValueTextVisible,
    isActive,
    isDisabled,
    valueText,
    renderValueText,
    ...otherProps
  } = props;

  return (
    <div
      {...otherProps}
      ref={thumbInfo.ref}
      role="slider"
      className={className}
      tabIndex={isDisabled ? -1 : 0}
      aria-label={thumbInfo.label.srOnlyLabel}
      aria-labelledby={thumbInfo.label.labelledBy}
      aria-valuetext={valueText}
      aria-valuenow={thumbInfo.value}
      aria-valuemin={thumbInfo.minValue}
      aria-valuemax={thumbInfo.maxValue}
      aria-disabled={isDisabled}
      aria-orientation={orientation}
      data-slot={InfumumThumbSlot}
      data-thumb-index={thumbInfo.index}
      data-thumb-name={thumbInfo.name}
      data-active={isActive ? "" : undefined}
      data-focus-visible={isFocusedVisible ? "" : undefined}
    >
      <div
        aria-hidden="true"
        data-slot={ThumbTextSlot}
      >
        {renderValueText?.(thumbInfo.value, isValueTextVisible, valueText)}
      </div>
    </div>
  );
};

export default Thumb;
