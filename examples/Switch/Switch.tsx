import cls from "classnames";
import { Switch, type SwitchProps } from "../../lib";
import classes from "./Switch.module.css";

const Thumb = ({ className }: { className?: string }) => {
  return <div className={className}></div>;
};

const Track = ({ className }: { className?: string }) => {
  return <div className={className}></div>;
};

const MySwitch = (props: Pick<SwitchProps, "checked" | "onChange">) => {
  const { checked, onChange } = props;

  return (
    <div className={classes.row}>
      <Switch
        label="Label"
        checked={checked}
        onChange={onChange}
        thumbComponent={<Thumb />}
        trackComponent={<Track />}
        classes={({ checked, focusedVisible }) => ({
          label: classes.label,
          root: cls(classes.root, {
            [classes.checked]: checked,
            [classes.focusVisible]: focusedVisible
          }),
          thumb: classes.thumb,
          track: classes.track
        })}
      />
    </div>
  );
};

export default MySwitch;
