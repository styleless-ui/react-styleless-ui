import * as React from "react";
import { disableUserSelectCSSProperties, logger } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useEventCallback,
  useForkedRefs,
} from "../../utils";
import { MenuContext } from "../context";
import { RadioItemRoot as RadioItemRootSlot } from "../slots";
import useMenuItem from "../useMenuItem";
import { RadioGroupContext } from "./RadioGroup/context";

export type RenderProps = {
  /**
   * The `active` state of the component.
   * An item is active if it's hovered by a pointer or visually
   * focused by keyboard interactions.
   */
  active: boolean;
  /**
   * The `disabled` state of the component.
   */
  disabled: boolean;
  /**
   * The `selected` state of the component.
   */
  selected: boolean;
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
   * The value of the radio.
   */
  value: string;
  /**
   * If `true`, the radio will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The Callback is fired when the item is selected.
   */
  onSelect?: (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => void;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const RadioItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children: childrenProp,
    className: classNameProp,
    style: styleProp,
    value,
    onSelect,
    onClick,
    onMouseEnter,
    onMouseLeave,
    disabled = false,
    ...otherProps
  } = props;

  const id = useDeterministicId(undefined, "styleless-ui__menu-item");

  const menuCtx = React.useContext(MenuContext);
  const radioGroupCtx = React.useContext(RadioGroupContext);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRootRef = useForkedRefs(ref, rootRef);

  const isActive =
    menuCtx && rootRef.current
      ? menuCtx.activeElement === rootRef.current
      : false;

  const menuItem = useMenuItem({
    disabled,
    isActive,
    onClick,
    onMouseEnter: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      menuCtx?.setActiveElement(rootRef.current);
      onMouseEnter?.(event);
    }),
    onMouseLeave: useEventCallback<React.MouseEvent<HTMLDivElement>>(event => {
      menuCtx?.setActiveElement(null);
      onMouseLeave?.(event);
    }),
    changeEmitter: useEventCallback<
      React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
    >(event => {
      onSelect?.(event);
      radioGroupCtx?.onValueChange(value);
    }),
  });

  if (!radioGroupCtx) {
    logger("You can't use this component outside of the <Menu.RadioGroup>.", {
      scope: "Menu.RadioItem",
      type: "error",
    });

    return null;
  }

  if (!menuCtx) {
    logger("You have to use this component as a descendant of <Menu.Root>.", {
      scope: "Menu.RadioItem",
      type: "error",
    });

    return null;
  }

  const isSelected = radioGroupCtx.value === value;

  const renderProps: RenderProps = {
    disabled,
    active: isActive,
    selected: isSelected,
  };

  const classNameProps: ClassNameProps = renderProps;

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    ...disableUserSelectCSSProperties,
  };

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const refCallback = (node: HTMLDivElement | null) => {
    handleRootRef(node);

    if (!node) return;
    menuCtx.registerItem(rootRef);
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      style={style}
      className={className}
      tabIndex={-1}
      onClick={menuItem.handleClick}
      onMouseEnter={menuItem.handleMouseEnter}
      onMouseLeave={menuItem.handleMouseLeave}
      role="menuitemradio"
      aria-checked={isSelected}
      aria-disabled={disabled}
      data-slot={RadioItemRootSlot}
      data-active={isActive ? "" : undefined}
    >
      {children}
    </div>
  );
};

const RadioItem = componentWithForwardedRef(RadioItemBase, "Menu.RadioItem");

export default RadioItem;
