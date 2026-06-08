import { ServiceClass } from "../types";
import { conditionalTransitionProbability } from "../utils/conditional-transition-probability";
const calculateOccupancyProbability = (
  currentState: number,
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[],
  results: Record<number, number> = {},
): number => {
  if (
    distinctResourceCount <= 0 ||
    individualResourceCapacity <= 0 ||
    serviceClasses.length === 0
  ) {
    throw new Error(
      "Invalid inputs: ensure positive resource counts and non-empty service classes.",
    );
  }

  if (currentState in results) {
    return results[currentState];
  }

  // Base case: current state is zero
  if (currentState === 0) {
    results[0] = 1;
    return 1;
  }

  // Base case: if the current state is negative, the probability is 0.
  if (currentState < 0) {
    return 0;
  }

  let totalProbability = 0;

  for (const serviceClass of serviceClasses) {
    const { bu, incomingLoad_a } = serviceClass;

    const conditionalProbability = conditionalTransitionProbability(
      currentState - bu,
      bu,
      distinctResourceCount,
      individualResourceCapacity,
    );

    if (isNaN(conditionalProbability) || conditionalProbability < 0) {
      throw new Error("Invalid conditional probability calculated.");
    }

    const recursiveProbability = calculateOccupancyProbability(
      currentState - bu,
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses,
      results,
    );

    totalProbability +=
      incomingLoad_a * bu * conditionalProbability * recursiveProbability;
  }

  const result = (1 / currentState) * totalProbability;

  if (isNaN(result) || result < 0) {
    throw new Error("Invalid result calculated.");
  }

  results[currentState] = result;
  return result;
};

export const unnormalisedLARModel = (
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[],
) => {
  if (serviceClasses.length === 0) return [];

  const results: number[] = [];

  const totalCapacity = distinctResourceCount * individualResourceCapacity;

  for (let i = 0; i <= totalCapacity; i++) {
    results[i] = calculateOccupancyProbability(
      i,
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses,
    );
  }

  return results;
};
