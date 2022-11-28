import * as React from "react";
import { SystemKeys } from "../internals";
import Popper, { type PopperProps } from "../Popper";
import type { Coordinates, VirtualElement } from "../Popper/helpers";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  contains,
  isHTMLElement,
  useControlledProp,
  useDeterministicId,
  useEventCallback,
  useEventListener,
  useForkedRefs
} from "../utils";

interface TooltipBaseProps {
  /**
   * The content of the component.
   */
  children?: PopperProps["children"];
  /**
   * The className applied to the component.
   */
  className?: PopperProps["className"];
  /**
   * The anchor element for the tooltip.
   */
  anchorElement:
    | React.RefObject<HTMLElement>
    | HTMLElement
    | VirtualElement
    | string;
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
   * The Callback fires when user has clicked outside of the tooltip.
   */
  onOutsideClick?: (event: MouseEvent) => void;
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   * @default false
   */
  keepMounted?: boolean;
}

export type TooltipProps = Omit<
  MergeElementProps<"div", TooltipBaseProps>,
  "defaultValue" | "defaultChecked"
>;

const TooltipBase = (props: TooltipProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    children,
    className,
    anchorElement,
    defaultOpen,
    onOutsideClick,
    id: idProp,
    open: openProp,
    keepMounted = false,
    autoPlacement = false,
    placement = "top",
    behavior = "full-controlled",
    ...otherProps
  } = props;

  if (!anchorElement) {
    throw new Error(
      [
        "[StylelessUI][Tooltip]: Invalid `anchorElement` property.",
        "The `anchorElement` property must be either a `valid query selector (string)`, " +
          "`HTMLElement`, `RefObject<HTMLElement>`, or in shape of " +
          "`{ getBoundingClientRect(): ClientRect }`"
      ].join("\n")
    );
  }

  if (behavior !== "full-controlled" && typeof openProp !== "undefined") {
    throw new Error(
      "[StylelessUI][Tooltip]: You are trying to control the `open` property " +
        'while the `behavior` isn\'t `"full-controlled".`'
    );
  }

  const getAnchor = (anchorElement: TooltipProps["anchorElement"]) =>
    typeof anchorElement === "string"
      ? typeof document !== "undefined"
        ? document.querySelector<HTMLElement>(anchorElement)
        : null
      : "current" in anchorElement
      ? anchorElement.current
      : anchorElement;

  const id = useDeterministicId(idProp, "styleless-ui__tooltip");

  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const handleTooltipRef = useForkedRefs(ref, tooltipRef);

  const [open, setOpen] = useControlledProp(openProp, defaultOpen, false);

  const [coordinates, setCoordinates] = React.useState<Coordinates>({
    x: 0,
    y: 0
  });

  const popperActions: PopperProps["actions"] = React.useRef(null);

  const createVirtualElement = (): VirtualElement => ({
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: coordinates.x,
      y: coordinates.y,
      top: coordinates.y,
      left: coordinates.x,
      right: coordinates.x,
      bottom: coordinates.y
    })
  });

  const outsideClickHandler = useEventCallback<MouseEvent>(event => {
    const anchor = getAnchor(anchorElement);

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
    const anchor = getAnchor(anchorElement);

    /* eslint-disable react-hooks/rules-of-hooks */
    useEventListener(
      {
        target: isHTMLElement(anchor) ? anchor : null,
        eventType: "click",
        handler: useEventCallback(
          () => void (open ? setOpen(false) : setOpen(true))
        )
      },
      isHTMLElement(anchor) && behavior === "open-on-click"
    );

    useEventListener(
      {
        target: isHTMLElement(anchor) ? anchor : null,
        eventType: "mouseenter",
        handler: useEventCallback(() => void setOpen(true))
      },
      isHTMLElement(anchor) &&
        ["open-on-hover", "follow-mouse"].includes(behavior)
    );

    useEventListener(
      {
        target: isHTMLElement(anchor) ? anchor : null,
        eventType: "mouseleave",
        handler: useEventCallback(() => void setOpen(false))
      },
      isHTMLElement(anchor) &&
        ["open-on-hover", "follow-mouse"].includes(behavior)
    );

    useEventListener(
      {
        target: isHTMLElement(anchor) ? anchor : null,
        eventType: "mousemove",
        handler: useEventCallback<MouseEvent>(event => {
          setCoordinates({ x: event.clientX, y: event.clientY });
          popperActions.current?.recompute();
        })
      },
      isHTMLElement(anchor) && behavior === "follow-mouse"
    );

    useEventListener(
      {
        target: document,
        eventType: "click",
        handler: outsideClickHandler,
        options: { capture: true }
      },
      open && !!onOutsideClick
    );

    useEventListener(
      {
        target: document,
        eventType: "keyup",
        handler: useEventCallback<KeyboardEvent>(event => {
          if (event.key === SystemKeys.ESCAPE) setOpen(false);
        })
      },
      open && behavior === "open-on-click"
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
      anchorElement={
        behavior === "follow-mouse" ? createVirtualElement() : anchorElement
      }
    >
      {children}
    </Popper>
  );
};

const Tooltip = componentWithForwardedRef(TooltipBase);

export default Tooltip;
