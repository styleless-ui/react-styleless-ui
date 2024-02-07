import * as React from "react";
import { disableUserSelectCSSProperties, logger } from "../../internals";
import { type MergeElementProps } from "../../types";
import { componentWithForwardedRef } from "../../utils";
import { SelectContext } from "../context";
import { EmptyStatementRoot as EmptyStatementRootSlot } from "../slots";

type OwnProps = {
  /**
   * The className applied to the component.
   */
  className?: string;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultValue" | "defaultChecked"
>;

const EmptyStatementBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { className, children, style: styleProp, ...otherProps } = props;

  const ctx = React.useContext(SelectContext);

  if (!ctx) {
    logger("You have to use this component as a descendant of <Select.Root>.", {
      scope: "Select.EmptyStatement",
      type: "error",
    });

    return null;
  }

  if (ctx.filteredEntities == null || ctx.filteredEntities.length !== 0) {
    return null;
  }

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    ...disableUserSelectCSSProperties,
  };

  return (
    <div
      {...otherProps}
      style={style}
      ref={ref}
      className={className}
      data-slot={EmptyStatementRootSlot}
    >
      {children}
    </div>
  );
};

const EmptyStatement = componentWithForwardedRef(
  EmptyStatementBase,
  "Select.EmptyStatement",
);

export default EmptyStatement;
