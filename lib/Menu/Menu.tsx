import * as React from "react";
import Popper, { type PopperProps, type VirtualElement } from "../Popper";
import { FocusTrap, SystemKeys } from "../internals";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  contains,
  useDeterministicId,
  useDirection,
  useEventCallback,
  useEventListener,
  useForkedRefs,
  usePreviousValue,
} from "../utils";
import { MenuContext, type MenuContextValue } from "./context";
import { Root as RootSlot } from "./slots";
import { makeRegisterItem } from "./utils";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode | ((ctx: { open: boolean }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?: string | ((ctx: { open: boolean }) => string);
  /**
   * The anchor element for the menu.
   */
  anchorElement:
    | React.RefObject<HTMLElement>
    | HTMLElement
    | VirtualElement
    | string;
  /**
   * The menu positioning alignment.
   * @default "start"
   */
  alignment?: PopperProps["alignment"];
  /**
   * 	If `true`, the menu will be open.
   */
  open?: boolean;
  /**
   * Callback fired when a click interaction happens outside the component.
   */
  onOutsideClick?: (event: MouseEvent) => void;
  /**
   * Callback fired when the `Escape` key is pressed.
   */
  onEscape?: (event: KeyboardEvent) => void;
  /**
   * Used to prevent/allow keyboard navigation when more control is needed.
   * @default true
   */
  shouldActivateKeyboardNavigation?: boolean;
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.\
   * It will be inherited by any descendant submenus respectively.
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Used to prevent/allow item selection with typed character.
   * @default false
   */
  disabledKeySearch?: boolean;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const MenuBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    className: classNameProp,
    children: childrenProp,
    alignment = "start",
    anchorElement,
    keepMounted: keepMountedProp,
    disabledKeySearch = false,
    open = false,
    onOutsideClick,
    onEscape,
    shouldActivateKeyboardNavigation,
    ...otherProps
  } = props;

  const menuCtx = React.useContext(MenuContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const prevOpen = usePreviousValue(open);

  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  const keepMounted =
    typeof keepMountedProp === "undefined"
      ? menuCtx?.keepMounted ?? false
      : keepMountedProp;

  const id = useDeterministicId(idProp, "styleless-ui__menu");

  const [activeElement, setActiveElement] =
    React.useState<HTMLDivElement | null>(null);

  const [activeSubTrigger, setActiveSubTrigger] =
    React.useState<HTMLDivElement | null>(null);

  const [isMenuActive, setIsMenuActive] = React.useState(open);

  const shouldAllowKeyboardNavigation = () =>
    shouldActivateKeyboardNavigation ?? true;

  const dir = useDirection(rootRef) ?? "ltr";

  const shouldActivateFirstSubItem = React.useRef(false);
  const initialFocus = React.useRef(false);

  const isQueryingAllowed = React.useRef(true);
  const queryCacheTimeoutRef = React.useRef(-1);
  const query = React.useRef<string>();
  const queryResults = React.useRef<
    Array<[React.RefObject<HTMLDivElement>, number]>
  >([]);

  const items: React.RefObject<HTMLDivElement>[] = [];
  const registerItem = makeRegisterItem(items);

  const context: MenuContextValue = {
    ref: rootRef,
    activeElement,
    activeSubTrigger,
    isMenuActive,
    keepMounted,
    shouldActivateFirstSubItemRef: shouldActivateFirstSubItem,
    setActiveSubTrigger,
    registerItem,
    setIsMenuActive,
    onEscape,
    onOutsideClick,
    setActiveElement: node => {
      menuCtx?.setIsMenuActive(false);

      setActiveElement(node);
      setActiveSubTrigger(null);
    },
  };

  React.useEffect(() => {
    if (!open && typeof prevOpen === "boolean" && open !== prevOpen) {
      previouslyFocusedElement.current
        ? previouslyFocusedElement.current.focus()
        : document.body.focus();
    }
  }, [open, prevOpen]);

  React.useEffect(() => {
    if (!open) {
      setActiveElement(null);
      setIsMenuActive(false);

      previouslyFocusedElement.current = null;
      initialFocus.current = false;
    } else {
      setIsMenuActive(true);

      if (menuCtx) return;

      previouslyFocusedElement.current =
        document.activeElement as HTMLElement | null;

      (document.activeElement as HTMLDivElement | null)?.blur();
    }
  }, [open, menuCtx]);

  if (typeof document !== "undefined") {
    /* eslint-disable react-hooks/rules-of-hooks */
    useEventListener(
      {
        target: document,
        eventType: "click",
        handler: useEventCallback<MouseEvent>(event => {
          if (!event.target) return;
          if (!rootRef.current) return;
          if (rootRef.current === event.target) return;
          if (contains(rootRef.current, event.target as HTMLElement)) return;

          setActiveElement(null);
          setActiveSubTrigger(null);

          onOutsideClick?.(event) ?? menuCtx?.onOutsideClick?.(event);
        }),
      },
      open && isMenuActive,
    );

    const openSubMenu = (element?: HTMLDivElement | null) => {
      setActiveSubTrigger(element ?? activeElement);
      setIsMenuActive(false);
      shouldActivateFirstSubItem.current = true;
    };

    useEventListener(
      {
        target: document,
        eventType: "keydown",
        handler: useEventCallback<KeyboardEvent>(event => {
          if (event.key === SystemKeys.ESCAPE) {
            event.preventDefault();
            onEscape?.(event) ?? menuCtx?.onEscape?.(event);
          }
        }),
      },
      open && isMenuActive,
    );

    useEventListener(
      {
        target: document,
        eventType: "keydown",
        handler: useEventCallback<KeyboardEvent>(event => {
          const select = [SystemKeys.ENTER, SystemKeys.SPACE].includes(
            event.key,
          );

          if (event.key === query.current) isQueryingAllowed.current = true;
          if (select && activeElement) {
            activeElement.click();

            if (activeElement.hasAttribute("aria-haspopup")) {
              openSubMenu(activeElement);
            }
          }
        }),
      },
      open && isMenuActive,
    );

    useEventListener(
      {
        target: document,
        eventType: "keydown",
        handler: useEventCallback<KeyboardEvent>(event => {
          if (!shouldAllowKeyboardNavigation()) return;

          const goPrev = SystemKeys.UP === event.key;
          const goNext = SystemKeys.DOWN === event.key;

          const openSub =
            (dir === "rtl" ? SystemKeys.LEFT : SystemKeys.RIGHT) === event.key;

          const closeSub =
            (dir === "rtl" ? SystemKeys.RIGHT : SystemKeys.LEFT) === event.key;

          const doSearch = !goPrev && !goNext && !openSub && !closeSub;

          const getAvailableItem = (
            idx: number,
            forward: boolean,
            prevIdxs: number[] = [],
          ): React.RefObject<HTMLDivElement> | null => {
            const itemRef = items[idx];

            if (!itemRef) return null;
            if (prevIdxs.includes(idx)) return null;

            if (itemRef.current?.getAttribute("aria-disabled") === "true") {
              const newIdx =
                (forward ? idx + 1 : idx - 1 + items.length) % items.length;

              return getAvailableItem(newIdx, forward, [...prevIdxs, idx]);
            }

            return itemRef;
          };

          let nextActive: HTMLDivElement | null = activeElement ?? null;

          if (goNext || goPrev) {
            event.preventDefault();

            if (menuCtx && menuCtx.isMenuActive) {
              return menuCtx.setActiveSubTrigger(null);
            }

            const currentIdx = items.findIndex(
              itemRef => itemRef.current === nextActive,
            );

            if (goNext) {
              nextActive =
                getAvailableItem((currentIdx + 1) % items.length, true)
                  ?.current ?? null;
            } else if (goPrev) {
              nextActive =
                getAvailableItem(
                  ((currentIdx === -1 ? 0 : currentIdx) - 1 + items.length) %
                    items.length,
                  false,
                )?.current ?? null;
            }
          }

          nextActive?.scrollIntoView(false);
          setActiveElement(nextActive);

          if (nextActive?.hasAttribute("aria-haspopup") && openSub) {
            openSubMenu(nextActive);
          } else if (menuCtx && closeSub) {
            menuCtx.shouldActivateFirstSubItemRef.current = false;
            menuCtx.setActiveElement(menuCtx.activeSubTrigger);
            menuCtx.setIsMenuActive(true);
            menuCtx.setActiveSubTrigger(null);
          }

          if (doSearch && !disabledKeySearch && isQueryingAllowed.current) {
            const occurrences =
              query.current === event.key
                ? queryResults.current
                : items.reduce((result, item, idx) => {
                    if (item.current?.getAttribute("aria-disabled") === "true")
                      return result;

                    const text = item.current?.textContent;

                    if (
                      text?.toLowerCase().trim()[0] === event.key.toLowerCase()
                    ) {
                      const newRecord: [
                        React.RefObject<HTMLDivElement>,
                        number,
                      ] = [item, idx];

                      return [...result, newRecord];
                    }

                    return result;
                  }, [] as Array<[React.RefObject<HTMLDivElement>, number]>);

            if (occurrences.length) {
              const idx = occurrences.findIndex(
                occ => occ[0].current === nextActive,
              );

              let nextIdx: number | undefined = undefined;

              if (idx >= 0) {
                nextIdx = occurrences[(idx + 1) % occurrences.length]?.[1];
              } else nextIdx = occurrences[0]?.[1];

              setActiveElement(
                typeof nextIdx !== "undefined"
                  ? items[nextIdx]?.current ?? null
                  : null,
              );
            }

            isQueryingAllowed.current = false;

            query.current = event.key;
            queryResults.current = occurrences;

            window.clearTimeout(queryCacheTimeoutRef.current);
            queryCacheTimeoutRef.current = window.setTimeout(() => {
              query.current = undefined;
              queryResults.current = [];
            }, 2000);
          }
        }),
      },
      open && isMenuActive,
    );
    /* eslint-enable react-hooks/rules-of-hooks */
  }

  const refCallback = (node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;
    if (!open) return;
    if (!menuCtx) return;
    if (!menuCtx.shouldActivateFirstSubItemRef.current) return;
    if (initialFocus.current) return;

    const items = node.querySelectorAll<HTMLDivElement>("[role*='menuitem']");

    const getAvailableItem = (
      idx: number,
      forward: boolean,
      prevIdxs: number[] = [],
    ): HTMLDivElement | null => {
      const item = items[idx];

      if (!item) return null;
      if (prevIdxs.includes(idx)) return null;

      if (item.getAttribute("aria-disabled") === "true") {
        const newIdx =
          (forward ? idx + 1 : idx - 1 + items.length) % items.length;

        return getAvailableItem(newIdx, forward, [...prevIdxs, idx]);
      }

      return item;
    };

    const item = getAvailableItem(0, true);

    if (!item) return;

    setActiveElement(item);
    initialFocus.current = true;
  };

  const popperComputationMiddleware: PopperProps["computationMiddleware"] = ({
    overflow,
    elementRects,
    placement,
  }) => {
    if (dir === "rtl") {
      const desiredPlacement: typeof placement =
        alignment === "middle" ? "left" : `left-${alignment}`;

      const oppOfDesiredPlacement: typeof placement =
        alignment === "middle" ? "right" : `right-${alignment}`;

      if (placement === desiredPlacement) return { placement };
      if (overflow.left + elementRects.popperRect.width <= 0) {
        return { placement: desiredPlacement };
      } else return { placement: oppOfDesiredPlacement };
    } else {
      const desiredPlacement: typeof placement =
        alignment === "middle" ? "right" : `right-${alignment}`;

      const oppOfDesiredPlacement: typeof placement =
        alignment === "middle" ? "left" : `left-${alignment}`;

      if (placement === desiredPlacement) return { placement };
      if (overflow.right + elementRects.popperRect.width <= 0) {
        return { placement: desiredPlacement };
      } else return { placement: oppOfDesiredPlacement };
    }
  };

  const children =
    typeof childrenProp === "function" ? childrenProp({ open }) : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp({ open })
      : classNameProp;

  if (!anchorElement) return null;

  return (
    <Popper
      autoPlacement
      keepMounted={keepMounted}
      open={open}
      anchorElement={anchorElement}
      computationMiddlewareOrder="afterAutoPlacement"
      computationMiddleware={popperComputationMiddleware}
      offset={0}
      alignment={alignment}
    >
      <FocusTrap enabled={open}>
        <div
          {...otherProps}
          // @ts-expect-error React hasn't added `inert` yet
          inert={!open ? "" : undefined}
          ref={refCallback}
          id={id}
          role="menu"
          data-slot={RootSlot}
          className={className}
          tabIndex={-1}
          data-open={open ? "" : undefined}
        >
          <MenuContext.Provider value={context}>
            {children}
          </MenuContext.Provider>
        </div>
      </FocusTrap>
    </Popper>
  );
};

const Menu = componentWithForwardedRef(MenuBase, "Menu");

export default Menu;
