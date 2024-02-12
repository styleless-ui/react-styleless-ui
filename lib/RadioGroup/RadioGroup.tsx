import * as React from "react";
import { getLabelInfo } from "../internals";
import type { Classes, MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import { RadioGroupContext } from "./context";
import * as Slots from "./slots";

type OwnProps = {
  /**
   * The content of the group.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label">;
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
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked"
>;

const RadioGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
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

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const id = useDeterministicId(idProp, "styleless-ui__radio-group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label, "RadioGroup");

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
    if (!radios.some(r => r[0] === inputValue)) {
      radios.push([inputValue, radioRef]);
    }
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
    <>
      {renderLabel()}
      <div
        {...otherProps}
        id={id}
        ref={handleRootRef}
        className={classes?.root}
        data-slot={Slots.Root}
        role="radiogroup"
        aria-label={labelProps.srOnlyLabel}
        aria-orientation={orientation}
        aria-labelledby={
          labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
        }
      >
        <RadioGroupContext.Provider
          value={{ value, onChange: handleChange, registerRadio, radios }}
        >
          {children}
        </RadioGroupContext.Provider>
      </div>
    </>
  );
};

const RadioGroup = componentWithForwardedRef(RadioGroupBase, "RadioGroup");

export default RadioGroup;
