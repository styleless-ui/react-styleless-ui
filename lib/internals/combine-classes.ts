const combineClasses = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default combineClasses;
