const prefixMessage = (message: string, scope?: string) => {
  let prefix = "[StylelessUI]";

  if (scope) prefix = prefix.concat(`[${scope}]`);

  return `${prefix}: ${message}`;
};

export default prefixMessage;
