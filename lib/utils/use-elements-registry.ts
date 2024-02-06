import * as React from "react";

type Registry<Key extends string> = Map<Key, string>;

export type ElementsRegistry<Key extends string> = {
  registerElement: (key: Key, id: string) => void;
  unregisterElement: (key: Key) => void;
  getElementId: (key: Key) => string | undefined;
  getRegistry: () => Registry<Key>;
};

const useElementsRegistry = <
  Key extends string = string,
>(): ElementsRegistry<Key> => {
  const registryRef = React.useRef(new Map() as Registry<Key>);

  const getRegistry = React.useCallback(() => registryRef.current, []);

  return React.useMemo(() => {
    type T = ElementsRegistry<Key>;

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
  }, [getRegistry]);
};

export default useElementsRegistry;
