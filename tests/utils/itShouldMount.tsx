import * as React from "react";
import { render } from ".";

const itShouldMount = <T,>(
  Component: React.ComponentType<T>,
  requiredProps: T
): void => {
  it(`component could be updated and unmounted without errors`, () => {
    const elem = (<Component {...requiredProps} />) as React.ReactElement;

    const result = render(elem);

    expect(() => {
      result.rerender(elem);
      result.unmount();
    }).not.toThrow();
  });
};

export default itShouldMount;
