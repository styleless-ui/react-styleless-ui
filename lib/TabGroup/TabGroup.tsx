import useControlledProp from "@utilityjs/use-controlled-prop";
import useIsMounted from "@utilityjs/use-is-mounted";
import * as React from "react";
import { type MergeElementProps } from "../typings.d";
import { componentWithForwardedRef } from "../utils";
import TabGroupContext, { type ITabGroupContext } from "./context";

interface TabGroupBaseProps {
  /**
   * The content of the tab group.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
  /**
   * The currently selected tab.
   */
  activeTab?: number;
  /**
   * The default selected tab. Use when the component is not controlled.
   */
  defaultActiveTab?: number;
  /**
   * The Callback fires when the state has changed.
   */
  onChange?: (tabIndex: number) => void;
  /**
   * Indicates whether the element's orientation is horizontal or vertical.
   * This effects the keyboard interactions.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * If `automatic`, tabs are automatically activated and their panel is displayed when they receive focus.
   * If `manual`, users activate a tab and display its panel by focusing them and pressing `Space` or `Enter`.
   * @default "manual"
   */
  keyboardActivationBehavior?: "manual" | "automatic";
}

export type TabGroupProps = Omit<
  MergeElementProps<"div", TabGroupBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const TabGroupBase = (props: TabGroupProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    children: childrenProp,
    className,
    onChange,
    defaultActiveTab,
    activeTab: activeTabProp,
    keyboardActivationBehavior = "manual",
    orientation = "horizontal",
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const [activeTab, setActiveTab] = useControlledProp(
    activeTabProp,
    defaultActiveTab,
    0
  );

  const children = React.Children.map(childrenProp, child =>
    React.isValidElement(child) ? child : null
  );

  const handleChange = (tabIndex: number) => {
    if (!isMounted()) return;

    setActiveTab(tabIndex);
    onChange?.(tabIndex);
  };

  const tabs: ITabGroupContext["tabs"] = [];
  const panels: ITabGroupContext["panels"] = [];

  const register: ITabGroupContext["register"] = ref => {
    if (!ref.current) return;

    if (ref.current instanceof HTMLDivElement) {
      if (!panels.some(r => r.current === ref.current))
        panels.push(ref as typeof panels[number]);
    } else if (!tabs.some(r => r.current === ref.current)) {
      tabs.push(ref as typeof tabs[number]);
    }
  };

  return (
    <div {...otherProps} className={className} ref={ref}>
      <TabGroupContext.Provider
        value={{
          activeTab,
          tabs,
          panels,
          register,
          orientation,
          keyboardActivationBehavior,
          onChange: handleChange
        }}
      >
        {children}
      </TabGroupContext.Provider>
    </div>
  );
};

const TabGroup = componentWithForwardedRef<
  HTMLDivElement,
  TabGroupProps,
  typeof TabGroupBase
>(TabGroupBase);

export default TabGroup;