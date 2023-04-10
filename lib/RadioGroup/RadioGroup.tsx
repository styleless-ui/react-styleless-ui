import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import RadioGroupContext from "./context";
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
  onChange?: (selectedValue: string) => void;
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
          "[StylelessUI][RadioGroup]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n"),
      );
    }
  }

  return props;
};

const RadioGroupBase = (props: RootProps, ref: React.Ref<HTMLDivElement>) => {
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

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

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
    inputValue: (typeof radios)[number][0],
    radioRef: (typeof radios)[number][1],
  ) => {
    if (!radios.some(r => r[0] === inputValue))
      radios.push([inputValue, radioRef]);
  };

  React.useEffect(() => {
    if (!rootRef.current) return;

    radios.forEach(([v, rRef]) => {
      if (!rRef.current) return;

      const isSelected = Array.isArray(value) ? value.includes(v) : value === v;
      const isDisabled = rRef.current.hasAttribute("disabled");

      rRef.current.tabIndex = isDisabled ? -1 : isSelected ? 0 : -1;
    });

    const notTabable = radios.filter(
      ([_, rRef]) => rRef.current?.getAttribute("tabindex") !== "0",
    );

    if (notTabable.length !== radios.length) return;

    const radio =
      radios.find(([_, rRef]) => !rRef.current?.hasAttribute("disabled")) ??
      null;

    if (!radio) return;
    const [_, rRef] = radio;

    rRef.current?.setAttribute("tabindex", "0");
  });

  return (
    <div
      {...otherProps}
      id={id}
      ref={handleRootRef}
      className={classes?.root}
      data-slot={Slots.Root}
    >
      <RadioGroupContext.Provider
        value={{ value, onChange: handleChange, registerRadio, radios }}
      >
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
          role="radiogroup"
          data-slot={Slots.Group}
          className={classes?.group}
          aria-label={labelProps.srOnlyLabel}
          aria-labelledby={
            visibleLabel ? visibleLabelId : labelProps.labelledBy
          }
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    </div>
  );
};

const RadioGroup = componentWithForwardedRef(RadioGroupBase);

export default RadioGroup;
