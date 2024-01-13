export const makeRegisterItem =
  (registry: React.RefObject<HTMLDivElement>[]) =>
  (itemRef: React.RefObject<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const itemAlreadyExists = registry.some(i => i.current === itemRef.current);

    if (itemAlreadyExists) return;

    registry.push(itemRef);
  };
