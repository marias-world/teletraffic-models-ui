import { ServiceClass } from "../types";
import { calculateNormalizationConstant_G } from "../normalise-probabilities";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../constants";
import { unnormalisedLARModel } from "./limited-available-resources-model";
import { conditionalTransitionProbability } from "../utils/conditional-transition-probability";

export const blockingProbabilityLAR = (
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[],
) => {
  const probabilities = unnormalisedLARModel(
    distinctResourceCount,
    individualResourceCapacity,
    serviceClasses,
  );
  const normalisationConstant = calculateNormalizationConstant_G(probabilities);
  const result: { [key: string]: number } = {};

  serviceClasses.forEach((serviceClass, index) => {
    const { bu } = serviceClass;
    const nState =
      distinctResourceCount * individualResourceCapacity -
      distinctResourceCount * serviceClass.bu +
      distinctResourceCount;
    const totalCapacity = distinctResourceCount * individualResourceCapacity;

    let cbp = 0;

    for (let n = nState; n <= totalCapacity; n++) {
      const p_n = probabilities[n] || 0;
      cbp +=
        p_n *
        (1 -
          conditionalTransitionProbability(
            n,
            bu,
            distinctResourceCount,
            individualResourceCapacity,
          ));
    }
    result[`B_class_${index + 1}`] = parseFloat(
      (cbp / normalisationConstant).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL),
    );
  });
  return result;
};
