import cls from "classnames";
import { Checkbox, type CheckboxProps } from "../../lib";
import classes from "./Checkbox.module.css";

const MySwitch = (
  props: Pick<CheckboxProps, "checked" | "onChange"> & { className?: string }
) => {
  const { checked, onChange, className } = props;

  return (
    <Checkbox
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

export default MySwitch;
