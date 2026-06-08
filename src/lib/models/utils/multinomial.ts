import { factorial } from './factorial';

export const multinomialCoefficient = (nTotalItems: number, kSelectedItems: number[]): number => {
  const numerator = factorial(nTotalItems);
  const denominator = kSelectedItems.reduce((acc, k) => acc * factorial(k), 1);
  return numerator / denominator;
};

