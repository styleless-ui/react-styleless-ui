import useControlledProp from "@utilityjs/use-controlled-prop";
import useDeterministicId from "@utilityjs/use-deterministic-id";
import * as React from "react";
import { type MergeElementProps } from "../typings.d";
import { componentWithForwardedRef } from "../utils";
import CheckGroupContext from "./context";

type CheckboxGroupClassesMap = Record<"root" | "label", string>;

type ClassesContext = {
  /** The `disabled` state of the checkbox. */
  disabled: boolean;
};

interface CheckGroupBaseProps {
  /**
   * The content of the group.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes:
    | ((ctx: ClassesContext) => CheckboxGroupClassesMap)
    | CheckboxGroupClassesMap;
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
   * @default false
   */
  value?: string[];
  /**
   * The default value. Use when the component is not controlled.
   * @default false
   */
  defaultValue?: string[];
  /**
   * If `true`, the group will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback fires when the state has changed.
   */
  onChange?: (selectedValues: string[]) => void;
}

export type CheckGroupProps = Omit<
  MergeElementProps<"div", CheckGroupBaseProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: CheckGroupProps["label"]) => {
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

const CheckGroupBase = (
  props: CheckGroupProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    label,
    children,
    id: idProp,
    classes: classesMap,
    defaultValue,
    value: valueProp,
    disabled = false,
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

  const classesCtx: ClassesContext = { disabled };

  const classes =
    typeof classesMap === "function" ? classesMap(classesCtx) : classesMap;

  const [value, setValue] = useControlledProp(valueProp, defaultValue, []);

  const handleChange = (newCheckedState: boolean, inputValue: string) => {
    const newValue = !newCheckedState
      ? value.filter(v => v !== inputValue)
      : value.concat(inputValue);

    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <CheckGroupContext.Provider value={{ value, onChange: handleChange }}>
      {visibleLabel && (
        <label
          id={visibleLabelId}
          htmlFor={id}
          data-slot="label"
          className={classes.label}
        >
          {visibleLabel}
        </label>
      )}
      <div
        {...otherProps}
        id={id}
        ref={ref}
        role="group"
        className={classes.root}
        aria-label={labelProps.srOnlyLabel}
        aria-labelledby={labelProps.labelledBy}
      >
        {children}
      </div>
    </CheckGroupContext.Provider>
  );
};

const CheckGroup = componentWithForwardedRef<
  HTMLDivElement,
  CheckGroupProps,
  typeof CheckGroupBase
>(CheckGroupBase);

export default CheckGroup;
