import useIsServerHandoffComplete from "@utilityjs/use-is-server-handoff-complete";

const getValue = <T>(valueOrFn: T | (() => T)) => {
  if (typeof valueOrFn === "function") return (valueOrFn as () => T)();

  return valueOrFn;
};

const useIsomorphicValue = <T>(
  clientValue: T | (() => T),
  serverValue: T | (() => T),
) => {
  const isServerHandoffComplete = useIsServerHandoffComplete();

  if (isServerHandoffComplete) return getValue(clientValue);

  return getValue(serverValue);
};

export default useIsomorphicValue;
