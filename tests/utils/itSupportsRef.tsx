// Cherry picked from https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-supports-ref.tsx

import * as React from "react";
import { render } from ".";

const itSupportsRef = <T,>(
  Component: React.ComponentType<T>,
  requiredProps: T,
  refType: unknown
): void => {
  it(`supports forwarding ref`, () => {
    const ref = React.createRef<typeof refType>();

    render(<Component {...requiredProps} {...{ ref }} />);
    expect(ref.current).toBeInstanceOf(refType);
  });
};

export default itSupportsRef;
