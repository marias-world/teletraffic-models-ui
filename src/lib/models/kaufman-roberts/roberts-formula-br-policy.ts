import { ServiceClassWithBR } from "../../models/types";
import { normaliseProbabilityValues } from "../../models/normalise-probabilities";
import { rescaleIfLarge } from "../../models/rescale";

export const robertsFormulaBRPolicy = (
  capacity: number,
  serviceClasses: ServiceClassWithBR[],
) => {
  if (serviceClasses.length === 0) return {};

  const q: number[] = new Array(capacity + 1);
  q[0] = 1;

  for (let j = 1; j <= capacity; j++) {
    let sum = 0;
    for (const serviceClass of serviceClasses) {
      const { incomingLoad_a, tk } = serviceClass;
      const bu = j > capacity - tk ? 0 : serviceClass.bu;
      if (bu <= 0) continue;

      const prevIndex = j - bu;
      const prevValue = prevIndex >= 0 ? q[prevIndex] : 0;
      sum += incomingLoad_a * bu * prevValue;
    }
    q[j] = sum / j;
    rescaleIfLarge(q, j);
  }

  const probabilities: { [key: string]: number } = {};
  normaliseProbabilityValues(q).forEach((prob: number, index: number) => {
    return (probabilities[`q(${index})`] = prob);
  });

  return probabilities;
};
