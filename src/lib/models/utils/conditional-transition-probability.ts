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

  if (!isFinite(calculateArrangements) || isNaN(calculateArrangements)) {
    calculateArrangements = 0;
  }

  // Clamp to [0, 1] — the alternating I-E sum can produce tiny floating-point
  // artefacts outside this range when the true value is 0 or 1.
  calculateArrangements = Math.max(0, Math.min(1, calculateArrangements));

  return 1 - calculateArrangements;
};
