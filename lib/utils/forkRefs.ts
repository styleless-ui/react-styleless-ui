import setRef from "./setRef";

const forkRefs =
  <T>(...refs: React.Ref<T>[]) =>
  (instance: T) =>
    refs.forEach(ref => void setRef(ref, instance));

export default forkRefs;
