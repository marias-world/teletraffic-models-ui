import { ServiceClass } from "../../models/types";
import { normaliseProbabilityValues } from "../../models/normalise-probabilities";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../../models/constants";

export const unnormalisedKaufmanRobertsFormula = (
  capacity: number,
  serviceClasses: ServiceClass[],
): number[] => {
  if (!serviceClasses.length || capacity < 0) return [];

  // q(j) only ever depends on smaller states q(j - b_i), so the whole
  // range can be filled bottom-up with a single shared array instead of
  // recursing from scratch for every j. The previous recursive version
  // built a fresh memo per call to stateProbability_q(j, ...), so it
  // recomputed the same overlapping subproblems for every j in the loop:
  // O(capacity^2 * classes) work and O(capacity)-deep recursion, which
  // made large capacities (or repeated calls from RLA/LAR) slow enough to
  // block the UI thread. This is O(capacity * classes) and iterative.
  const q: number[] = new Array(capacity + 1);
  q[0] = 1;

  for (let j = 1; j <= capacity; j++) {
    let sum = 0;
    for (const serviceClass of serviceClasses) {
      const { bu, incomingLoad_a } = serviceClass;
      if (incomingLoad_a === 0 || bu === 0) continue;

      const prevIndex = j - bu;
      const prevValue = prevIndex >= 0 ? q[prevIndex] : 0;
      sum += incomingLoad_a * bu * prevValue;
    }
    q[j] = sum / j;
  }

  return q.map((value) =>
    parseFloat(value.toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL)),
  );
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
