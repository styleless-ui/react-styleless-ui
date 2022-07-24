import cls from "classnames";
import { Radio, type RadioProps } from "../../lib";
import classes from "./Radio.module.css";

const MyRadio = (
  props: Pick<RadioProps, "checked" | "onChange"> & { className?: string }
) => {
  const { checked, onChange, className } = props;

  return (
    <Radio
      label="Label"
      checked={checked}
      onChange={onChange}
      classes={({ checked, focusedVisible }) => ({
        root: cls(classes.root, className),
        label: classes.label,
        controller: cls(classes.controller, {
          [classes.checked]: checked,
          [classes.focusVisible]: focusedVisible
        }),
        check: classes.check
      })}
    />
  );
};

export default MyRadio;
