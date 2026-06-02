import { ServiceClassWithBR } from "../../models/types";
import { normaliseProbabilityValues } from "../../models/normalise-probabilities";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../../models/constants";

const stateProbablityWithBR_q = (
  j: number,
  serviceClasses: ServiceClassWithBR[],
  capacity: number,
): number => {
  const memo: Record<number, number> = {};

  const compute = (k: number): number => {
    if (k === 0) return 1;
    if (k < 0) return 0;

    if (memo[k] !== undefined) return memo[k];

    let sum = 0;
    for (const serviceClass of serviceClasses) {
      const { incomingLoad_a, tk } = serviceClass;
      const bu = k > capacity - tk ? 0 : serviceClass.bu;

      if (bu <= 0) continue;

      sum += incomingLoad_a * bu * compute(k - bu);
    }

    const result = (1 / k) * sum;
    memo[k] = parseFloat(result.toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL));
    return memo[k];
  };

  return compute(j);
};

export const robertsFormulaBRPolicy = (
  capacity: number,
  serviceClasses: ServiceClassWithBR[],
) => {
  if (serviceClasses.length === 0) return {};

  const results: number[] = [];

  const probabilities: { [key: string]: number } = {};

  for (let j = 0; j <= capacity; j++) {
    results[j] = parseFloat(
      stateProbablityWithBR_q(j, serviceClasses, capacity).toFixed(
        NUMBER_OF_DIGITS_AFTER_DECIMAL,
      ),
    );
  }
  normaliseProbabilityValues(results).forEach((prob: number, index: number) => {
    return (probabilities[`q(${index})`] = prob);
  });

  return probabilities;
};
