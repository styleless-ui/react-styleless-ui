import * as React from "react";

type Props = {
  slot: string;
  className?: string;
  checkComponent?: React.ReactElement;
};

const CheckIcon = (props: Props) => {
  const { slot, checkComponent, className } = props;

  const defaultIcon = (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 8 8"
    >
      <circle
        cx={4}
        cy={4}
        r={4}
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );

  return (
    <div
      className={className}
      data-slot={slot}
      aria-hidden="true"
    >
      {checkComponent ?? defaultIcon}
    </div>
  );
};

export default CheckIcon;
