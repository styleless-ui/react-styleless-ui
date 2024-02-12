import * as React from "react";
import { render } from ".";

const itShouldMount = <P extends JSX.IntrinsicAttributes>(
  Component: React.ComponentType<P>,
  requiredProps: P,
): void => {
  it(`component could be mounted and unmounted without errors`, () => {
    const elem = (<Component {...requiredProps} />) as React.ReactElement;

    const result = render(elem);

    expect(() => {
      result.rerender(elem);
      result.unmount();
    }).not.toThrow();
  });
};

export default itShouldMount;
