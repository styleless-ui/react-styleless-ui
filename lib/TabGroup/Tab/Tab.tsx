import * as React from "react";
import { SystemKeys } from "../../internals";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useButtonBase,
  useDeterministicId,
  useEventCallback,
  useForkedRefs
} from "../../utils";
import TabGroupContext from "../context";
import { TabRoot as TabRootSlot } from "../slots";

interface TabOwnProps {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        /** The `selected` state of the tab. */
        selected: boolean;
        /** The `disabled` state of the tab. */
        disabled: boolean;
        /** The `:focus-visible` state of the tab. */
        focusedVisible: boolean;
      }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: {
        /** The `selected` state of the tab. */
        selected: boolean;
        /** The `disabled` state of the tab. */
        disabled: boolean;
        /** The `:focus-visible` state of the tab. */
        focusedVisible: boolean;
      }) => string);
  /**
   * If `true`, the tab will be disabled.
   * @default false
   */
  disabled?: boolean;
}

export type TabProps = Omit<
  MergeElementProps<"button", TabOwnProps>,
  "defaultChecked" | "defaultValue"
>;

const TabBase = (props: TabProps, ref: React.Ref<HTMLButtonElement>) => {
  const {
    id: idProp,
    children: childrenProp,
    className: classNameProp,
    disabled = false,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    ...otherProps
  } = props;

  const tabGroupCtx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__tab");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const index = Number(otherProps["data-index"] as string);

  const buttonBase = useButtonBase({
    disabled,
    onBlur,
    onFocus,
    onKeyUp,
    onKeyDown: useEventCallback<React.KeyboardEvent<HTMLButtonElement>>(
      event => {
        if (tabGroupCtx) {
          const { tabs, keyboardActivationBehavior, orientation } = tabGroupCtx;
          const currentTab = tabs[index]?.current;

          if (!currentTab || document.activeElement !== currentTab)
            return onKeyDown?.(event);

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

          let focusTabRef: React.RefObject<HTMLButtonElement> | null = null;

          const getAvailableTab = (
            idx: number,
            forward: boolean,
            prevIdxs: number[] = []
          ): typeof focusTabRef => {
            const tabRef = tabs[idx];

            if (prevIdxs.includes(idx)) return null;

            if (!tabRef?.current || tabRef.current.disabled) {
              const newIdx =
                (forward ? idx + 1 : idx - 1 + tabs.length) % tabs.length;
              return getAvailableTab(newIdx, forward, [...prevIdxs, idx]);
            }

            return tabRef;
          };

          if (goPrev) {
            focusTabRef = getAvailableTab(
              (index - 1 + tabs.length) % tabs.length,
              false
            );
          } else if (goNext) {
            focusTabRef = getAvailableTab((index + 1) % tabs.length, true);
          } else if (goFirst) {
            focusTabRef = getAvailableTab(0, true);
          } else if (goLast) {
            focusTabRef = getAvailableTab(tabs.length - 1, false);
          }

          if (focusTabRef) {
            event.preventDefault();

            focusTabRef.current?.focus();
            keyboardActivationBehavior === "automatic" &&
              focusTabRef.current?.click();
          }
        }

        onKeyDown?.(event);
      }
    ),
    onClick: useEventCallback(() => void tabGroupCtx?.onChange(index))
  });

  const rootRef = React.useRef<HTMLButtonElement>(null);
  const handleRef = useForkedRefs(ref, rootRef, buttonBase.handleButtonRef);

  tabGroupCtx?.register(rootRef);

  const selected = tabGroupCtx ? tabGroupCtx.activeTab === index : false;

  const ctx = {
    selected,
    disabled,
    focusedVisible: buttonBase.isFocusedVisible
  };

  const children =
    typeof childrenProp === "function" ? childrenProp(ctx) : childrenProp;

  const className =
    typeof classNameProp === "function" ? classNameProp(ctx) : classNameProp;

  const refCallback = (node: HTMLButtonElement | null) => {
    handleRef(node);
    if (!node) return;

    const panelId = tabGroupCtx?.panels[index]?.current?.id;
    panelId && node.setAttribute("aria-controls", panelId);
  };

  return (
    <button
      {...otherProps}
      id={id}
      role="tab"
      data-slot={TabRootSlot}
      type="button"
      ref={refCallback}
      onClick={buttonBase.handleClick}
      onBlur={buttonBase.handleBlur}
      onFocus={buttonBase.handleFocus}
      onKeyDown={buttonBase.handleKeyDown}
      onKeyUp={buttonBase.handleKeyUp}
      disabled={disabled}
      tabIndex={disabled ? -1 : selected ? 0 : -1}
      className={className}
      aria-selected={selected}
    >
      {children}
    </button>
  );
};

const Tab = componentWithForwardedRef(TabBase);

export default Tab;
