import * as React from "react";
import type { PickAsMandatory } from "../types";
import {
  Controller,
  EmptyStatement,
  Option,
  Trigger,
  type OptionProps,
} from "./components";

export const normalizeValues = (value: string | string[] | undefined) => {
  if (value == null) return [];

  if (typeof value === "string") {
    if (value.length === 0) return [];

    return [value];
  }

  return value;
};

export const noValueSelected = (value: string | string[] | undefined) =>
  normalizeValues(value).length === 0;

export const getOptions = (
  childArray: Array<Exclude<React.ReactNode, boolean | null | undefined>>,
): Array<PickAsMandatory<OptionProps, "disabled" | "value" | "valueLabel">> => {
  return childArray.reduce(
    (result, child) => {
      if (!React.isValidElement(child)) return result;

      if (
        child.type === EmptyStatement ||
        child.type === Controller ||
        child.type === Trigger
      ) {
        return result;
      }

      if (child.type === Option) {
        const { disabled, value, valueLabel } = (
          child as React.ReactElement<OptionProps>
        ).props;

        result.push({ disabled: disabled ?? false, value, valueLabel });

        return result;
      }

      if (!("children" in child.props)) return result;

      const options = getOptions(
        React.Children.toArray(
          (child as React.ReactElement<{ children: React.ReactNode }>).props
            .children,
        ),
      );

      return [...result, ...options];
    },
    [] as Array<
      PickAsMandatory<OptionProps, "disabled" | "value" | "valueLabel">
    >,
  );
};

type Registry<Key extends string> = Map<Key, string>;

export type ElementsRegistry<Key extends string> = {
  registerElement: (key: Key, id: string) => void;
  unregisterElement: (key: Key) => void;
  getElementId: (key: Key) => string | undefined;
  getRegistry: () => Registry<Key>;
};

export const useElementsRegistry = <
  Key extends string = string,
>(): ElementsRegistry<Key> => {
  const registryRef = React.useRef(new Map() as Registry<Key>);

  return React.useMemo(() => {
    type T = ElementsRegistry<Key>;

    const getRegistry = () => registryRef.current;

    const registerElement: T["registerElement"] = (key, id) => {
      const registry = getRegistry();

      registry.set(key, id);
    };

    const unregisterElement: T["unregisterElement"] = (key: Key) => {
      const registry = getRegistry();

      registry.delete(key);
    };

    const getElementId: T["getElementId"] = (key: Key) => {
      const registry = getRegistry();

      return registry.get(key);
    };

    return {
      registerElement,
      unregisterElement,
      getElementId,
      getRegistry,
    };
  }, []);
};
