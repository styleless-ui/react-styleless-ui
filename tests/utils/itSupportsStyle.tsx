// Cherry picked from https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-supports-style.tsx

import * as React from "react";
import { render } from ".";

const itSupportsStyle = <T,>(
  Component: React.ComponentType<T>,
  requiredProps: T,
  selector?: string,
  options?: { withPortal?: boolean },
): void => {
  it("supports style prop", () => {
    const { withPortal = false } = options ?? {};

    const getTarget = (container: HTMLElement): HTMLElement => {
      const portal = withPortal
        ? document.querySelector<HTMLElement>("[data-slot='Portal:Root']")
        : null;

      return selector
        ? portal
          ? (portal.querySelector(selector) as HTMLElement)
          : (container.querySelector(selector) as HTMLElement)
        : portal
        ? (container.firstChild as HTMLElement)
        : (container.firstChild as HTMLElement);
    };

    const style = { border: "1px solid red", backgroundColor: "black" };

    const { container } = render(
      <Component {...requiredProps} style={style} />,
    );

    expect(getTarget(container)).toHaveStyle(style);
  });
};

export default itSupportsStyle;
