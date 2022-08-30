import * as React from "react";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId
} from "../../utils";
import MenuRadioGroupContext from "./context";

type ClassesMap = Record<"root" | "label", string>;

interface MenuRadioGroupBaseProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ClassesMap;
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
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export type MenuRadioGroupProps = Omit<
  MergeElementProps<"div", MenuRadioGroupBaseProps>,
  "className" | "defaultChecked"
>;

const getLabelInfo = (labelInput: MenuRadioGroupProps["label"]) => {
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
          "[StylelessUI][MenuRadioGroup]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const MenuRadioGroupBase = (
  props: MenuRadioGroupProps,
  ref: React.Ref<HTMLDivElement>
) => {
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

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const [value, setValue] = useControlledProp(valueProp, defaultValue, "");

  const handleChange = (radioValue: string) => {
    setValue(radioValue);
    onValueChange?.(radioValue);
  };

  return (
    <div
      {...otherProps}
      role="group"
      id={id}
      ref={ref}
      data-slot="menuRadioGroupRoot"
      className={classes?.root}
      tabIndex={-1}
      aria-label={labelProps.srOnlyLabel}
      aria-labelledby={visibleLabel ? visibleLabelId : labelProps.labelledBy}
    >
      {visibleLabel && (
        <span
          id={visibleLabelId}
          data-slot="menuRadioGroupLabel"
          className={classes?.label}
        >
          {visibleLabel}
        </span>
      )}
      <MenuRadioGroupContext.Provider
        value={{ value, onValueChange: handleChange }}
      >
        {children}
      </MenuRadioGroupContext.Provider>
    </div>
  );
};

const MenuRadioGroup = componentWithForwardedRef<
  HTMLDivElement,
  MenuRadioGroupProps,
  typeof MenuRadioGroupBase
>(MenuRadioGroupBase);

export default MenuRadioGroup;
