const createCustomEvent = (
  scope: string,
  eventName: string,
  eventInit: EventInit,
) => {
  const type = `custom.${scope.toLowerCase()}.${eventName.toLowerCase()}`;
  const event = new CustomEvent(type, eventInit);

  return event;
};

export default createCustomEvent;
