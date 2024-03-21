import * as React from "react";
import { getLabelInfo, logger } from "../../internals";
import type { MergeElementProps, PropWithRenderContext } from "../../types";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
} from "../../utils";
import { SelectContext } from "../context";
import { GroupRoot as GroupRootSlot } from "../slots";

export type RenderProps = {
  /**
   * The `hidden` state of the component.
   * If no descendant option is visible, it's going to be `true`.
   */
  hidden: boolean;
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
   * The label of the component.
   */
  label:
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
  "defaultChecked" | "defaultValue"
>;

const GroupBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    id: idProp,
    label,
    className: classNameProp,
    children: childrenProp,
    ...otherProps
  } = props;

  const id = useDeterministicId(idProp, "styleless-ui__select__group");

  const labelInfo = getLabelInfo(label, "Select.Group", {
    customErrorMessage: [
      "Invalid `label` property.",
      "The `label` property must be in shape of " +
        "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
    ].join("\n"),
  });

  const ctx = React.useContext(SelectContext);

  const [isHidden, setIsHidden] = React.useState(false);

  const refCallback = React.useCallback(
    (node: HTMLDivElement | null) => {
      setRef(ref, node);

      if (!node) return;

      const filtered = ctx?.filteredEntities;

      if (filtered == null) return;

      let hidden = false;

      if (filtered.length === 0) hidden = true;
      else {
        const options = Array.from(
          node.querySelectorAll<HTMLElement>("[role='option']"),
        );

        hidden = options.every(option => {
          const entityName = option.getAttribute("data-entity");

          return !filtered.some(entity => entity === entityName);
        });
      }

      setIsHidden(hidden);
    },
    [ctx?.filteredEntities, ref],
  );

  if (!ctx) {
    logger("You have to use this component as a descendant of <Select.Root>.", {
      scope: "Select.Group",
      type: "error",
    });

    return null;
  }

  const renderProps: RenderProps = {
    hidden: isHidden,
  };

  const classNameProps: ClassNameProps = renderProps;

  const children =
    typeof childrenProp === "function"
      ? childrenProp(renderProps)
      : childrenProp;

  const className =
    typeof classNameProp === "function"
      ? classNameProp(classNameProps)
      : classNameProp;

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      role="group"
      aria-label={labelInfo.srOnlyLabel}
      aria-labelledby={labelInfo.labelledBy}
      aria-hidden={isHidden}
      data-slot={GroupRootSlot}
      data-hidden={isHidden ? "" : undefined}
      className={className}
    >
      {children}
    </div>
  );
};

const Group = componentWithForwardedRef(GroupBase, "Select.Group");

export default Group;
