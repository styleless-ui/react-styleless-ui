import * as React from "react";

type Props = {
  slot: string;
  className?: string;
  checkComponent?: React.ReactElement;
};

const IndeterminateIcon = (props: Props) => {
  const { slot, checkComponent, className } = props;

  const defaultIcon = (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 8">
      <polyline
        fill="none"
        stroke="currentcolor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points="2 4 10 4"
      />
    </svg>
  );

  return (
    <div className={className} data-slot={slot} aria-hidden="true">
      {checkComponent ?? defaultIcon}
    </div>
  );
};

export default IndeterminateIcon;
