import useDeterministicId from "@utilityjs/use-deterministic-id";
import useForkedRefs from "@utilityjs/use-forked-refs";
import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useButtonBase,
  useEventCallback
} from "../../utils";
import TabGroupContext from "../context";

interface TabBaseProps {
  /**
   * The content of the tab.
   */
  children?: React.ReactNode | ((selected: boolean) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: {
        /** The `selected` state of the tab. */
        selected: boolean;
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
  MergeElementProps<"button", TabBaseProps>,
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

  const buttonBase = useButtonBase({
    disabled,
    onBlur,
    onFocus,
    onKeyUp,
    onKeyDown: useEventCallback<React.KeyboardEvent<HTMLButtonElement>>(
      event => {
        if (tabGroupCtx) {
          const { tabs, keyboardActivationBehavior, orientation } = tabGroupCtx;

          const currentTab = tabs[index].current;

          if (!currentTab || document.activeElement !== currentTab)
            return onKeyDown?.(event);

          const dir = currentTab
            ? window.getComputedStyle(currentTab).direction
            : "ltr";

          const goNext =
            event.key.toLowerCase() ===
            (orientation === "horizontal"
              ? dir === "ltr"
                ? "arrowright"
                : "arrowleft"
              : "arrowdown");

          const goPrev =
            event.key.toLowerCase() ===
            (orientation === "horizontal"
              ? dir === "ltr"
                ? "arrowleft"
                : "arrowright"
              : "arrowup");

          if (goPrev) {
            event.preventDefault();

            const prevTab = tabs[(index - 1 + tabs.length) % tabs.length];
            prevTab.current?.focus();

            keyboardActivationBehavior === "automatic" &&
              prevTab.current?.click();
          } else if (goNext) {
            event.preventDefault();

            const nextTab = tabs[(index + 1) % tabs.length];
            nextTab.current?.focus();

            keyboardActivationBehavior === "automatic" &&
              nextTab.current?.click();
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const index = Number(otherProps["data-index"] as string);

  const selected = tabGroupCtx ? tabGroupCtx.activeTab === index : false;

  const children =
    typeof childrenProp === "function" ? childrenProp(selected) : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp({ selected, focusedVisible: buttonBase.isFocusedVisible })
      : classNameProp;

  return (
    <button
      {...otherProps}
      id={id}
      role="tab"
      type="button"
      ref={node => {
        handleRef(node);
        if (!node) return;

        const panelId = tabGroupCtx?.panels[index]?.current?.id;
        panelId && node.setAttribute("aria-controls", panelId);
      }}
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

const Tab = componentWithForwardedRef<
  HTMLButtonElement,
  TabProps,
  typeof TabBase
>(TabBase);

export default Tab;
