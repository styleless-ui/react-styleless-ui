import * as React from "react";
import { logger } from "../../internals";
import type { MergeElementProps } from "../../types";
import {
  componentWithForwardedRef,
  setRef,
  useDeterministicId,
  useEventCallback,
} from "../../utils";
import { SelectContext } from "../context";
import {
  ControllerRoot as ControllerRootSlot,
  TriggerRoot as TriggerRootSlot,
} from "../slots";

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

const TriggerBase = (props: Props, ref: React.Ref<HTMLDivElement>) => {
  const { id: idProp, className, children, onClick, ...otherProps } = props;

  const id = useDeterministicId(idProp, "styleless-ui__select__trigger");

  const ctx = React.useContext(SelectContext);

  React.useEffect(() => {
    ctx?.elementsRegistry.registerElement("trigger", id);

    return () => {
      ctx?.elementsRegistry.unregisterElement("trigger");
    };
  }, [ctx?.elementsRegistry, id]);

  const getComboboxNode = () => {
    const comboboxId = ctx?.elementsRegistry.getElementId("combobox");

    if (!comboboxId) return null;

    const combobox = document.getElementById(comboboxId);

    return combobox;
  };

  const handleClick = useEventCallback<React.MouseEvent<HTMLDivElement>>(
    event => {
      if (ctx?.disabled) return;

      const combobox = getComboboxNode();

      combobox?.focus();
      combobox?.click();

      onClick?.(event);
    },
  );

  if (!ctx) {
    logger("You have to use this component as a descendant of <Select.Root>.", {
      scope: "Select.Trigger",
      type: "error",
    });

    return null;
  }

  const refCallback = (node: HTMLDivElement | null) => {
    setRef(ref, node);

    if (!node) return;

    node
      .querySelectorAll<HTMLButtonElement>(
        `:is([type='button'], a[href], button):not([data-slot='${ControllerRootSlot}'])`,
      )
      .forEach(el => {
        el.tabIndex = -1;
      });
  };

  return (
    <div
      {...otherProps}
      id={id}
      ref={refCallback}
      tabIndex={-1}
      className={className}
      onClick={handleClick}
      data-slot={TriggerRootSlot}
    >
      {children}
    </div>
  );
};

const Trigger = componentWithForwardedRef(TriggerBase, "Select.Trigger");

export default Trigger;
