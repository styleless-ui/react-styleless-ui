import useIsServerHandoffComplete from "@utilityjs/use-is-server-handoff-complete";

const useIsomorphicValue = <T>(
  clientValue: T | (() => T),
  serverValue: T | (() => T),
) => {
  const isServerHandoffComplete = useIsServerHandoffComplete();

  if (isServerHandoffComplete) {
    if (typeof clientValue === "function") return (clientValue as () => T)();

    return clientValue;
  }

  if (typeof serverValue === "function") return (serverValue as () => T)();

  return serverValue;
};

export default useIsomorphicValue;
