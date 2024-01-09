import * as React from "react";
import { useGetLatest } from ".";

type LabelInfo = {
  visibleLabel?: string;
  srOnlyLabel?: string;
  labelledBy?: string;
};

type Config = {
  onClick: (event: MouseEvent) => void;
  labelInfo: LabelInfo;
  visibleLabelId?: string;
};

const useHandleTargetLabelClick = (config: Config) => {
  const { onClick, labelInfo, visibleLabelId } = config;

  const cachedOnClick = useGetLatest(onClick);

  React.useEffect(() => {
    const targetLabel =
      labelInfo.visibleLabel && visibleLabelId
        ? document.getElementById(visibleLabelId)
        : labelInfo.labelledBy
        ? document.getElementById(labelInfo.labelledBy)
        : null;

    if (!targetLabel) return;

    const clickHandler = cachedOnClick.current;

    targetLabel.addEventListener("click", clickHandler);

    return () => {
      targetLabel.removeEventListener("click", clickHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelInfo.labelledBy, labelInfo.visibleLabel, visibleLabelId]);
};

export default useHandleTargetLabelClick;
