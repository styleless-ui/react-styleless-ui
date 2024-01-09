export const makeRegisterItem =
  (items: React.RefObject<HTMLDivElement>[]) =>
  (itemRef: React.RefObject<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const itemAlreadyExists = items.some(i => i.current === itemRef.current);

    if (itemAlreadyExists) return;

    items.push(itemRef);
  };
