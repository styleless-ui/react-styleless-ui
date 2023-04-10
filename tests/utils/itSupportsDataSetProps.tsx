// Cherry picked from https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-supports-others.tsx

import * as React from "react";
import { render } from ".";

const itSupportsDataSetProps = <T,>(
  Component: React.ComponentType<T>,
  requiredProps: T,
  selector?: string,
  options?: { withPortal?: boolean },
): void => {
  it("supports `data-*` props", () => {
    const { withPortal = false } = options ?? {};

    const getTarget = (container: HTMLElement): HTMLElement => {
      const portal = withPortal
        ? document.querySelector<HTMLElement>("[data-slot='portal']")
        : null;

      return selector
        ? portal
          ? (portal.querySelector(selector) as HTMLElement)
          : (container.querySelector(selector) as HTMLElement)
        : portal
        ? (container.firstChild as HTMLElement)
        : (container.firstChild as HTMLElement);
    };

    const { container } = render(
      <Component {...requiredProps} data-other-attribute="test" />,
    );

    expect(getTarget(container)).toHaveAttribute(
      "data-other-attribute",
      "test",
    );
  });
};

export default itSupportsDataSetProps;
