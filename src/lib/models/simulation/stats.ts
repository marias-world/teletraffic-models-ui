export function meanAndStdev(values: number[]): {
  mean: number;
  stdev: number;
} {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.length > 1
      ? values.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
        (values.length - 1)
      : 0;
  return { mean, stdev: Math.sqrt(variance) };
}
