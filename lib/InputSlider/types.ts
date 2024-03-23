export type ThumbNames = "infimum" | "supremum";
export type Entities = ThumbNames | "range";

export type ThumbState = {
  active: boolean;
  zIndex: number;
};

export type Positions = Record<ThumbNames, number> & {
  range: { start: number; end: number };
};

export type ThumbInfo = {
  index: 0 | 1;
  name: ThumbNames;
  value: number;
  minValue: number;
  maxValue: number;
  state: ThumbState;
  ref: React.RefObject<HTMLDivElement>;
  setState: React.Dispatch<React.SetStateAction<ThumbState>>;
};

export type ThumbsInfo = Record<ThumbNames, ThumbInfo>;

export type Orientation = "horizontal" | "vertical";

export type StopSegment = { length: number; index: number };
