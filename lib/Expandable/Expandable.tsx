import * as React from "react";
import { type MergeElementProps } from "../typings.d";
import {
  componentWithForwardedRef,
  useControlledProp,
  useIsMounted,
  useOnChange
} from "../utils";
import ExpandableContext from "./context";

interface ExpandableBaseProps {
  /**
   * The content of the component.
   */
  children?:
    | React.ReactNode
    | ((ctx: { expanded: boolean }) => React.ReactNode);
  /**
   * The className applied to the component.
   */
  className?: string | ((ctx: { expanded: boolean }) => string);
  /**
   * If `true`, the panel will be opened.
   */
  expanded?: boolean;
  /**
   * The default state of the `expanded`. Use when `expanded` is not controlled.
   */
  defaultExpanded?: boolean;
  /**
   * The Callback fires when the panel has expanded.
   */
  onExpand?: () => void;
  /**
   * The Callback fires when the panel has collapsed.
   */
  onCollapse?: () => void;
}

export type ExpandableProps = Omit<
  MergeElementProps<"div", ExpandableBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const ExpandableBase = (
  props: ExpandableProps,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    onCollapse,
    onExpand,
    expanded,
    defaultExpanded,
    children: childrenProp,
    className: classNameProp,
    ...otherProps
  } = props;

  const isMounted = useIsMounted();

  const initialRender = React.useRef(true);

  const [isExpanded, setIsExpanded] = useControlledProp(
    expanded,
    defaultExpanded,
    false
  );

  useOnChange(isExpanded, expandedState => {
    if (!isMounted()) return;

    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (expandedState) onExpand?.();
    else onCollapse?.();
  });

  const className =
    typeof classNameProp === "function"
      ? classNameProp({ expanded: isExpanded })
      : classNameProp;

  const children =
    typeof childrenProp === "function"
      ? childrenProp({ expanded: isExpanded })
      : childrenProp;

  return (
    <div
      {...otherProps}
      ref={ref}
      data-slot="expandableRoot"
      className={className}
    >
      <ExpandableContext.Provider value={{ isExpanded, setIsExpanded }}>
        {children}
      </ExpandableContext.Provider>
    </div>
  );
};

const Expandable = componentWithForwardedRef<
  HTMLDivElement,
  ExpandableProps,
  typeof ExpandableBase
>(ExpandableBase);

export default Expandable;
