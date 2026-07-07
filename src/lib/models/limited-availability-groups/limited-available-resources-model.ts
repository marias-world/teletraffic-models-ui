import { ServiceClass } from "../types";
import { conditionalTransitionProbability } from "../utils/conditional-transition-probability";

// Once any running value crosses this, every value computed so far is
// divided by the same constant to bring it back into a safe range. This is
// well below Number.MAX_VALUE (~1.8e308), leaving headroom before the next
// state's computation could push it over the edge.
const RESCALE_THRESHOLD = 1e250;

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

  // q(j) only depends on smaller states q(j - b_i), so the whole range can
  // be filled bottom-up with a single array instead of recursing from
  // scratch for every j (see the equivalent Kaufman-Roberts fix for the
  // full explanation of why the old recursive-with-fresh-memo version made
  // large capacities slow).
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

    // Heavy traffic relative to capacity (e.g. after scaling offered load
    // by a large number of physical machines) makes these raw, unnormalised
    // values grow without bound as occupancy increases. Left unchecked they
    // overflow past Number.MAX_VALUE into Infinity, and the later
    // normalisation step (dividing every value by their sum) then computes
    // Infinity / Infinity, which is NaN. Rescaling everything computed so
    // far by the same constant keeps the numbers finite without changing
    // any ratio between them, so the final normalised probabilities (each
    // value divided by the sum of all of them) come out identical to what
    // they would have been without rescaling.
    if (q[i] > RESCALE_THRESHOLD) {
      for (let k = 0; k <= i; k++) {
        q[k] /= RESCALE_THRESHOLD;
      }
    }
  }

  return q;
};
