/* eslint-disable no-console */
import type { AnyFunction } from "../typings";
import prefixMessage from "./prefix-message";

type Type = "print-error" | "print-warn" | "default";

type Options = {
  scope: string;
  type: Type;
};

const log = (message: string, options?: Partial<Options>) => {
  const { scope, type = "default" } = options ?? {};

  const prefixedMessage = prefixMessage(message, scope);

  const map = {
    "print-error": console.error,
    "print-warn": console.warn,
    default: console.log,
  } satisfies Record<Exclude<Type, "throw-error">, AnyFunction>;

  const logger = map[type];

  logger(prefixedMessage);
};

export default log;
