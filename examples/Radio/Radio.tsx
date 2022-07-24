import cls from "classnames";
import { Radio, type RadioProps } from "../../lib";
import classes from "./Radio.module.css";

const MyRadio = (props: Pick<RadioProps, "checked" | "onChange">) => {
  const { checked, onChange } = props;

  return (
    <div className={classes.row}>
      <Radio
        label="Label"
        checked={checked}
        onChange={onChange}
        classes={({ checked, focusedVisible }) => ({
          label: classes.label,
          root: cls(classes.root, {
            [classes.checked]: checked,
            [classes.focusVisible]: focusedVisible
          }),
          check: classes.check
        })}
      />
    </div>
  );
};

export default MyRadio;
