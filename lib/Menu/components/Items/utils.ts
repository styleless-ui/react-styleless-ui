import { SystemError } from "../../../utils";
import { type Props } from "./Items";

export const getLabelInfo = (labelInput: Props["label"]) => {
  const props: { srOnlyLabel?: string; labelledBy?: string } = {};

  if ("screenReaderLabel" in labelInput) {
    props.srOnlyLabel = labelInput.screenReaderLabel;
  } else if ("labelledBy" in labelInput) {
    props.labelledBy = labelInput.labelledBy;
  } else {
    throw new SystemError(
      [
        "Invalid `label` property.",
        "The `label` property must be in shape of " +
          "`{ screenReaderLabel: string; } | { labelledBy: string; }`",
      ].join("\n"),
      "Menu.Items",
    );
  }

  return props;
};
