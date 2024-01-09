import * as React from "react";
import type { Classes, MergeElementProps } from "../typings";
import {
  SystemError,
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import { ToggleGroupContext } from "./context";
import * as Slots from "./slots";
import { getLabelInfo } from "./utils";

type OwnProps = {
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
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked"
>;

const ToggleGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
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

  const [value, setValue] = useControlledProp(
    valueProp,
    defaultValue,
    multiple ? [] : "",
  );

  if (multiple && !Array.isArray(value)) {
    throw new SystemError(
      "The `value` and `defaultValue` " +
        "should be an empty array or array of strings when `multiple={true}.`",
      "ToggleGroup",
    );
  }

  if (!multiple && typeof value !== "string") {
    throw new SystemError(
      "The `value` and `defaultValue` " +
        "should be string when `multiple={false}.`",
      "ToggleGroup",
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
    toggleValue: (typeof toggles)[number][0],
    toggleRef: (typeof toggles)[number][1],
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
      ([_, tRef]) => tRef.current?.getAttribute("tabindex") !== "0",
    );

    if (notTabable.length !== toggles.length) return;

    const toggle =
      toggles.find(([_, tRef]) => !tRef.current?.hasAttribute("disabled")) ??
      null;

    if (!toggle) return;
    const [_, tRef] = toggle;

    tRef.current?.setAttribute("tabindex", "0");
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
          registerToggle,
        }}
      >
        {renderLabel()}
        <div
          role="group"
          data-slot={Slots.Group}
          className={classes?.group}
          aria-label={labelProps.srOnlyLabel}
          aria-labelledby={
            labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
          }
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    </div>
  );
};

const ToggleGroup = componentWithForwardedRef(ToggleGroupBase, "ToggleGroup");

export default ToggleGroup;
