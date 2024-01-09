import prefixMessage from "./prefix-message";

class SystemError extends Error {
  constructor(err: Error | string, scope?: string) {
    const message = typeof err === "string" ? err : err.message;
    const prefixedMessage = prefixMessage(message, scope);

    super(prefixedMessage);

    this.name = "SystemError";
  }
}

export default SystemError;
