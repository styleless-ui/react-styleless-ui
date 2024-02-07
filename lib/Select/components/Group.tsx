import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type { Classes, MergeElementProps } from "../../types";
import { componentWithForwardedRef, useDeterministicId } from "../../utils";
import { SelectContext } from "../context";
import {
  GroupLabel as GroupLabelSlot,
  GroupRoot as GroupRootSlot,
} from "../slots";
import Option, { type Props as OptionProps } from "./Option";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Map of sub-components and their correlated classNames.
   */
  classes?: Classes<"root" | "label">;
  /**
   * The label of the component.
   */
  label:
    | string
    | {
        /**
         * The label to use as `aria-label` property.
         */
        screenReaderLabel: string;
      }
    | {
        /**
         * Identifies the element (or elements) that labels the component.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
         */
        labelledBy: string;
      };
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "className" | "defaultChecked" | "defaultValue"
>;

const GroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    style: styleProp,
    label,
    classes,
    children: childrenProp,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__select__group");
  const visibleLabelId = id ? `${id}__label` : undefined;

  const labelProps = getLabelInfo(label, "Select.Group");

  const ctx = React.useContext(SelectContext);

  if (!ctx) {
    logger("You have to use this component as a descendant of <Select.Root>.", {
      scope: "Select.Group",
      type: "error",
    });

    return null;
  }

  const children = React.Children.map(childrenProp, child => {
    if (!React.isValidElement(child)) {
      logger(
        "The `<Select.Group>` component doesn't accept `Fragment` as children.",
        { scope: "Select.Group", type: "error" },
      );

      return null;
    }

    if ((child as React.ReactElement).type !== Option) {
      logger(
        "The `<Select.Group>` component only accepts `<Select.Option>` as children.",
        { scope: "Select.Group", type: "error" },
      );

      return null;
    }

    return child as React.ReactElement<OptionProps>;
  });

  if (React.Children.count(children) === 0) return null;

  let isHidden = false;
  const filteredEntities = ctx.filteredEntities;

  if (filteredEntities != null) {
    if (filteredEntities.length === 0) isHidden = true;
    else {
      isHidden = React.Children.toArray(children)
        .filter(Boolean)
        .every(child => {
          const entityName = (child as React.ReactElement<OptionProps>).props
            .value;

          return !filteredEntities.some(entity => entity === entityName);
        });
    }
  }

  const renderLabel = () => {
    if (!labelProps.visibleLabel) return null;

    return (
      <span
        id={visibleLabelId}
        data-slot={GroupLabelSlot}
        className={classes?.label}
      >
        {labelProps.visibleLabel}
      </span>
    );
  };

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    display: isHidden ? "none" : undefined,
  };

  return (
    <div
      {...otherProps}
      id={id}
      style={style}
      ref={ref}
      role="group"
      aria-label={labelProps.srOnlyLabel}
      aria-hidden={isHidden}
      aria-labelledby={
        labelProps.visibleLabel ? visibleLabelId : labelProps.labelledBy
      }
      data-slot={GroupRootSlot}
      data-hidden={isHidden ? "" : undefined}
      className={classes?.root}
    >
      {renderLabel()}
      {children}
    </div>
  );
};

const Group = componentWithForwardedRef(GroupBase, "Select.Group");

export default Group;
