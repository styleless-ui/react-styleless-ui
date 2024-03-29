import * as React from "react";
import Popper, {
  type PopperClassNameProps,
  type PopperProps,
  type PopperRenderProps,
} from "../Popper";
import type { Coordinates } from "../Popper/types";
import { SystemError, SystemKeys } from "../internals";
import type { MergeElementProps, VirtualElement } from "../types";
import {
  componentWithForwardedRef,
  contains,
  createVirtualElement,
  isHTMLElement,
  useControlledProp,
  useDeterministicId,
  useEventCallback,
  useEventListener,
  useForkedRefs,
} from "../utils";

export type RenderProps = PopperRenderProps;
export type ClassNameProps = PopperClassNameProps;

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: PopperProps["children"];
  /**
   * The className applied to the component.
   */
  className?: PopperProps["className"];
  /**
   * A function that will resolve the anchor element for the tooltip.
   *
   * It has to return `HTMLElement`, or a `VirtualElement`, or `null`.
   * A VirtualElement is an object that implements `getBoundingClientRect(): BoundingClientRect`.
   *
   * If nothing is resolved, the tooltip won't show up.
   *
   * Please note that this function is only called on the client-side.
   */
  resolveAnchor: () => HTMLElement | VirtualElement | null;
  /**
   * Tooltip placement. It will be auto updated when `autoPlacement={true}`.
   *
   * @default "top"
   */
  placement?: PopperProps["side"];
  /**
   * By enabling this option, tooltip chooses the placement automatically
   * (the one with the most space available)
   * and ignores the `placement` property value.
   *
   * @default false
   */
  autoPlacement?: PopperProps["autoPlacement"];
  /**
   * The tooltip will be triggered by this event.\
   * **Note**: choosing `"follow-mouse"` will disable `autoPlacement` property.
   * @default "full-controlled"
   */
  behavior?:
    | "open-on-hover"
    | "open-on-click"
    | "follow-mouse"
    | "full-controlled";
  /**
   * 	If `true`, the tooltip will be open.
   */
  open?: boolean;
  /**
   * 	If `true`, the tooltip will be open on mount. Use when the component is not controlled.
   */
  defaultOpen?: boolean;
  /**
   * The Callback is fired when outside of the tooltip is clicked.
   */
  onOutsideClick?: (event: MouseEvent) => void;
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   * @default false
   */
  keepMounted?: boolean;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const TooltipBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children,
    className,
    defaultOpen,
    resolveAnchor: resolveAnchorProp,
    onOutsideClick,
    id: idProp,
    open: openProp,
    keepMounted = false,
    autoPlacement = false,
    placement = "top",
    behavior = "full-controlled",
    ...otherProps
  } = props;

  if (behavior !== "full-controlled" && typeof openProp !== "undefined") {
    throw new SystemError(
      "You are trying to control the `open` property " +
        'while the `behavior` isn\'t `"full-controlled".`',
      "Tooltip",
    );
  }

  const id = useDeterministicId(idProp, "styleless-ui__tooltip");

  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const handleTooltipRef = useForkedRefs(ref, tooltipRef);

  const [open, setOpen] = useControlledProp(openProp, defaultOpen, false);

  const [coordinates, setCoordinates] = React.useState<Coordinates>({
    x: 0,
    y: 0,
  });

  const popperActions: PopperProps["actions"] = React.useRef(null);

  const resolveAnchor =
    behavior === "follow-mouse"
      ? () => createVirtualElement(0, 0, coordinates.x, coordinates.y)
      : resolveAnchorProp;

  const outsideClickHandler = useEventCallback<MouseEvent>(event => {
    const anchor = resolveAnchor();

    if (!event.target) return;
    if (!anchor) return;
    if (anchor === event.target) return;
    if (!tooltipRef.current) return;
    if (tooltipRef.current === event.target) return;
    if (!(anchor instanceof HTMLElement)) return;
    if (contains(anchor, event.target as HTMLElement)) return;
    if (contains(tooltipRef.current, event.target as HTMLElement)) return;

    onOutsideClick?.(event);
  });

  if (typeof document !== "undefined") {
    /* eslint-disable react-hooks/rules-of-hooks */
    const anchor = resolveAnchor();

    const eventTarget = React.useMemo(
      () => (isHTMLElement(anchor) ? anchor : null),
      [anchor],
    );

    useEventListener(
      {
        target: eventTarget,
        eventType: "click",
        handler: useEventCallback(
          () => void (open ? setOpen(false) : setOpen(true)),
        ),
      },
      isHTMLElement(anchor) && behavior === "open-on-click",
    );

    useEventListener(
      {
        target: eventTarget,
        eventType: "mouseenter",
        handler: useEventCallback(() => void setOpen(true)),
      },
      isHTMLElement(anchor) &&
        ["open-on-hover", "follow-mouse"].includes(behavior),
    );

    useEventListener(
      {
        target: eventTarget,
        eventType: "mouseleave",
        handler: useEventCallback(() => void setOpen(false)),
      },
      isHTMLElement(anchor) &&
        ["open-on-hover", "follow-mouse"].includes(behavior),
    );

    useEventListener(
      {
        target: eventTarget,
        eventType: "mousemove",
        handler: useEventCallback<MouseEvent>(event => {
          setCoordinates({ x: event.clientX, y: event.clientY });
          popperActions.current?.recompute();
        }),
      },
      isHTMLElement(anchor) && behavior === "follow-mouse",
    );

    useEventListener(
      {
        target: document,
        eventType: "click",
        handler: outsideClickHandler,
        options: { capture: true },
      },
      open && !!onOutsideClick,
    );

    useEventListener(
      {
        target: document,
        eventType: "keyup",
        handler: useEventCallback<KeyboardEvent>(event => {
          if (event.key === SystemKeys.ESCAPE) setOpen(false);
        }),
      },
      open && behavior === "open-on-click",
    );
    /* eslint-enable react-hooks/rules-of-hooks */
  }

  return (
    <Popper
      {...otherProps}
      id={id}
      role="tooltip"
      open={open}
      ref={handleTooltipRef}
      side={placement}
      actions={popperActions}
      className={className}
      keepMounted={keepMounted}
      autoPlacement={behavior === "follow-mouse" ? false : autoPlacement}
      offset={behavior === "follow-mouse" ? 32 : undefined}
      resolveAnchor={resolveAnchor}
    >
      {children}
    </Popper>
  );
};

const Tooltip = componentWithForwardedRef(TooltipBase, "Tooltip");

export default Tooltip;
