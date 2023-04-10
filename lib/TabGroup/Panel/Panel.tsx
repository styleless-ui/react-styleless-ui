import * as React from "react";
import type { MergeElementProps } from "../../typings";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs,
} from "../../utils";
import TabGroupContext from "../context";
import { PanelRoot as PanelRootSlot } from "../slots";

interface PanelOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type PanelProps = Omit<
  MergeElementProps<"div", PanelOwnProps>,
  "defaultChecked" | "defaultValue"
>;

const TabPanelBase = (props: PanelProps, ref: React.Ref<HTMLDivElement>) => {
  const { children, id: idProp, className, ...otherProps } = props;

  const tabGroupCtx = React.useContext(TabGroupContext);

  const id = useDeterministicId(idProp, "styleless-ui__panel");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkedRefs(ref, rootRef);

  tabGroupCtx?.register(rootRef);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const index = Number(otherProps["data-index"] as string);

  const visible = tabGroupCtx ? tabGroupCtx.activeTab === index : false;

  const refCallback = (node: HTMLDivElement | null) => {
    handleRef(node);
    if (!node) return;

    const tabId = tabGroupCtx?.tabs[index]?.current?.id;

    tabId && node.setAttribute("aria-labelledby", tabId);
  };

  return visible ? (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      className={className}
      role="tabpanel"
      data-slot={PanelRootSlot}
    >
      {children}
    </div>
  ) : null;
};

const TabPanel = componentWithForwardedRef(TabPanelBase);

export default TabPanel;
