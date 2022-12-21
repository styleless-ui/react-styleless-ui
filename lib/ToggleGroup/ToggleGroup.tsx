import * as React from "react";
import { type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
  useForkedRefs
} from "../utils";
import ToggleGroupContext from "./context";
import * as Slots from "./slots";

type ToggleGroupClassesMap = Record<"root" | "label" | "group", string>;

interface RootBaseProps {
  /**
   * The content of the group.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: ToggleGroupClassesMap;
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
   * The value of the active toggle.
   */
  value?: string | string[];
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: string | string[];
  /**
   * The Callback is fired when the state changes.
   */
  onChange?: (activeItems: string | string[]) => void;
  /**
   * Determines whether a single or multiple items can be active at a time.
   */
  multiple?: boolean;
  /**
   * If `automatic`, toggles are automatically activated when they receive focus.
   * If `manual`, users activate a toggle by focusing them and pressing `Space` or `Enter`.
   */
  keyboardActivationBehavior?: "manual" | "automatic";
}

export type RootProps = Omit<
  MergeElementProps<"div", RootBaseProps>,
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
          "[StylelessUI][ToggleGroup]: Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`"
        ].join("\n")
      );
    }
  }

  return props;
};

const ToggleGroupBase = (props: RootProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    children,
    id: idProp,
    classes,
    defaultValue,
    value: valueProp,
    multiple = false,
    keyboardActivationBehavior,
    onChange,
    ...otherProps
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const id = useDeterministicId(idProp, "styleless-ui__toggle-group");
  const visibleLabelId = `${id}__label`;

  const labelProps = getLabelInfo(label);

  const visibleLabel =
    typeof labelProps.visibleLabel !== "undefined"
      ? labelProps.visibleLabel
      : undefined;

  const [value, setValue] = useControlledProp(
    valueProp,
    defaultValue,
    multiple ? [] : ""
  );

  if (multiple && !Array.isArray(value)) {
    throw new Error(
      "[StylelessUI][ToggleGroup]: The `value` and `defaultValue` " +
        "should be an empty array or array of strings when `multiple={true}.`"
    );
  }

  if (!multiple && typeof value !== "string") {
    throw new Error(
      "[StylelessUI][ToggleGroup]: The `value` and `defaultValue` " +
        "should be string when `multiple={false}.`"
    );
  }

  const handleChange = (newActiveState: boolean, toggleValue: string) => {
    const newValue = multiple
      ? !newActiveState
        ? (value as string[]).filter(v => v !== toggleValue)
        : (value as string[]).concat(toggleValue)
      : newActiveState
      ? toggleValue
      : "";

    setValue(newValue);
    onChange?.(newValue);
  };

  const toggles: [string, React.RefObject<HTMLButtonElement>][] = [];

  const registerToggle = (
    toggleValue: typeof toggles[number][0],
    toggleRef: typeof toggles[number][1]
  ) => {
    if (!toggles.some(r => r[0] === toggleValue))
      toggles.push([toggleValue, toggleRef]);
  };

  React.useEffect(() => {
    if (!rootRef.current) return;

    toggles.forEach(([v, tRef]) => {
      if (!tRef.current) return;

      const isSelected = Array.isArray(value) ? value.includes(v) : value === v;
      const isDisabled = tRef.current.hasAttribute("disabled");

      tRef.current.tabIndex = isDisabled ? -1 : isSelected ? 0 : -1;
    });

    const notTabable = toggles.filter(
      ([_, tRef]) => tRef.current?.getAttribute("tabindex") !== "0"
    );

    if (notTabable.length !== toggles.length) return;

    const toggle =
      toggles.find(([_, tRef]) => !tRef.current?.hasAttribute("disabled")) ??
      null;

    if (!toggle) return;
    const [_, tRef] = toggle;

    tRef.current?.setAttribute("tabindex", "0");
  });

  return (
    <div
      {...otherProps}
      id={id}
      ref={handleRootRef}
      className={classes?.root}
      data-slot={Slots.Root}
    >
      <ToggleGroupContext.Provider
        value={{
          multiple,
          value,
          toggles,
          keyboardActivationBehavior: keyboardActivationBehavior ?? "manual",
          onChange: handleChange,
          registerToggle
        }}
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
      </ToggleGroupContext.Provider>
    </div>
  );
};

const ToggleGroup = componentWithForwardedRef(ToggleGroupBase);

export default ToggleGroup;
