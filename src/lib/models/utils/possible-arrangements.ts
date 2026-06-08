import { binomialCoefficient } from './binomial-distribution';

export const possibleArrangements = (
  totalArrangements: number,
  groupCount: number,
  maxCapacity: number
): number => {
  if (totalArrangements > groupCount * maxCapacity) {
    return 0;
  }

  const maxIterations = Math.floor(totalArrangements / (maxCapacity + 1));

  let totalPossibleArrangements = 0;

  for (let i = 0; i <= maxIterations; i++) {
    const arrangementCount =
      Math.pow(-1, i) *
      binomialCoefficient(groupCount, i) *
      binomialCoefficient(
        totalArrangements + groupCount - 1 - i * (maxCapacity + 1),
        groupCount - 1
      );

    totalPossibleArrangements += arrangementCount;
  }

  return totalPossibleArrangements;
};
