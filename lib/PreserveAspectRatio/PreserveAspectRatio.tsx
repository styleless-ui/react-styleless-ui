import * as React from "react";

export interface PreserveAspectRatioProps {
  children?: React.ReactNode;
  ratio: number;
}

const PreserveAspectRatio = (props: PreserveAspectRatioProps) => {
  const { children, ratio } = props;

  const rootStyles: React.CSSProperties = {
    position: "relative",
    paddingTop: `${100 / ratio}%`,
    width: "100%"
  };

  const containerStyles: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  return (
    <div data-slot="preserveAspectRatioRootSlot" style={rootStyles}>
      <div data-slot="preserveAspectRatioContainerSlot" style={containerStyles}>
        {children}
      </div>
    </div>
  );
};

export default PreserveAspectRatio;
