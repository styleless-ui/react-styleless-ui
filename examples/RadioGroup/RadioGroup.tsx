import cls from "classnames";
import { Radio, RadioGroup } from "../../lib";
import classes from "./RadioGroup.module.css";

const MyRadio = ({ value }: { value: string }) => (
  <div className={classes.radioRow}>
    <Radio
      label="Label"
      value={value}
      classes={({ checked, focusedVisible }) => ({
        label: classes.radioLabel,
        root: cls(classes.radio, {
          [classes.radioChecked]: checked,
          [classes.radioFocusVisible]: focusedVisible
        }),
        check: classes.radioCheck
      })}
    />
  </div>
);

const MyRadioGroup = () => (
  <div className={classes.groupRow}>
    <RadioGroup
      label="Group Label"
      classes={{ label: classes.groupLabel, root: classes.groupRoot }}
    >
      <MyRadio value="0" />
      <MyRadio value="1" />
      <MyRadio value="2" />
    </RadioGroup>
  </div>
);

export default MyRadioGroup;
