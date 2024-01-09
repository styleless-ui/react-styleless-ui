import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
} from "../utils";
import { CheckGroupContext } from "./context";
import * as Slots from "./slots";
import { getLabelInfo } from "./utils";

interface OwnProps {
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
  onChange?: (selectedValues: string[]) => void;
}

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked"
>;

const CheckGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    children,
    id: idProp,
    classes,
    defaultValue,
    value: valueProp,
    onChange,
    orientation = "vertical",
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__check-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label);

  const [value, setValue] = useControlledProp(valueProp, defaultValue, []);

  const handleChange = (newCheckedState: boolean, inputValue: string) => {
    const newValue = !newCheckedState
      ? value.filter(v => v !== inputValue)
      : value.concat(inputValue);

    setValue(newValue);
    onChange?.(newValue);
  };

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={Slots.Label}
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
      data-slot={Slots.Root}
    >
      <CheckGroupContext.Provider value={{ value, onChange: handleChange }}>
        {renderLabel()}
        <div
          role="group"
          data-slot={Slots.Group}
          className={classes?.group}
          aria-label={labelProps.srOnlyLabel}
          aria-orientation={orientation}
          aria-labelledby={
            labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
          }
        >
          {children}
        </div>
      </CheckGroupContext.Provider>
    </div>
  );
};

const CheckGroup = componentWithForwardedRef(CheckGroupBase, "CheckGroup");

export default CheckGroup;
