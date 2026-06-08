import { factorial } from './factorial';

export const binomialCoefficient = (nTotalItems: number, kSelectedItems: number): number => {
  return factorial(nTotalItems) / (factorial(kSelectedItems) * factorial(nTotalItems - kSelectedItems));
};

const binomialDistribution = (nTotalItems: number, probability: number, kSelectedItems: number): number => {
  return binomialCoefficient(nTotalItems, kSelectedItems) * Math.pow(probability, kSelectedItems) * Math.pow(1 - probability, nTotalItems - kSelectedItems);
};

export const binomialDistributionRangeProbability = (nTotalItems: number, probability: number, minSuccesses: number, maxSuccesses: number): number => {
  let sum = 0;

  for (let i = minSuccesses; i <= maxSuccesses; i++) {
    sum += binomialDistribution(nTotalItems, probability, i);

  }
  return sum;
};
