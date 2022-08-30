import * as React from "react";
import FocusTrap from "../FocusTrap";
import { SystemKeys } from "../internals";
import Popper, { type PopperProps } from "../Popper";
import type { VirtualElement } from "../Popper/helpers";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  contains,
  useDeterministicId,
  useDirection,
  useEventCallback,
  useEventListener,
  useForkedRefs
} from "../utils";
import MenuContext, { type IMenuContext } from "./context";

interface MenuBaseProps {
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
  anchorElement?:
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
   * Callback fired when the `Escape` key is released.
   */
  onEscapeKeyUp?: (event: KeyboardEvent) => void;
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
}

export type MenuProps = Omit<
  MergeElementProps<"div", MenuBaseProps>,
  "defaultValue" | "defaultChecked"
>;

const makeRegisterItem =
  (items: React.RefObject<HTMLDivElement>[]) =>
  (itemRef: React.RefObject<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const itemAlreadyExists = items.some(i => i.current === itemRef.current);
    if (itemAlreadyExists) return;

    items.push(itemRef);
  };

const MenuBase = (props: MenuProps, ref: React.Ref<HTMLDivElement>) => {
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
    onEscapeKeyUp,
    shouldActivateKeyboardNavigation,
    ...otherProps
  } = props;

  const menuCtx = React.useContext(MenuContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const keepMounted =
    typeof keepMountedProp === "undefined"
      ? menuCtx?.keepMounted ?? false
      : keepMountedProp;

  const id = useDeterministicId(idProp, "styleless-ui__menu");

  const { current: isPopper } = React.useRef(
    typeof anchorElement !== "undefined"
  );

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

  const searchTimeoutRef = React.useRef<number>();
  const searchQuery = React.useRef<string>();
  const searchOccurrences =
    React.useRef<Array<[React.RefObject<HTMLDivElement>, number]>>();

  const items: React.RefObject<HTMLDivElement>[] = [];
  const registerItem = makeRegisterItem(items);

  const context: IMenuContext = {
    ref: rootRef,
    activeElement,
    activeSubTrigger,
    isMenuActive,
    keepMounted,
    shouldActivateFirstSubItemRef: shouldActivateFirstSubItem,
    setActiveSubTrigger,
    registerItem,
    setIsMenuActive,
    setActiveElement: node => {
      menuCtx?.setIsMenuActive(false);

      setActiveElement(node);
      setActiveSubTrigger(null);
    }
  };

  React.useEffect(() => {
    if (!open) {
      setActiveElement(null);
      setIsMenuActive(false);

      initialFocus.current = false;
    } else setIsMenuActive(true);
  }, [open]);

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

          onOutsideClick?.(event);
        })
      },
      open && isMenuActive
    );

    useEventListener(
      {
        target: document,
        eventType: "keyup",
        handler: useEventCallback<KeyboardEvent>(event =>
          onEscapeKeyUp?.(event)
        )
      },
      open && isMenuActive
    );

    useEventListener(
      {
        target: document,
        eventType: "keydown",
        handler: useEventCallback<KeyboardEvent>(event => {
          if (!shouldAllowKeyboardNavigation()) return;

          const select = [SystemKeys.ENTER, SystemKeys.SPACE].includes(
            event.key
          );

          const goPrev = SystemKeys.UP === event.key;
          const goNext = SystemKeys.DOWN === event.key;

          const openSubMenu =
            (dir === "rtl" ? SystemKeys.LEFT : SystemKeys.RIGHT) === event.key;
          const closeSubMenu =
            (dir === "rtl" ? SystemKeys.RIGHT : SystemKeys.LEFT) === event.key;

          const doSearch = !goPrev && !goNext && !openSubMenu && !closeSubMenu;

          const getAvailableItem = (
            idx: number,
            forward: boolean,
            prevIdxs: number[] = []
          ): React.RefObject<HTMLDivElement> | null => {
            const itemRef = items[idx];

            if (prevIdxs.includes(idx)) return null;

            if (itemRef?.current?.getAttribute("aria-disabled") === "true") {
              const newIdx =
                (forward ? idx + 1 : idx - 1 + items.length) % items.length;

              return getAvailableItem(newIdx, forward, [...prevIdxs, idx]);
            }

            return itemRef;
          };

          let nextActive: HTMLDivElement | null = activeElement ?? null;

          if (goNext || goPrev) {
            event.preventDefault();

            if (menuCtx && menuCtx.isMenuActive)
              return menuCtx.setActiveSubTrigger(null);

            const currentIdx = items.findIndex(
              itemRef => itemRef.current === nextActive
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
                  false
                )?.current ?? null;
            }
          }

          nextActive?.scrollIntoView(false);
          setActiveElement(nextActive);

          if (select) {
            event.preventDefault();
            activeElement?.click();
          }

          if (
            nextActive?.hasAttribute("aria-haspopup") &&
            (openSubMenu || select)
          ) {
            setActiveSubTrigger(nextActive);
            setIsMenuActive(false);
            shouldActivateFirstSubItem.current = true;
          } else if (menuCtx && closeSubMenu) {
            menuCtx.shouldActivateFirstSubItemRef.current = false;
            menuCtx.setActiveElement(menuCtx.activeSubTrigger);
            menuCtx.setIsMenuActive(true);
            menuCtx.setActiveSubTrigger(null);
          }

          if (doSearch && !disabledKeySearch) {
            if (searchQuery.current === event.key) {
              if (
                searchOccurrences.current &&
                searchOccurrences.current.length
              ) {
                const occIdx = searchOccurrences.current.findIndex(
                  occ => occ[0].current === nextActive
                );

                if (occIdx >= 0) {
                  const nextIdx =
                    searchOccurrences.current[
                      (occIdx + 1) % searchOccurrences.current.length
                    ][1];
                  setActiveElement(items[nextIdx].current);
                } else {
                  setActiveElement(
                    items[searchOccurrences?.current[0]?.[1]].current
                  );
                }
              }
            } else {
              searchQuery.current = event.key;
              searchOccurrences.current = items.reduce((result, item, idx) => {
                if (item.current?.getAttribute("aria-disabled") === "true")
                  return result;

                const text = item.current?.textContent;
                if (text?.toLowerCase().trim()[0] === event.key.toLowerCase())
                  return [...result, [item, idx]];

                return result;
              }, [] as Array<[React.RefObject<HTMLDivElement>, number]>);

              if (searchOccurrences.current.length) {
                setActiveElement(
                  items[searchOccurrences.current[0][1]].current
                );
              }
            }

            window.clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = window.setTimeout(() => {
              searchQuery.current = undefined;
              searchOccurrences.current = undefined;
            }, 750);
          }
        })
      },
      open && isMenuActive
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

    const firstItem = node.querySelector<HTMLDivElement>("[role*='menuitem']");
    if (!firstItem) return;

    setActiveElement(firstItem);
    initialFocus.current = true;
    // setIsMenuActive(true);
    // menuCtx.setIsMenuActive(false);
  };

  const popperComputationMiddleware: PopperProps["computationMiddleware"] = ({
    overflow,
    elementRects,
    placement
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

  const createPopper = () => {
    if (!anchorElement) return null;

    return (
      <Popper
        keepMounted={keepMounted}
        open={open}
        anchorElement={anchorElement}
        computationMiddlewareOrder="afterAutoPlacement"
        computationMiddleware={popperComputationMiddleware}
        offset={0}
        alignment={alignment}
        autoPlacement={{ excludeSides: ["top", "bottom"] }}
      >
        <FocusTrap enabled={open}>
          <div
            {...otherProps}
            ref={refCallback}
            id={id}
            data-slot="menuRoot"
            className={className}
            tabIndex={-1}
            {...(open ? { "data-open": "" } : {})}
          >
            <MenuContext.Provider value={context}>
              {children}
            </MenuContext.Provider>
          </div>
        </FocusTrap>
      </Popper>
    );
  };

  return isPopper ? (
    createPopper()
  ) : keepMounted || (!keepMounted && open) ? (
    <FocusTrap enabled={open}>
      <div
        {...otherProps}
        ref={refCallback}
        id={id}
        data-slot="menuRoot"
        className={className}
        tabIndex={-1}
        {...(open ? { "data-open": "" } : {})}
      >
        <MenuContext.Provider value={context}>{children}</MenuContext.Provider>
      </div>
    </FocusTrap>
  ) : null;
};

const Menu = componentWithForwardedRef<
  HTMLDivElement,
  MenuProps,
  typeof MenuBase
>(MenuBase);

export default Menu;
