import * as React from "react";
import { logger } from "../../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../../types";
import {
  componentWithForwardedRef,
  isFragment,
  useDeterministicId,
} from "../../../utils";
import { LevelContext, SizeContext, TreeViewContext } from "../../contexts";
import {
  ItemRoot as ItemRootSlot,
  ItemTrigger as ItemTriggerSlot,
} from "../../slots";
import type { Props as SubTreeProps } from "../SubTree";
import { TreeViewItemContext, type TreeViewItemContextValue } from "./context";

export type RenderProps = {
  /**
   * The `active` state of the component.
   * An item is active if it's hovered by a pointer or visually
   * focused by keyboard interactions.
   */
  active: boolean;
  /**
   * The `selected` state of the component when
   * <TreeView.Root> is specified as selectable.
   */
  selected: boolean;
  /**
   * The `expanded` state of the component.
   */
  expanded: boolean;
  /**
   * Determines whether it is expandable or not.
   */
  expandable: boolean;
};

export type ClassNameProps = RenderProps;

type OwnProps = {
  /**
   * The className applied to the component.
   */
  className?: PropWithRenderContext<string, ClassNameProps>;
  /**
   * The content used as trigger point of the component.
   * Actions and event listeners live here.
   */
  triggerContent: PropWithRenderContext<React.ReactElement, RenderProps>;
  /**
   * The sub-tree of the component.
   * If provided, this item will be expandable.
   */
  subTree?: React.ReactElement<SubTreeProps>;
  /**
   * The value of item when selected or expanded.
   * Works as an unique identifier for the item.
   */
  value: string;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked" | "children"
>;

const ItemBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    className: classNameProp,
    triggerContent,
    value,
    subTree = null,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__treeview-item");

  const currentLevel = React.useContext(LevelContext) ?? 1;
  const sizeOfSet = React.useContext(SizeContext) ?? 1;
  const ctx = React.useContext(TreeViewContext);

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <TreeView.Root>.",
      {
        scope: "TreeView.Item",
        type: "error",
      },
    );

    return null;
  }

  const handleClick: React.MouseEventHandler = () => {
    ctx.handleDescendantSelect(value);

    if (!subTree) return;

    ctx.handleDescendantExpandToggle(value);
  };

  const handleMouseEnter: React.MouseEventHandler = event => {
    const item = event.currentTarget.closest<HTMLElement>("[role='treeitem']");

    if (!item) return;

    ctx.setActiveElement(item);
  };

  const handleMouseLeave: React.MouseEventHandler = () => {
    ctx.setActiveElement(null);
  };

  const isParentNode = Boolean(subTree);

  const isSelected = ctx.isDescendantSelected(value);
  const isExpanded = ctx.isDescendantExpanded(value);

  const isActive = ctx.activeElement
    ? ctx.activeElement.getAttribute("data-entityname") === value
    : false;

  const expandedState = isParentNode ? isExpanded : undefined;
  const selectedState = ctx.isSelectable ? isSelected : undefined;

  const renderProps: RenderProps = {
    active: isActive,
    expandable: isParentNode,
    selected: selectedState ?? false,
    expanded: expandedState ?? false,
  };

  const classNameProps: ClassNameProps = renderProps;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  const renderTrigger = () => {
    const trigger =
      typeof triggerContent === "function"
        ? triggerContent(renderProps)
        : triggerContent;

    const triggerArr = React.Children.toArray(trigger);

    return triggerArr.map((child, idx) => {
      if (!React.isValidElement(child)) {
        logger(
          "The <TreeView.Item> component doesn't accept " +
            "invalid element as it's `triggerContent`. " +
            "Try to render a valid React Element.",
          { scope: "TreeView.Item", type: "error" },
        );

        return null;
      }

      const childProps = ((child as React.ReactElement).props ??
        {}) as React.ComponentPropsWithoutRef<"div">;

      const augmentedProps: React.ComponentPropsWithoutRef<"div"> = {
        onClick: event => {
          handleClick(event);
          childProps.onClick?.(event);
        },
        onMouseEnter: event => {
          handleMouseEnter(event);
          childProps.onMouseEnter?.(event);
        },
        onMouseLeave: event => {
          handleMouseLeave(event);
          childProps.onMouseLeave?.(event);
        },
      };

      const newProps = {
        ...childProps,
        ...augmentedProps,
        "data-slot": ItemTriggerSlot,
      };

      if (isFragment(child)) {
        logger(
          "Since you are passing a Fragment as `triggerContent`, " +
            "we'll replace it with a <div> element. " +
            "If you wish to style it, either render an element instead of Fragment " +
            `or select it with it's slot name(\`[data-slot="${ItemTriggerSlot}"]\`).`,
          { scope: "TreeView.Item", type: "default" },
        );

        return (
          <div
            key={
              String(childProps.key) + String(child.key) + String(idx) + value
            }
            {...newProps}
          />
        );
      }

      return React.cloneElement(child as React.ReactElement, newProps);
    });
  };

  const itemContextValue: TreeViewItemContextValue = { isExpanded, value };

  return (
    <div
      {...otherProps}
      id={id}
      ref={ref}
      role="treeitem"
      tabIndex={-1}
      aria-expanded={expandedState}
      aria-selected={selectedState}
      aria-level={currentLevel}
      aria-setsize={sizeOfSet}
      data-active={isActive ? "" : undefined}
      data-expandable={String(isParentNode)}
      data-expanded={expandedState ? "" : undefined}
      data-selected={selectedState ? "" : undefined}
      data-slot={ItemRootSlot}
      data-entityname={value}
      className={className}
    >
      <TreeViewItemContext.Provider value={itemContextValue}>
        {renderTrigger()}
        {subTree}
      </TreeViewItemContext.Provider>
    </div>
  );
};

const Item = componentWithForwardedRef(ItemBase, "TreeView.Item");

export default Item;
