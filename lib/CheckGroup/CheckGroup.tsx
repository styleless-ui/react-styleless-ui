import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId
} from "../utils";
import CheckGroupContext from "./context";
import * as Slots from "./slots";

interface RootOwnProps {
  /**
   * The content of the group.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label" | "group">;
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
   * The values of the selected checkboxes.
   */
  value?: string[];
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: string[];
  /**
   * The Callback is fired when the state changes.
   */
  onChange?: (selectedValues: string[]) => void;
}

export type RootProps = Omit<
  MergeElementProps<"div", RootOwnProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: RootProps["label"]) => {
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
          "[StylelessUI][CheckGroup]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const CheckGroupBase = (props: RootProps, ref: React.Ref<HTMLDivElement>) => {
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

  const id = useDeterministicId(idProp, "styleless-ui__check-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const [value, setValue] = useControlledProp(valueProp, defaultValue, []);

  const handleChange = (newCheckedState: boolean, inputValue: string) => {
    const newValue = !newCheckedState
      ? value.filter(v => v !== inputValue)
      : value.concat(inputValue);

    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={ref}
      className={classes?.root}
      data-slot={Slots.Root}
    >
      <CheckGroupContext.Provider value={{ value, onChange: handleChange }}>
        {visibleLabel && (
          <span
            id={visibleLabelId}
            data-slot={Slots.Label}
            className={classes?.label}
          >
            {visibleLabel}
          </span>
        )}
        <div
          role="group"
          data-slot={Slots.Group}
          className={classes?.group}
          aria-label={labelProps.srOnlyLabel}
          aria-labelledby={
            visibleLabel ? visibleLabelId : labelProps.labelledBy
          }
        >
          {children}
        </div>
      </CheckGroupContext.Provider>
    </div>
  );
};

const CheckGroup = componentWithForwardedRef(CheckGroupBase);

export default CheckGroup;
