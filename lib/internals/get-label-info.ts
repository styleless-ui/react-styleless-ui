import { SystemError } from "../utils";

type SrOnlyLabel = {
  /**
   * The label to use as `aria-label` property.
   */
  screenReaderLabel: string;
};

type ExternalLabel = {
  /**
   * Identifies the element (or elements) that labels the breadcrumb.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby MDN Web Docs} for more information.
   */
  labelledBy: string;
};

type Label = string | SrOnlyLabel | ExternalLabel;

type Options = {
  customErrorMessage: string;
};

const getLabelInfo = (
  labelInput: Label,
  scope: string,
  options?: Partial<Options>,
) => {
  const { customErrorMessage } = options ?? {};

  const props: {
    visibleLabel?: string;
    srOnlyLabel?: string;
    labelledBy?: string;
  } = {};

  if (typeof labelInput === "string") {
    props.visibleLabel = labelInput;
  } else {
    if ("screenReaderLabel" in labelInput) {
      props.srOnlyLabel = labelInput.screenReaderLabel;
    } else if ("labelledBy" in labelInput) {
      props.labelledBy = labelInput.labelledBy;
    } else {
      const message =
        customErrorMessage ??
        [
          "Invalid `label` property.",
          "The `label` property must be either a `string` or in shape of " +
            "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
        ].join("\n");

      throw new SystemError(message, scope);
    }
  }

  return props;
};

export default getLabelInfo;
