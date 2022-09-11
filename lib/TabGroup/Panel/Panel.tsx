import * as React from "react";
import { type MergeElementProps } from "../../typings.d";
import {
  componentWithForwardedRef,
  useDeterministicId,
  useForkedRefs
} from "../../utils";
import TabGroupContext from "../context";

interface TabPanelBaseProps {
  /**
   * The content of the tabpanel.
   */
  children?: React.ReactNode;
  /**
   * The className applied to the component.
   */
  className?: string;
}

export type TabPanelProps = Omit<
  MergeElementProps<"div", TabPanelBaseProps>,
  "defaultChecked" | "defaultValue"
>;

const TabPanelBase = (props: TabPanelProps, ref: React.Ref<HTMLDivElement>) => {
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

  return visible ? (
    <div
      {...otherProps}
      id={id}
      ref={node => {
        handleRef(node);
        if (!node) return;

        const tabId = tabGroupCtx?.tabs[index]?.current?.id;
        tabId && node.setAttribute("aria-labelledby", tabId);
      }}
      className={className}
      role="tabpanel"
      data-slot="tabPanelRoot"
    >
      {children}
    </div>
  ) : null;
};

const TabPanel = componentWithForwardedRef<
  HTMLDivElement,
  TabPanelProps,
  typeof TabPanelBase
>(TabPanelBase);

export default TabPanel;
