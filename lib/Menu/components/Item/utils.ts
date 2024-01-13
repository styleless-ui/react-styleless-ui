import type * as React from "react";

type RegistryRef = React.MutableRefObject<
  | {
      ref: React.RefObject<HTMLDivElement>;
      id: string | undefined;
    }
  | undefined
>;

export const makeRegisterSubMenu =
  (storeRef: RegistryRef) =>
  (subMenuRef: React.RefObject<HTMLDivElement>, id: string | undefined) =>
    void (storeRef.current = { ref: subMenuRef, id });
