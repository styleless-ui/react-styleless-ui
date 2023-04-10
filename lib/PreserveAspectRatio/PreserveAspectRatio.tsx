import * as React from "react";
import * as Slots from "./slots";

export interface RootProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The ratio which needs to be preserved.
   */
  ratio: number;
}

const PreserveAspectRatio = (props: RootProps) => {
  const { children, ratio } = props;

  const rootStyles: React.CSSProperties = {
    position: "relative",
    paddingTop: `${100 / ratio}%`,
    width: "100%",
  };

  const containerStyles: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  return (
    <div data-slot={Slots.Root} style={rootStyles}>
      <div data-slot={Slots.Container} style={containerStyles}>
        {children}
      </div>
    </div>
  );
};

export default PreserveAspectRatio;
