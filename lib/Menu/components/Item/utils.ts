import type * as React from "react";

type StoreRef = React.MutableRefObject<
  | {
      ref: React.RefObject<HTMLDivElement>;
      id: string | undefined;
    }
  | undefined
>;

export const makeRegisterSubMenu =
  (storeRef: StoreRef) =>
  (subMenuRef: React.RefObject<HTMLDivElement>, id: string | undefined) =>
    void (storeRef.current = { ref: subMenuRef, id });
