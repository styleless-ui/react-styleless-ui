import * as React from "react";
import { type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId
} from "../utils";
import RadioGroupContext from "./context";

type RadioGroupClassesMap = Record<"root" | "label", string>;

interface RadioGroupBaseProps {
  /**
   * The content of the group.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: RadioGroupClassesMap;
  /**
   * The label of the group.
   */
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
   * The Callback fires when the state has changed.
   */
  onChange?: (selectedValue: string) => void;
}

export type RadioGroupProps = Omit<
  MergeElementProps<"div", RadioGroupBaseProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: RadioGroupProps["label"]) => {
  const props: {
    visibleLabel?: string;
    srOnlyLabel?: string;
    labelledBy?: string;
  } = {};

  if (typeof labelInput === "string") {
    props.visibleLabel = labelInput;
  } else {
    if ("screenReaderLabel" in labelInput) {
      props.srOnlyLabel = labelInput.screenReaderLabel;
    } else if ("labelledBy" in labelInput) {
      props.labelledBy = labelInput.labelledBy;
    } else {
      throw new Error(
        [
          "[StylelessUI][RadioGroup]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const RadioGroupBase = (
  props: RadioGroupProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    label,
    children,
    id: idProp,
    classes,
    defaultValue,
    value: valueProp,
    onChange,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__radio-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const [value, setValue] = useControlledProp(valueProp, defaultValue, "");

  const handleChange = (newCheckedState: boolean, inputValue: string) => {
    if (!newCheckedState) return;

    setValue(inputValue);
    onChange?.(inputValue);
  };

  const radios: [string, React.RefObject<HTMLButtonElement>][] = [];

  const registerRadio = (
    inputValue: typeof radios[number][0],
    radioRef: typeof radios[number][1]
  ) => {
    if (!radios.some(r => r[0] === inputValue))
      radios.push([inputValue, radioRef]);

    return value.length === 0
      ? radios[0][0]
      : radios.find(r => r[0] === value)?.[0];
  };

  return (
    <RadioGroupContext.Provider
      value={{ value, onChange: handleChange, registerRadio, radios }}
    >
      {visibleLabel && (
        <label
          id={visibleLabelId}
          htmlFor={id}
          data-slot="label"
          className={classes?.label}
        >
          {visibleLabel}
        </label>
      )}
      <div
        {...otherProps}
        id={id}
        ref={ref}
        role="radiogroup"
        className={classes?.root}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={labelProps.labelledBy}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const RadioGroup = componentWithForwardedRef<
  HTMLDivElement,
  RadioGroupProps,
  typeof RadioGroupBase
>(RadioGroupBase);

export default RadioGroup;
