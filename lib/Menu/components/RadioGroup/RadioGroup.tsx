import * as React from "react";
import { getLabelInfo } from "../../../internals";
import type { Classes, MergeElementProps } from "../../../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
} from "../../../utils";
import {
  RadioGroupLabel as RadioGroupLabelSlot,
  RadioGroupRoot as RadioGroupRootSlot,
} from "../../slots";
import { RadioGroupContext } from "./context";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label">;
  label:
    | string
    | {
        /**
         * The label to use as `aria-label` property.
         */
        screenReaderLabel: string;
      }
    | {
        /**
         * Identifies the element (or elements) that labels the group.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * The value of the selected radio.
   */
  value?: string;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: string;
  /**
   * The Callback is fired when the state changes.
   */
  onValueChange?: (value: string) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked"
>;

const RadioGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children,
    classes,
    value: valueProp,
    defaultValue,
    onValueChange,
    label,
    id: idProp,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__menu-radio-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label, "Menu.RadioGroup");

  const [value, setValue] = useControlledProp(valueProp, defaultValue, "");

  const handleChange = (radioValue: string) => {
    setValue(radioValue);
    onValueChange?.(radioValue);
  };

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={RadioGroupLabelSlot}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={ref}
      className={classes?.root}
      role="group"
      tabIndex={-1}
      data-slot={RadioGroupRootSlot}
      aria-label={labelProps.srOnlyLabel}
      aria-labelledby={
        labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
      }
    >
      {renderLabel()}
      <RadioGroupContext.Provider
        value={{ value, onValueChange: handleChange }}
      >
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
};

const RadioGroup = componentWithForwardedRef(RadioGroupBase, "MenuRadioGroup");

export default RadioGroup;
