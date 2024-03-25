const resolvePropWithRenderContext = <TProp, TRenderContext>(
  prop: TProp | ((renderContext: TRenderContext) => TProp),
  renderContext: TRenderContext,
) => {
  if (typeof prop === "function") {
    return (prop as (renderContext: TRenderContext) => TProp)(renderContext);
  }

  return prop;
};

export default resolvePropWithRenderContext;
