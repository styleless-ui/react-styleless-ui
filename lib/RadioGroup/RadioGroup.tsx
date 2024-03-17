import * as React from "react";
import { getLabelInfo } from "../internals";
import type { MergeElementProps } from "../types";
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
  onValueChange?: (selectedValue: string) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "onChange" | "defaultChecked"
>;

const RadioGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
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

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const id = useDeterministicId(idProp, "styleless-ui__radio-group");

  const labelInfo = getLabelInfo(label, "RadioGroup", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const [value, setValue] = useControlledProp(valueProp, defaultValue, "");
  const [forcedTabability, setForcedTabability] = React.useState<string | null>(
    null,
  );

  const handleValueChange = (newCheckedState: boolean, inputValue: string) => {
    if (!newCheckedState) return;

    setValue(inputValue);
    onValueChange?.(inputValue);
  };

  React.useEffect(() => {
    if (!rootRef.current) return;

    if (value) {
      setForcedTabability(prev => (prev ? null : prev));

      return;
    }

    const radios = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>('[role="radio"]'),
    );

    const validRadios = radios.filter(radio => {
      const isDisabled =
        radio.hasAttribute("disabled") ||
        radio.getAttribute("aria-disabled") === "true";

      return !isDisabled;
    });

    setForcedTabability(validRadios?.[0]?.getAttribute("data-entity") ?? null);
  }, [value]);

  return (
    <div
      {...otherProps}
      id={id}
      ref={handleRootRef}
      className={className}
      data-slot={Slots.Root}
      role="radiogroup"
      aria-orientation={orientation}
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
    >
      <RadioGroupContext.Provider
        value={{ value, onChange: handleValueChange, forcedTabability }}
      >
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
};

const RadioGroup = componentWithForwardedRef(RadioGroupBase, "RadioGroup");

export default RadioGroup;
