import * as React from "react";
import { SystemError } from "../internals";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useControlledProp,
  useForkedRefs,
  useIsMounted,
} from "../utils";
import { TabGroupContext, type TabGroupContextValue } from "./context";
import { Root as RootSlot } from "./slots";

type OwnProps = {
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
   * The Callback is fired when the state changes.
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
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const TabGroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
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

  const rootRef = React.useRef<HTMLDivElement>();
  const handleRootRef = useForkedRefs(ref, rootRef);

  const [activeTab, setActiveTab] = useControlledProp(
    activeTabProp,
    defaultActiveTab,
    0,
  );

  const children = React.Children.map(childrenProp, child =>
    React.isValidElement(child) ? child : null,
  );

  const handleChange = (tabIndex: number) => {
    if (!isMounted()) return;

    setActiveTab(tabIndex);
    onChange?.(tabIndex);
  };

  const tabs: TabGroupContextValue["tabs"] = [];
  const panels: TabGroupContextValue["panels"] = [];

  const register: TabGroupContextValue["register"] = ref => {
    if (!ref.current) return;

    if (ref.current instanceof HTMLDivElement) {
      const idx = panels.findIndex(r => r.current === ref.current);

      if (idx < 0) panels.push(ref as (typeof panels)[number]);
    } else {
      const idx = tabs.findIndex(r => r.current === ref.current);

      if (idx < 0) tabs.push(ref as (typeof tabs)[number]);
    }
  };

  React.useEffect(() => {
    const tabs =
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    if (!tabs) return;

    const tabElement = tabs[activeTab];

    if (!tabElement) return;

    if (tabElement.disabled || tabElement.hasAttribute("disabled")) {
      throw new SystemError("The selected tab is `disabled`.", "TabGroup.Root");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      {...otherProps}
      className={className}
      ref={handleRootRef}
      data-slot={RootSlot}
    >
      <TabGroupContext.Provider
        value={{
          activeTab,
          tabs,
          panels,
          register,
          orientation,
          keyboardActivationBehavior,
          onChange: handleChange,
        }}
      >
        {children}
      </TabGroupContext.Provider>
    </div>
  );
};

const TabGroup = componentWithForwardedRef(TabGroupBase, "TabGroup");

export default TabGroup;
