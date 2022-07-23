import {
  queries,
  render as testingLibraryRender,
  type Queries,
  type RenderOptions,
  type RenderResult
} from "@testing-library/react/pure";
import * as React from "react";

const render = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
>(
  ui: React.ReactElement,
  options: RenderOptions<Q, Container> = {}
): RenderResult<Q, Container> => testingLibraryRender(ui, options);

export default render;
