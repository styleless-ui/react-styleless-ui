// Cherry picked from https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-is-polymorphic.tsx

import * as React from "react";
import { render } from ".";

const itIsPolymorphic = <T,>(
  Component: React.ComponentType<T>,
  requiredProps: T,
  selector?: string,
) => {
  it("is polymorphic", () => {
    const getTarget = (container: HTMLElement): HTMLElement =>
      selector
        ? (container.querySelector(selector) as HTMLElement)
        : (container.firstChild as HTMLElement);

    const TestComponent = React.forwardRef(
      (props: Record<string, unknown> = {}, ref: React.Ref<HTMLElement>) => (
        <span data-test-prop ref={ref} {...props} />
      ),
    );

    TestComponent.displayName = "@styleless-ui/TestComponent";

    const { container: withTag } = render(
      <Component as="a" href="https://styleless-ui.io" {...requiredProps} />,
    );

    const { container: withComponent } = render(
      <Component as={TestComponent} {...requiredProps} />,
    );

    expect(getTarget(withTag).tagName).toBe("A");
    expect(getTarget(withComponent).tagName).toBe("SPAN");
  });
};

export default itIsPolymorphic;
