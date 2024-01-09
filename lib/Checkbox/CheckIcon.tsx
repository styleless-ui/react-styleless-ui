import * as React from "react";

type Props = {
  slot: string;
  className?: string;
  checkComponent?: React.ReactElement;
};

const CheckIcon = (props: Props) => {
  const { slot, checkComponent, className } = props;

  const defaultIcon = (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 8">
      <polyline
        fill="none"
        stroke="currentcolor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(5.974874, 2.353553) rotate(-45.000000) translate(-5.974874, -2.353553) "
        points="2 0.292893219 2 4.29289322 9.94974747 4.41421356"
      />
    </svg>
  );

  return (
    <div className={className} data-slot={slot} aria-hidden="true">
      {checkComponent ?? defaultIcon}
    </div>
  );
};

export default CheckIcon;
