import * as React from "react";
import { getLabelInfo } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import { componentWithForwardedRef, remap } from "../utils";
import { Root as RootSlot } from "./slots";

export type RenderProps = {
  /**
   * The value of the meter.
   */
  value: number;
  /**
   * The percentage value of the meter.
   */
  percentageValue: number;
  /**
   * The text used to represent the value.
   */
  valueText: string;
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
   * The current value of the meter.
   */
  value: number;
  /**
   * The minimum allowed value of the meter.
   * Should not be greater than or equal to `max`.
   */
  min: number;
  /**
   * The maximum allowed value of the meter.
   * Should not be less than or equal to `min`.
   */
  max: number;
  /**
   * A string value that provides a user-friendly name
   * for the current value of the meter.
   * This is important for screen reader users.
   */
  valueText: string;
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
         * Identifies the element (or elements) that labels the meter.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const MeterBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    className: classNameProp,
    children: childrenProp,
    value,
    min,
    max,
    valueText,
    label,
    ...otherProps
  } = props;

  const labelInfo = getLabelInfo(label, "Meter", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const percentageValue = remap(value, min, max, 0, 100);

  const renderProps: RenderProps = { percentageValue, value, valueText };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  return (
    <div
      {...otherProps}
      role="meter"
      ref={ref}
      className={className}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      data-slot={RootSlot}
    >
      {children}
    </div>
  );
};

const Meter = componentWithForwardedRef(MeterBase, "Meter");

export default Meter;
