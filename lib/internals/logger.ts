/* eslint-disable no-console */
import type { AnyFunction } from "../typings";
import prefixMessage from "./prefix-message";

type Type = "error" | "warn" | "default";

type Options = {
  scope: string;
  type: Type;
};

const logger = (message: string, options?: Partial<Options>) => {
  const { scope, type = "default" } = options ?? {};

  const prefixedMessage = prefixMessage(message, scope);

  const mapTypeToLoggerFn = {
    error: console.error,
    warn: console.warn,
    default: console.log,
  } satisfies Record<Type, AnyFunction>;

  const loggerFn = mapTypeToLoggerFn[type];

  loggerFn(prefixedMessage);
};

export default logger;
