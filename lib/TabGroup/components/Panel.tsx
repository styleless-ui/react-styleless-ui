import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import { TabGroupContext } from "../context";
import { PanelRoot as PanelRootSlot, Root as RootSlot } from "../slots";

type OwnProps = {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
  /**
   * A unique value that associates the panel(content) with a tab.
   */
  value: string;
  /**
   * Used to keep mounting when more control is needed.\
   * Useful when controlling animation with React animation libraries.
   *
   * @default false
   */
  keepMounted?: boolean;
};

export type Props = Omit<
  MergeElementProps<"div", OwnProps>,
  "defaultChecked" | "defaultValue"
>;

const PanelBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    children,
    id: idProp,
    className,
    value,
    keepMounted = false,
    ...otherProps
  } = props;

  const ctx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__panel");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  if (!ctx) {
    logger(
      "You have to use this component as a descendant of <TabGroup.Root>.",
      {
        scope: "TabGroup.Panel",
        type: "error",
      },
    );

    return null;
  }

  const active = ctx.activeTab === value;

  if (!keepMounted && !active) return null;

  const dataAttrs = {
    "data-slot": PanelRootSlot,
    "data-active": active ? "" : undefined,
    "data-entity": value,
  };

  const refCallback = (node: HTMLDivElement | null) => {
    handleRef(node);

    if (!node) return;

    const root = node.closest<HTMLElement>(`[data-slot="${RootSlot}"]`);

    if (!root) return;

    const tabs = Array.from(root.querySelectorAll<HTMLElement>("[role='tab']"));

    const associatedTab = tabs.find(
      tab => tab.getAttribute("data-entity") === value,
    );

    if (!associatedTab) {
      logger(
        `Couldn't find an associated <TabGroup.Tab> with \`value={${value}}\`.`,
        { scope: "TabGroup.Panel", type: "error" },
      );

      return;
    }

    node.setAttribute("aria-labelledby", associatedTab.id);
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      role="tabpanel"
      {...dataAttrs}
    >
      {children}
    </div>
  );
};

const Panel = componentWithForwardedRef(PanelBase, "TabGroup.Panel");

export default Panel;
