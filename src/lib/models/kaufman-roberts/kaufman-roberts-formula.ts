import { ServiceClass } from "../../models/types";
import { normaliseProbabilityValues } from "../../models/normalise-probabilities";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../../models/constants";

const stateProbability_q = (
  j: number,
  serviceClasses: ServiceClass[],
): number => {
  const memo: Record<number, number> = {};

  const compute = (k: number): number => {
    // Base cases
    if (k === 0) return 1;
    if (k < 0) return 0;

    // Check memo
    if (memo[k] !== undefined) return memo[k];

    // Compute the state probability
    let sum = 0;
    for (const serviceClass of serviceClasses) {
      const { bu, incomingLoad_a } = serviceClass;

      if (incomingLoad_a === 0 || bu === 0) continue;
      sum += incomingLoad_a * bu * compute(k - bu);
    }

    // Memoize and return result
    const result = (1 / k) * sum;
    memo[k] = result;
    return result;
  };

  return compute(j);
};

export const unnormalisedKaufmanRobertsFormula = (
  capacity: number,
  serviceClasses: ServiceClass[],
): number[] => {
  if (!serviceClasses.length) return [];

  const results = Array(capacity + 1).fill(0);

  for (let j = 0; j <= capacity; j++) {
    results[j] = parseFloat(
      stateProbability_q(j, serviceClasses).toFixed(
        NUMBER_OF_DIGITS_AFTER_DECIMAL,
      ),
    );
  }

  return results;
};

export const kaufmanRoberts = (
  capacity: number,
  serviceClasses: ServiceClass[],
) => {
  const probabilities = unnormalisedKaufmanRobertsFormula(
    capacity,
    serviceClasses,
  );

  const result: { [key: string]: number } = {};

  normaliseProbabilityValues(probabilities).forEach((prob, index) => {
    return (result[`q(${index})`] = prob);
  });

  return result;
};
