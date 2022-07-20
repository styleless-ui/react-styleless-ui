import cls from "classnames";
import { Switch, type SwitchProps } from "../../lib";
import classes from "./Switch.module.css";

const Thumb = ({ className }: { className?: string }) => {
  return <div className={className}></div>;
};

const Track = ({ className }: { className?: string }) => {
  return <div className={className}></div>;
};

const MySwitch = (
  props: Pick<SwitchProps, "checked" | "onChange"> & { className?: string }
) => {
  const { checked, onChange, className } = props;

  return (
    <Switch
      label="Label"
      checked={checked}
      onChange={onChange}
      thumbComponent={<Thumb />}
      trackComponent={<Track />}
      classes={({ checked, focusedVisible }) => ({
        root: cls(classes.root, className),
        label: classes.label,
        controller: cls(classes.controller, {
          [classes.checked]: checked,
          [classes.focusVisible]: focusedVisible
        }),
        thumb: classes.thumb,
        track: classes.track
      })}
    />
  );
};

export default MySwitch;
