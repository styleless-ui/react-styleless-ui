import * as React from "react";
import { getLabelInfo } from "../internals";
import type { MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
} from "../utils";
import { CheckGroupContext } from "./context";
import * as Slots from "./slots";

type OwnProps = {
  /**
   * The content of the group.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
  /**
   * The label of the group.
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
         * Identifies the element (or elements) that labels the group.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
  /**
   * The orientation of the group.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
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
  onValueChange?: (selectedValues: string[]) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "onChange"
>;

const CheckGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    children,
    id: idProp,
    className,
    defaultValue,
    value: valueProp,
    onValueChange,
    orientation = "vertical",
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__check-group");

  const labelInfo = getLabelInfo(label, "CheckGroup", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const [value, setValue] = useControlledProp(valueProp, defaultValue, []);

  const handleValueChange = (newCheckedState: boolean, inputValue: string) => {
    const newValue = !newCheckedState
      ? value.filter(v => v !== inputValue)
      : value.concat(inputValue);

    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      {...otherProps}
      role="group"
      id={id}
      ref={ref}
      className={className}
      data-slot={Slots.Root}
      aria-orientation={orientation}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
    >
      <CheckGroupContext.Provider
        value={{ value, onChange: handleValueChange }}
      >
        {children}
      </CheckGroupContext.Provider>
    </div>
  );
};

const CheckGroup = componentWithForwardedRef(CheckGroupBase, "CheckGroup");

export default CheckGroup;
