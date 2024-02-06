export const normalizeValues = (value: string | string[] | undefined) => {
  if (value == null) return [];

  if (typeof value === "string") {
    if (value.length === 0) return [];

    return [value];
  }

  return value;
};

export const noValueSelected = (value: string | string[] | undefined) =>
  normalizeValues(value).length === 0;
