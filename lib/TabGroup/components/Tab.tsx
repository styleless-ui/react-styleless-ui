import * as React from "react";
import { SystemKeys, logger } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  useButtonBase,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import { TabGroupContext } from "../context";
import { Root as RootSlot, TabRoot as TabRootSlot } from "../slots";

export type RenderProps = {
  /**
   * The `selected` state of the tab.
   */
  selected: boolean;
  /**
   * The `disabled` state of the tab.
   */
  disabled: boolean;
  /**
   * The `:focus-visible` state of the tab.
   */
  focusedVisible: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PropWithRenderContext<React.ReactNode, RenderProps>;
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * If `true`, the tab will be disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * A unique value that associates the tab with a panel(content).
   */
  value: string;
};

export type Props = Omit<
  MergeElementProps<"button", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const TabBase = (props: Props, ref: React.Ref<HTMLButtonElement>) => {
  const {
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    value,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const ctx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__tab");

  const buttonBase = useButtonBase({
    disabled,
    onBlur,
    onFocus,
    onKeyUp,
    onKeyDown: useEventCallback<React.KeyboardEvent<HTMLButtonElement>>(
      event => {
        if (ctx) {
          const { keyboardActivationBehavior, orientation } = ctx;

          const list =
            event.currentTarget.closest<HTMLElement>("[role='tablist']");

          const tabs = Array.from(
            list?.querySelectorAll<HTMLElement>("[role='tab']") ?? [],
          );

          const currentTabIdx = tabs.findIndex(
            tab => tab.getAttribute("data-entityname") === value,
          );

          const currentTab = tabs[currentTabIdx];

          const dir = currentTab
            ? window.getComputedStyle(currentTab).direction
            : "ltr";

          const goNext =
            event.key ===
            (orientation === "horizontal"
              ? dir === "ltr"
                ? SystemKeys.RIGHT
                : SystemKeys.LEFT
              : SystemKeys.DOWN);

          const goPrev =
            event.key ===
            (orientation === "horizontal"
              ? dir === "ltr"
                ? SystemKeys.LEFT
                : SystemKeys.RIGHT
              : SystemKeys.UP);

          const goFirst = event.key === SystemKeys.HOME;
          const goLast = event.key === SystemKeys.END;

          let activeTab: HTMLElement | null = null;

          const getAvailableTab = (
            idx: number,
            forward: boolean,
            prevIdxs: number[] = [],
          ): HTMLElement | null => {
            const tab = tabs[idx];

            if (prevIdxs.includes(idx)) return null;
            if (!tab) return null;

            const newIdx =
              (forward ? idx + 1 : idx - 1 + tabs.length) % tabs.length;

            const isDisabled =
              tab.hasAttribute("disabled") ||
              tab.getAttribute("aria-disabled") === "true";

            if (!isDisabled) return tab;

            return getAvailableTab(newIdx, forward, [...prevIdxs, idx]);
          };

          if (goPrev) {
            activeTab = getAvailableTab(
              (currentTabIdx - 1 + tabs.length) % tabs.length,
              false,
            );
          } else if (goNext) {
            activeTab = getAvailableTab(
              (currentTabIdx + 1) % tabs.length,
              true,
            );
          } else if (goFirst) {
            activeTab = getAvailableTab(0, true);
          } else if (goLast) {
            activeTab = getAvailableTab(tabs.length - 1, false);
          }

          if (activeTab) {
            event.preventDefault();

            activeTab.focus();
            keyboardActivationBehavior === "automatic" && activeTab.click();
          }
        }

        onKeyDown?.(event);
      },
    ),
    onClick: useEventCallback(() => void ctx?.onChange(value)),
  });

  const handleRef = useForkedRefs(ref, buttonBase.handleButtonRef);

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <TabGroup.Root>.",
      {
        scope: "TabGroup.Tab",
        type: "error",
      },
    );

    return null;
  }

  const selected = ctx.activeTab === value;

  const renderProps: RenderProps = {
    selected,
    disabled,
    focusedVisible: buttonBase.isFocusedVisible,
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

  const calcTabIndex = () => {
    if (disabled) return -1;
    if (!ctx) return 0;

    const forcedTabableItem = ctx.forcedTabability;

    if (forcedTabableItem && forcedTabableItem === value) return 0;

    const isSelected = ctx.activeTab === value;

    if (!isSelected) return -1;

    return 0;
  };

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);

    if (!selected) return;
    if (!node) return;

    const root = node.closest<HTMLElement>(`[data-slot="${RootSlot}"]`);

    if (!root) return;

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[role='tabpanel']"),
    );

    const correspondedPanel = panels.find(
      panel => panel.getAttribute("data-entityname") === value,
    );

    if (!correspondedPanel) {
      logger(
        `Couldn't find a corresponding <TabGroup.Panel> with \`value={${value}}\`.`,
        { scope: "TabGroup.Tab", type: "error" },
      );

      return;
    }

    node.setAttribute("aria-controls", correspondedPanel.id);
  };

  return (
    <button
      {...otherProps}
      id={id}
      role="tab"
      type="button"
      ref={refCallback}
      onClick={buttonBase.handleClick}
      onBlur={buttonBase.handleBlur}
      onFocus={buttonBase.handleFocus}
      onKeyDown={buttonBase.handleKeyDown}
      onKeyUp={buttonBase.handleKeyUp}
      disabled={disabled}
      tabIndex={calcTabIndex()}
      className={className}
      aria-selected={selected}
      data-slot={TabRootSlot}
      data-entityname={value}
      data-selected={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-focus-visible={buttonBase.isFocusedVisible ? "" : undefined}
    >
      {children}
    </button>
  );
};

const Tab = componentWithForwardedRef(TabBase, "TabGroup.Tab");

export default Tab;
