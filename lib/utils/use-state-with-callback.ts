import * as React from "react";

type FinishCallback<T> = (state: T) => void;

type SetState<T> = (
  value: React.SetStateAction<T>,
  onFinish?: FinishCallback<T>,
) => void;

const useStateWithCallback = <T>(
  initialState: T | (() => T),
): [T, SetState<T>] => {
  const [state, reactSetState] = React.useState(initialState);

  const callbacksRef = React.useRef<Set<FinishCallback<T>>>(new Set());

  const setState = React.useCallback<SetState<T>>((value, onFinish) => {
    reactSetState(value);

    if (onFinish) callbacksRef.current.add(onFinish);
  }, []);

  React.useEffect(() => {
    callbacksRef.current.forEach(callback => callback(state));
    callbacksRef.current.clear();
  }, [state]);

  return [state, setState];
};

export default useStateWithCallback;
