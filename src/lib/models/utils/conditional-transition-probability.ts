import { possibleArrangements } from './possible-arrangements';

export const conditionalTransitionProbability = (
  currentState: number,
  requiredAllocationUnitsForClass: number,
  distinctResourceCount: number,
  individualResourceCapacity: number
) => {
  const availableArrangements = (distinctResourceCount * individualResourceCapacity) - currentState;
  const adjustedClassCapacity = requiredAllocationUnitsForClass - 1;

  const nominator = possibleArrangements(availableArrangements, distinctResourceCount, adjustedClassCapacity);
  const denominator = possibleArrangements(availableArrangements, distinctResourceCount, individualResourceCapacity);

  let calculateArrangements = nominator / denominator;
  
  if (calculateArrangements <= 0 || isNaN(calculateArrangements)) {
    calculateArrangements = 0;
  }

  return 1 - calculateArrangements;
};
