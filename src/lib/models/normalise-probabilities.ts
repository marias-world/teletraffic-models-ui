import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../models/constants";

export const calculateNormalizationConstant_G = (
  unormalizedProbabilities: number[],
): number => {
  if (unormalizedProbabilities.length === 0) return 0;
  return unormalizedProbabilities.reduce((acc, curr) => acc + curr, 0);
};

export const normaliseProbabilityValues = (
  probabilities: number[],
): number[] => {
  const sum = calculateNormalizationConstant_G(probabilities);
  return probabilities.map((probability) =>
    parseFloat((probability / sum).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL)),
  );
};
