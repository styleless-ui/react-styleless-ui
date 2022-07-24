// Cherry picked from https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-supports-others.tsx

import * as React from "react";
import { render } from ".";

const itSupportsDataSetProps = <T,>(
  Component: React.ComponentType<T>,
  requiredProps: T,
  selector?: string
): void => {
  it("supports dataset props", () => {
    const getTarget = (container: HTMLElement): HTMLElement =>
      selector
        ? (container.querySelector(selector) as HTMLElement)
        : (container.firstChild as HTMLElement);

    const { container } = render(
      <Component {...requiredProps} data-other-attribute="test" />
    );

    expect(getTarget(container)).toHaveAttribute(
      "data-other-attribute",
      "test"
    );
  });
};

export default itSupportsDataSetProps;
