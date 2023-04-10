import * as React from "react";
import Portal from "../Portal";
import type { MergeElementProps } from "../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useDirection,
  useForkedRefs,
  useIsomorphicLayoutEffect,
  useRegisterNodeRef,
} from "../utils";
import {
  computePosition,
  type Alignment,
  type AutoPlacementMiddleware,
  type ComputationConfig,
  type ComputationMiddleware,
  type ComputationMiddlewareOrder,
  type Coordinates,
  type OffsetMiddleware,
  type Placement,
  type Side,
  type Strategy,
  type VirtualElement,
} from "./helpers";
import * as Slots from "./slots";

interface RootOwnProps {
  /**
   * The className applied to the component.
   */
  className?:
    | string
    | ((ctx: { placement: Placement; openState: boolean }) => string);
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: { placement: Placement; openState: boolean }) => React.ReactNode);
  /**
   * If `true`, the popper will be open.
   */
  open: boolean;
  /**
   * The popper positioning side.
   *
   * @default "top"
   */
  side?: Side;
  /**
   * The popper positioning alignment.
   *
   * @default "middle"
   */
  alignment?: Alignment | "middle";
  /**
   * By enabling this option, popper chooses the placement automatically
   * (the one with the most space available)
   * and ignores the `side` property value but will consider the `alignment` value.
   *
   * @default false
   */
  autoPlacement?: AutoPlacementMiddleware;
  /**
   * The type of CSS positioning strategy to use.
   * You will want to use `fixed` if your anchor element is inside a fixed container
   *
   * @default "absolute"
   */
  positioningStrategy?: Strategy;
  /**
   * If a number is provided, it will represent the `mainAxis` offset.
   *
   * The `mainAxis` indicates x-axis
   * when the `placement` is equal to any combination of `top` or `bottom`.
   * In other cases it indicates the y-axis.
   *
   * Accordingly, the `crossAxis` works opposite to the `mainAxis`.
   *
   * @default 8
   */
  offset?: OffsetMiddleware;
  /**
   * A callback that runs as an in-between "middle" step of
   * the placement computation and eventual return.
   *
   * It should return an object containing either new coordinates or a new placement.\
   * (**Note**: You can't return both of them!)
   *
   * You can control the execution order of this callback via `computationMiddlewareOrder`
   * property.
   */
  computationMiddleware?: ComputationMiddleware;
  /**
   * Controls the execution order of `computationMiddleware`.
   *
   * @default "afterAutoPlacement"
   */
  computationMiddlewareOrder?: ComputationMiddlewareOrder;
  /**
   * The actions you can perform on the popper instance.
   */
  actions?: React.RefObject<{
    /**
     * Re-runs the positioning computation process.
     */
    recompute: () => void;
  }>;
  /**
   * Works as an anchor for the popper.\
   * This enables things like positioning context menus or following the cursor.
   */
  anchorElement:
    | React.RefObject<HTMLElement>
    | HTMLElement
    | VirtualElement
    | string;
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   * @default false
   */
  keepMounted?: boolean;
}

export type RootProps = Omit<
  MergeElementProps<"div", RootOwnProps>,
  | "defaultChecked"
  | "defaultValue"
  | "autoSave"
  | "autoCapitalize"
  | "autoCorrect"
>;

const translate = ({ x, y }: Coordinates) => {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  // Rounding coordinates by DPR
  const { x: _x, y: _y } = (() => ({
    x: Math.round(Math.round(x * dpr) / dpr),
    y: Math.round(Math.round(y * dpr) / dpr),
  }))();

  const transformValue = `translate(${_x}px, ${_y}px)`;

  return {
    transform: transformValue,
    WebkitTransform: transformValue,
    MozTransform: transformValue,
    msTransform: transformValue,
  };
};

const getAnchor = (anchorElement: RootProps["anchorElement"]) =>
  typeof anchorElement === "string"
    ? typeof document !== "undefined"
      ? document.querySelector<HTMLElement>(anchorElement)
      : null
    : "current" in anchorElement
    ? anchorElement.current
    : anchorElement;

const PopperBase = (props: RootProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    open,
    actions,
    style,
    id: idProp,
    className: classNameProp,
    children: childrenProp,
    computationMiddleware,
    anchorElement,
    offset = 8,
    side = "top",
    keepMounted = false,
    autoPlacement = false,
    alignment = "middle",
    positioningStrategy: strategy = "absolute",
    computationMiddlewareOrder = "afterAutoPlacement",
    ...otherProps
  } = props;

  if (!anchorElement) {
    throw new Error(
      [
        "[StylelessUI][Popper]: Invalid `anchorElement` property.",
        "The `anchorElement` property must be either a `query selector (string)`, " +
          "`HTMLElement`, `RefObject<HTMLElement>`, or in shape of " +
          "`{ getBoundingClientRect(): ClientRect }`",
      ].join("\n"),
    );
  }

  const isRtl = useDirection() === "rtl";
  const id = useDeterministicId(idProp, "styleless-ui__popper");

  const popperRef = React.useRef<HTMLDivElement>(null);
  const handlePopperRef = useForkedRefs(ref, popperRef);

  const [coordinates, setCoordinates] = React.useState<Coordinates>({
    x: 0,
    y: 0,
  });

  const { current: initialPlacement } = React.useRef<Placement>(
    alignment === "middle" ? side : `${side}-${alignment}`,
  );

  const [placement, setPlacement] = React.useState(initialPlacement);

  const config: ComputationConfig = {
    computationMiddleware,
    computationMiddlewareOrder,
    placement: initialPlacement,
    autoPlacement,
    offset,
    strategy,
    isRtl,
  };

  const updatePosition = () => {
    const anchor = getAnchor(anchorElement);

    if (anchor && popperRef.current) {
      const position = computePosition(anchor, popperRef.current, config);

      setPlacement(position.placement);
      setCoordinates({ x: position.x, y: position.y });

      return true;
    }

    return false;
  };

  React.useImperativeHandle(actions, () => ({
    recompute: (): void => void updatePosition(),
  }));

  useIsomorphicLayoutEffect(() => {
    const anchor = getAnchor(anchorElement);

    if (!anchor) return;
    if (id && anchor instanceof HTMLElement)
      anchor.setAttribute("aria-describedby", id);
  });

  const renderCtx = { placement, openState: open };

  const children =
    typeof childrenProp === "function" ? childrenProp(renderCtx) : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const registerRef = useRegisterNodeRef(node => {
    handlePopperRef(node as unknown as HTMLDivElement);

    if (!node) return;

    updatePosition();
  });

  return keepMounted || (!keepMounted && open) ? (
    <Portal>
      <div
        data-slot="portal"
        role="presentation"
        tabIndex={-1}
        aria-hidden={!open}
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <div
          {...otherProps}
          tabIndex={-1}
          data-slot={Slots.Root}
          id={id}
          className={className}
          ref={registerRef}
          style={{
            ...(style ?? {}),
            ...translate(coordinates),
            position: strategy,
            left: 0,
            top: 0,
          }}
        >
          {children}
        </div>
      </div>
    </Portal>
  ) : null;
};

const Popper = componentWithForwardedRef(PopperBase);

export default Popper;
