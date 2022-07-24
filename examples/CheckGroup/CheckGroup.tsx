import cls from "classnames";
import * as React from "react";
import { Checkbox, CheckGroup } from "../../lib";
import classes from "./CheckGroup.module.css";

const MyCheckbox = ({ value }: { value: string }) => (
  <div className={classes.checkRow}>
    <Checkbox
      label="Label"
      value={value}
      classes={({ checked, focusedVisible }) => ({
        label: classes.checkboxLabel,
        root: cls(classes.checkbox, {
          [classes.checkboxChecked]: checked,
          [classes.checkboxFocusVisible]: focusedVisible
        }),
        check: classes.checkboxCheck
      })}
    />
  </div>
);

const MyCheckGroup = () => (
  <div className={classes.groupRow}>
    <CheckGroup
      label="Group Label"
      classes={{ label: classes.groupLabel, root: classes.groupRoot }}
    >
      <MyCheckbox value="0" />
      <MyCheckbox value="1" />
      <MyCheckbox value="2" />
    </CheckGroup>
  </div>
);

export default MyCheckGroup;
