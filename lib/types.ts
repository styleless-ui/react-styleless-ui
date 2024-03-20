/* eslint-disable @typescript-eslint/ban-types */

import type React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type KeyofBase = keyof any;

export type EmptyObjectNotation = {};

export type AnyObject = Record<KeyofBase, any>;
export type UnknownObject = Record<KeyofBase, unknown>;
export type EmptyObject = Record<KeyofBase, never>;

export type AnyFunction = (...args: any) => any;

type GenerateStringUnion<T> = Extract<
  {
    [Key in keyof T]: true extends T[Key] ? Key : never;
  }[keyof T],
  string
>;

/** Removes types from T that are assignable to U */
export type Diff<T, U> = T extends U ? never : T;

/** Removes types from T that are not assignable to U */
export type Filter<T, U> = T extends U ? T : never;

/** Constructs a type by including null and undefined to Type. */
export type Nullable<T> = { [P in keyof T]: T[P] | null | undefined };

export type NotUndefined<T> = T extends undefined ? never : T;

/**
 * Like `T & U`, but using the value types from `U` where their properties overlap.
 */
export type Overwrite<T, U> = Omit<T, keyof U> & U;

/**
 * Generate a set of string literal types with the given default record `T` and
 * override record `U`.
 *
 * If the property value was `true`, the property key will be added to the
 * string union.
 */
export type OverridableStringUnion<
  T,
  U = EmptyObjectNotation,
> = GenerateStringUnion<Overwrite<T, U>>;

export type MergeElementProps<
  E extends React.ElementType,
  P = EmptyObjectNotation,
> = Overwrite<React.ComponentPropsWithRef<E>, P>;

/**
 * Helps create a type where at least one of the properties of an interface is required to exist.
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Diff<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Diff<Keys, K>>>;
  }[Keys];

/**
 * Helps create a type where only one of the properties of an interface is required to exist.
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Diff<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Diff<Keys, K>, undefined>>;
  }[Keys];

export type Classes<StringUnion extends string> = Partial<
  Record<StringUnion, string>
>;

export type PropWithRenderContext<Prop, RenderContext> =
  | Prop
  | ((ctx: RenderContext) => Prop);

export type ClassesWithRenderContext<
  StringUnion extends string,
  RenderContext extends AnyObject,
> = PropWithRenderContext<Classes<StringUnion>, RenderContext>;

export type BoundingClientRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type VirtualElement = { getBoundingClientRect(): BoundingClientRect };

export type ComponentProps<E> = E extends (props: infer P) => JSX.Element | null
  ? P
  : E extends React.ElementType
  ? React.ComponentProps<E>
  : EmptyObjectNotation;

export type EnsureCommonProps<E, P> = Overwrite<
  P,
  ("className" extends keyof P
    ? Pick<P, "className">
    : Pick<ComponentProps<E>, "className" & keyof ComponentProps<E>>) &
    ("children" extends keyof P
      ? Pick<P, "children">
      : Pick<ComponentProps<E>, "children" & keyof ComponentProps<E>>)
>;

export type PolymorphicProps<
  E extends React.ElementType,
  P = EmptyObjectNotation,
> = MergeElementProps<
  E,
  P & {
    /**
     * The component used for the root node.
     * Either a string to use a HTML element or a component.
     */
    as?: E;
  }
>;

export interface GenericComponent<
  RootNode extends React.ElementType,
  P = EmptyObjectNotation,
> {
  <E extends React.ElementType>(
    props: PolymorphicProps<E, P>,
  ): JSX.Element | null;
  (props: MergeElementProps<RootNode, P>): JSX.Element | null;
}

export interface PolymorphicComponent<
  TDefaultElementType extends React.ElementType,
  P = EmptyObjectNotation,
> {
  <E extends React.ElementType = TDefaultElementType>(
    props: PolymorphicProps<E, EnsureCommonProps<E, P>>,
  ): JSX.Element | null;
}
