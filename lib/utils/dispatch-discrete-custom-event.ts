import { flushSync } from "react-dom";

/**
 * Flush custom event dispatch.
 *
 * @param target The target to dispatch its event.
 * @param event The event to be dispatched.
 */
const dispatchDiscreteCustomEvent = <E extends CustomEvent>(
  target: E["target"],
  event: E,
) => {
  if (!target) return;

  flushSync(() => {
    target.dispatchEvent(event);
  });
};

export default dispatchDiscreteCustomEvent;
