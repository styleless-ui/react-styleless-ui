import * as React from "react";
import { getLabelInfo } from "../internals";
import type { MergeElementProps, PropWithRenderContext } from "../types";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
} from "../utils";
import { CheckGroupContext } from "./context";
import * as Slots from "./slots";

export type RenderProps = {
  /**
   * The `readOnly` state of the group.
   */
  readOnly: boolean;
  /**
   * The `disabled` state of the group.
   */
  disabled: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the group.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
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
   *
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
   * If `true`, the group will be disabled.
   *
   * This will force the descendant checkboxes to be disabled as well.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the group will be read-only.
   *
   * This will force the descendant checkboxes to be read-only as well.
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * The Callback is fired when the state changes.
   */
  onValueChange?: (selectedValues: string[]) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "onChange" | "onChangeCapture"
>;

const CheckGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    defaultValue,
    value: valueProp,
    children: childrenProp,
    className: classNameProp,
    id: idProp,
    disabled,
    readOnly,
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
    if (disabled || readOnly) return;

    const newValue = !newCheckedState
      ? value.filter(v => v !== inputValue)
      : value.concat(inputValue);

    setValue(newValue);
    onValueChange?.(newValue);
  };

  const renderProps: RenderProps = {
    disabled: disabled ?? false,
    readOnly: readOnly ?? false,
  };

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
      // @ts-expect-error React hasn't added `inert` yet
      inert={disabled ? "" : undefined}
      role="group"
      id={id}
      ref={ref}
      className={className}
      data-slot={Slots.Root}
      aria-orientation={orientation}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      aria-disabled={disabled}
    >
      <CheckGroupContext.Provider
        value={{ value, readOnly, disabled, onChange: handleValueChange }}
      >
        {children}
      </CheckGroupContext.Provider>
    </div>
  );
};

const CheckGroup = componentWithForwardedRef(CheckGroupBase, "CheckGroup");

export default CheckGroup;
