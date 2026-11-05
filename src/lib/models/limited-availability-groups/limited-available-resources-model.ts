import { ServiceClass } from "../types";
import { conditionalTransitionProbability } from "../utils/conditional-transition-probability";
import { rescaleIfLarge } from "../rescale";

export const unnormalisedLARModel = (
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[],
): number[] => {
  if (serviceClasses.length === 0) return [];
  if (distinctResourceCount <= 0 || individualResourceCapacity <= 0) {
    throw new Error(
      "Invalid inputs: ensure positive resource counts and non-empty service classes.",
    );
  }

  const totalCapacity = distinctResourceCount * individualResourceCapacity;
  const q: number[] = new Array(totalCapacity + 1);
  q[0] = 1;

  for (let i = 1; i <= totalCapacity; i++) {
    let sum = 0;
    for (const serviceClass of serviceClasses) {
      const { bu, incomingLoad_a } = serviceClass;
      const prevIndex = i - bu;
      if (prevIndex < 0) continue;

      const conditionalProbability = conditionalTransitionProbability(
        prevIndex,
        bu,
        distinctResourceCount,
        individualResourceCapacity,
      );
      const clampedProbability = Math.max(
        0,
        Math.min(1, conditionalProbability),
      );

      sum += incomingLoad_a * bu * clampedProbability * q[prevIndex];
    }

    const result = (1 / i) * sum;
    if (isNaN(result) || result < 0) {
      throw new Error("Invalid result calculated.");
    }
    q[i] = result;

    rescaleIfLarge(q, i);
  }

  return q;
};
