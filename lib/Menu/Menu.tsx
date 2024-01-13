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
import { makeRegisterItem, useSearchQuery } from "./utils";

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

  // The element which is active and you can control with keyboard.
  const [activeElement, setActiveElement] =
    React.useState<HTMLDivElement | null>(null);

  // The active item which is going to trigger a sub menu.
  const [activeSubTrigger, setActiveSubTrigger] =
    React.useState<HTMLDivElement | null>(null);

  const [isMenuActive, setIsMenuActive] = React.useState(open);

  const dir = useDirection(rootRef) ?? "ltr";

  const shouldActivateFirstSubItemRef = React.useRef(false);
  const initialFocusRef = React.useRef(false);

  const itemsRegistry: React.RefObject<HTMLDivElement>[] = [];
  const registerItem = makeRegisterItem(itemsRegistry);

  const searchQuery = useSearchQuery(itemsRegistry);

  const context: MenuContextValue = {
    ref: rootRef,
    activeElement,
    activeSubTrigger,
    isMenuActive,
    keepMounted,
    shouldActivateFirstSubItemRef,
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
      initialFocusRef.current = false;
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
      shouldActivateFirstSubItemRef.current = true;
    };

    useEventListener(
      {
        target: document,
        eventType: "keydown",
        handler: useEventCallback<KeyboardEvent>(event => {
          const shouldAllowKeyboardNavigation =
            shouldActivateKeyboardNavigation ?? true;

          if (!shouldAllowKeyboardNavigation) return;

          const goPrevCase = SystemKeys.UP === event.key;
          const goNextCase = SystemKeys.DOWN === event.key;

          const escapeCase = SystemKeys.ESCAPE === event.key;

          const selectCase = [SystemKeys.ENTER, SystemKeys.SPACE].includes(
            event.key,
          );

          const openSubCase =
            (dir === "rtl" ? SystemKeys.LEFT : SystemKeys.RIGHT) === event.key;

          const closeSubCase =
            (dir === "rtl" ? SystemKeys.RIGHT : SystemKeys.LEFT) === event.key;

          const searchCase =
            !goPrevCase && !goNextCase && !openSubCase && !closeSubCase;

          if (escapeCase) {
            event.preventDefault();
            onEscape?.(event) ?? menuCtx?.onEscape?.(event);

            return;
          }

          if (selectCase) {
            if (!activeElement) return;

            activeElement.click();

            if (activeElement.hasAttribute("aria-haspopup")) {
              openSubMenu(activeElement);
            }

            return;
          }

          if (searchCase && !disabledKeySearch) {
            searchQuery(event, { value: activeElement, set: setActiveElement });

            return;
          }

          const getAvailableItem = (
            idx: number,
            forward: boolean,
            prevIdxs: number[] = [],
          ): React.RefObject<HTMLDivElement> | null => {
            const itemRef = itemsRegistry[idx];
            const item = itemRef?.current;

            if (!item) return null;
            if (prevIdxs.includes(idx)) return null;

            if (item.getAttribute("aria-disabled") === "true") {
              const newIdx =
                (forward ? idx + 1 : idx - 1 + itemsRegistry.length) %
                itemsRegistry.length;

              return getAvailableItem(newIdx, forward, [...prevIdxs, idx]);
            }

            return itemRef;
          };

          let nextActive: HTMLDivElement | null = activeElement ?? null;

          if (goNextCase || goPrevCase) {
            event.preventDefault();

            if (menuCtx && menuCtx.isMenuActive) {
              return menuCtx.setActiveSubTrigger(null);
            }

            const currentIdx = itemsRegistry.findIndex(
              itemRef => itemRef.current === nextActive,
            );

            if (goNextCase) {
              nextActive =
                getAvailableItem((currentIdx + 1) % itemsRegistry.length, true)
                  ?.current ?? null;
            } else if (goPrevCase) {
              nextActive =
                getAvailableItem(
                  ((currentIdx === -1 ? 0 : currentIdx) -
                    1 +
                    itemsRegistry.length) %
                    itemsRegistry.length,
                  false,
                )?.current ?? null;
            }
          }

          nextActive?.scrollIntoView(false);
          setActiveElement(nextActive);

          if (nextActive?.hasAttribute("aria-haspopup") && openSubCase) {
            openSubMenu(nextActive);
          } else if (menuCtx && closeSubCase) {
            menuCtx.shouldActivateFirstSubItemRef.current = false;
            menuCtx.setActiveElement(menuCtx.activeSubTrigger);
            menuCtx.setIsMenuActive(true);
            menuCtx.setActiveSubTrigger(null);
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
    if (initialFocusRef.current) return;

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
    initialFocusRef.current = true;
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
