import { ServiceClass, ServiceClassWithBR } from "../../models/types";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../../models/constants";
import { kaufmanRoberts } from "./kaufman-roberts-formula";

export const calculateLinkUtilization = (
  capacity: number,
  serviceClasses: ServiceClass[],
): number => {
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  return Array.from({ length: capacity }, (_, j) => {
    const q_j = probabilities[`q(${j + 1})`];
    return (j + 1) * q_j;
  }).reduce((sum, value) => sum + value, 0);
};

export const linkUtilization_U = (
  capacity: number,
  serviceClasses: ServiceClass[],
): string => {
  const linkUtilization = calculateLinkUtilization(capacity, serviceClasses);
  return `${linkUtilization.toFixed(7)} b.u`;
};

export const trunkEficiency_n = (
  capacity: number,
  serviceClasses: ServiceClass[],
): string => {
  const utilization_G = calculateLinkUtilization(capacity, serviceClasses);
  return `${((utilization_G / capacity) * 100).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL)}%`;
};

/**
 * Computes link utilization U and trunk efficiency from a pre-computed
 * normalised probability map (works for both CS and BR policies).
 *
 * U = Σ j · q(j)  for j = 1…C
 */
export const linkUtilizationFromProbabilities = (
  capacity: number,
  probabilities: Record<string, number>,
): { U: number; efficiency: number } => {
  const U = Array.from({ length: capacity }, (_, j) => {
    const q_j = probabilities[`q(${j + 1})`] ?? 0;
    return (j + 1) * q_j;
  }).reduce((sum, v) => sum + v, 0);

  return {
    U,
    efficiency: (U / capacity) * 100,
  };
};

export const meanNumberOfCallsInSystemInState_J = (
  capacity: number,
  serviceClasses: ServiceClass[],
  state_j: number,
): { [key: string]: number } => {
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  const meanNumberOfCalls: { [key: string]: number } = {};

  for (const serviceClass of serviceClasses) {
    const { bu, incomingLoad_a } = serviceClass;

    if (state_j < bu) {
      // set y_k(j) = 0 as per the condition
      meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] = 0;
      continue;
    }

    const prob_j_minus_bu = probabilities[`q(${state_j - bu})`];
    const prob_j = probabilities[`q(${state_j})`];

    if (prob_j_minus_bu === undefined || prob_j === undefined || prob_j === 0) {
      meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] = 0;
      continue;
    }

    const y_j = incomingLoad_a * (prob_j_minus_bu / prob_j);

    meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] =
      parseFloat(y_j.toFixed(2));
  }

  return meanNumberOfCalls;
};

export const meanNumberOfCallsInSystem = (
  capacity: number,
  serviceClasses: ServiceClass[] | ServiceClassWithBR[],
) => {
  const meanNumberOfCalls: { [key: string]: number } = {};
  // Compute probabilities once and reuse across all states and classes
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  for (const serviceClass of serviceClasses) {
    meanNumberOfCalls[`n_${serviceClass.serviceClass}`] = 0;
    const tk = (serviceClass as ServiceClassWithBR).tk ?? 0;

    for (let j = 1; j <= capacity; j++) {
      let y_j = 0;

      if (j <= capacity - tk && j >= serviceClass.bu) {
        const prob_j_minus_bu = probabilities[`q(${j - serviceClass.bu})`];
        const prob_j = probabilities[`q(${j})`];

        if (prob_j && prob_j_minus_bu !== undefined) {
          y_j = parseFloat(
            (serviceClass.incomingLoad_a * (prob_j_minus_bu / prob_j)).toFixed(2),
          );
        }
      }

      meanNumberOfCalls[`n_${serviceClass.serviceClass}`] +=
        y_j * parseFloat(probabilities[`q(${j})`].toFixed(2));
    }
  }

  return meanNumberOfCalls;
};

