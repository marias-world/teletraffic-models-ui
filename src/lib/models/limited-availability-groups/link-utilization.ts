import { unnormalisedLARModel } from './limited-available-resources-model';
import { ServiceClass } from '../types';
import { normaliseProbabilityValues } from '../normalise-probabilities';

export const calculateLinkUtilization = (
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[]
): number => {
  const result: { [key: string]: number } = {};

  const probabilities: number[] = unnormalisedLARModel(
    distinctResourceCount,
    individualResourceCapacity,
    serviceClasses
  );

  normaliseProbabilityValues(probabilities).forEach((prob, index) => {
    result[`q(${index})`] = prob;
  });
  const capacity = distinctResourceCount * individualResourceCapacity;

  return Array.from({ length: capacity }, (_, j) => {
    const q_j = result[`q(${j + 1})`] || 0;
    return (j + 1) * q_j;
  }).reduce((sum, value) => sum + value, 0);
};

export const linkUtilization_U = (
  distinctResourceCount: number,
  capacity: number,
  serviceClasses: ServiceClass[]
): string => {
  const linkUtilization = calculateLinkUtilization(distinctResourceCount, capacity, serviceClasses);
  const totalCapacity = distinctResourceCount * capacity;
  console.log(`Link Utilization: ${linkUtilization}`);
  console.log(`Total Capacity: ${totalCapacity}`);
  const linkUtilizationPercenatge = (linkUtilization / totalCapacity) * 100;
  return `${linkUtilizationPercenatge} %`;
};

const distinctResourceCount = 2;
const capacity = 300;
const serviceClasses = [
  {
    serviceClass: 1,
    bu: 4,
    incomingLoad_a: 8
  },
  {
    serviceClass: 2,
    bu: 8,
    incomingLoad_a: 9
  },
  {
    serviceClass: 3,
    bu: 16,
    incomingLoad_a: 10
  }
];

console.log(linkUtilization_U(distinctResourceCount, capacity, serviceClasses));
