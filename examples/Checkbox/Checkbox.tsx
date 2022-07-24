import cls from "classnames";
import { Checkbox, type CheckboxProps } from "../../lib";
import classes from "./Checkbox.module.css";

const MyCheckbox = (props: Pick<CheckboxProps, "checked" | "onChange">) => {
  const { checked, onChange } = props;

  return (
    <div className={classes.row}>
      <Checkbox
        label="Label"
        checked={checked}
        onChange={onChange}
        classes={({ checked, focusedVisible }) => ({
          root: cls(classes.root, {
            [classes.checked]: checked,
            [classes.focusVisible]: focusedVisible
          }),
          label: classes.label,
          check: classes.check
        })}
      />
    </div>
  );
};

export default MyCheckbox;
