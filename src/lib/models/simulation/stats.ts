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

// Two-sided 95% critical values of Student's t distribution, for 1..30
// degrees of freedom. With only a handful of seeds the normal value 1.96
// would understate the interval (df = 9 needs 2.262), so the exact values
// are used; beyond 30 degrees of freedom the normal value is close enough.
const T_CRITICAL_95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201,
  2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074,
  2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
];

export function tCritical95(degreesOfFreedom: number): number {
  if (!(degreesOfFreedom >= 1)) return NaN;
  return degreesOfFreedom <= 30
    ? T_CRITICAL_95[Math.floor(degreesOfFreedom) - 1]
    : 1.96;
}

// Half-width of the 95% confidence interval for the mean of `n` independent
// replications whose sample standard deviation is `stdev`: t * s / sqrt(n).
// NaN for fewer than two replications, where no interval exists.
export function confidenceHalfWidth95(stdev: number, n: number): number {
  if (!(n >= 2)) return NaN;
  return (tCritical95(n - 1) * stdev) / Math.sqrt(n);
}
