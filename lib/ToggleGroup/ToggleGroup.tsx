import * as React from "react";
import { Root as ToggleRootSlot } from "../Toggle/slots";
import { SystemError, getLabelInfo } from "../internals";
import type { Classes, MergeElementProps } from "../types";
import {
  componentWithForwardedRef,
  useControlledProp,
  useDeterministicId,
  useForkedRefs,
} from "../utils";
import { ToggleGroupContext } from "./context";
import * as Slots from "./slots";

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

  const labelProps = getLabelInfo(label, "ToggleGroup");

  const [value, setValue] = useControlledProp(
    valueProp,
    defaultValue,
    multiple ? [] : "",
  );

  const [forcedTabability, setForcedTabability] = React.useState<string | null>(
    null,
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

  React.useEffect(() => {
    if (!rootRef.current) return;

    if (value.length > 0) {
      setForcedTabability(prev => (prev ? null : prev));

      return;
    }

    const toggles = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(
        `[data-slot='${ToggleRootSlot}']`,
      ),
    );

    const validToggles = toggles.filter(toggle => {
      const isDisabled =
        toggle.hasAttribute("disabled") ||
        toggle.getAttribute("aria-disabled") === "true";

      return !isDisabled;
    });

    setForcedTabability(
      validToggles?.[0]?.getAttribute("data-entityname") ?? null,
    );
  }, [value]);

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
          forcedTabability,
          keyboardActivationBehavior: keyboardActivationBehavior ?? "manual",
          onChange: handleChange,
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
