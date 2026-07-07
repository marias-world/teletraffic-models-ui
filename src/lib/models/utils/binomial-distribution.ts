export const binomialCoefficient = (
  nTotalItems: number,
  kSelectedItems: number,
): number => {
  if (kSelectedItems < 0 || kSelectedItems > nTotalItems) return 0;

  const k = Math.min(kSelectedItems, nTotalItems - kSelectedItems);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (nTotalItems - i)) / (i + 1);
  }
  return result;
};

const binomialDistribution = (
  nTotalItems: number,
  probability: number,
  kSelectedItems: number,
): number => {
  return (
    binomialCoefficient(nTotalItems, kSelectedItems) *
    Math.pow(probability, kSelectedItems) *
    Math.pow(1 - probability, nTotalItems - kSelectedItems)
  );
};

export const binomialDistributionRangeProbability = (
  nTotalItems: number,
  probability: number,
  minSuccesses: number,
  maxSuccesses: number,
): number => {
  let sum = 0;

  for (let i = minSuccesses; i <= maxSuccesses; i++) {
    sum += binomialDistribution(nTotalItems, probability, i);
  }
  return sum;
};
