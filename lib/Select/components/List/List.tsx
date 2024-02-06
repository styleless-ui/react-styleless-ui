import * as React from "react";
import { logger } from "../../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../../types";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
} from "../../../utils";
import { SelectContext } from "../../context";
import { ListRoot as ListRootSlot } from "../../slots";
import Group from "../Group";
import Option from "../Option";
import { calcSidePlacement } from "./utils";

export type ClassNameProps = {
  open: boolean;
};

type OwnProps = {
  className?: PropWithRenderContext<string, ClassNameProps>;
  children?: React.ReactNode;
};

export type Props = Omit<MergeElementProps<"div", OwnProps>, "">;

const ListBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    style: styleProp,
    id: idProp,
    className: classNameProp,
    children: childrenProp,
    ...otherProps
  } = props;

  const ctx = React.useContext(SelectContext);

  const id = useDeterministicId(idProp, "styleless-ui__select__list");

  const rootRef = React.useRef<HTMLDivElement>(null);

  const [side, setSide] = React.useState<"top" | "bottom">("bottom");

  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const open = ctx?.isListOpen ?? false;

    if (open) {
      previouslyFocusedElement.current =
        document.activeElement as HTMLElement | null;
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [ctx?.isListOpen]);

  React.useEffect(() => {
    ctx?.elementsRegistry.registerElement("list", id);

    return () => {
      ctx?.elementsRegistry.unregisterElement("list");
    };
  }, [ctx?.elementsRegistry, id]);

  if (!ctx) {
    logger("You have to use this component as a descendant of <Select.Root>.", {
      scope: "Select.List",
      type: "error",
    });

    return null;
  }

  if (!ctx.keepMounted && !ctx.isListOpen) return null;

  const makeStyle = () => {
    const style: React.CSSProperties = {
      ...(styleProp ?? {}),
      position: "absolute",
    };

    if (side === "bottom") style.top = "100%";
    else style.bottom = "100%";

    return style;
  };

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(rootRef, node);
    setRef(ref, node);

    if (!node) return;

    const triggerId = ctx.elementsRegistry.getElementId("trigger");
    const triggerNode = document.getElementById(triggerId ?? "");

    if (triggerNode) {
      setSide(calcSidePlacement(triggerNode, node));
    } else {
      logger(
        "You should have `<Select.Trigger>` in your `<Select.Root>` in order to " +
          "use `<Select.List>.`",
        { scope: "Select", type: "error" },
      );
    }
  };

  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child)) {
      logger(
        "The `<Select.List>` component doesn't accept `Fragment` as children.",
        { scope: "Select.List", type: "error" },
      );

      return null;
    }

    if (
      (child as React.ReactElement).type !== Option &&
      (child as React.ReactElement).type !== Group
    ) {
      logger(
        "The `<Select.List>` component only accepts " +
          "`<Select.Option>` and `<Select.Group>` as children.",
        { scope: "Select.List", type: "error" },
      );

      return null;
    }

    return child as React.ReactElement;
  });

  const renderCtx: ClassNameProps = {
    open: ctx?.isListOpen ?? false,
  };

  const className =
    typeof classNameProp === "function"
      ? classNameProp(renderCtx)
      : classNameProp;

  const dataAttrs = {
    "data-slot": ListRootSlot,
    "data-open": ctx?.isListOpen,
  };

  return (
    <div
      {...otherProps}
      // @ts-expect-error React hasn't added `inert` yet
      inert={ctx.disabled ? "" : undefined}
      style={makeStyle()}
      id={id}
      ref={refCallback}
      tabIndex={-1}
      role="listbox"
      className={className}
      {...dataAttrs}
    >
      {children}
    </div>
  );
};

const List = componentWithForwardedRef(ListBase, "Select.List");

export default List;
