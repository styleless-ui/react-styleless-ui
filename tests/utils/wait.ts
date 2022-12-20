const wait = (durationInMillis: number) =>
  new Promise<void>(resolve => setTimeout(resolve, durationInMillis));

export default wait;
