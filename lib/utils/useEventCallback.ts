import * as React from "react";

/**
 * A community-wide workaround for `useCallback()`.
 * Because the `useCallback()` hook invalidates too often in practice.
 *
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
const useEventCallback = <
  E extends React.BaseSyntheticEvent | Event,
  T extends (event: E) => void = (event: E) => void,
>(
  fn: T,
): T => {
  const ref = React.useRef<T>(fn);

  React.useEffect(() => void (ref.current = fn));

  return React.useCallback((event: E) => void ref.current(event), []) as T;
};

export default useEventCallback;
