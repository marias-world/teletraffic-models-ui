import {
  calculateBlockingLAR,
  calculateBlockingRatios,
  calculateEi,
  calculateSubsystemBlockingKaufmanRoberts,
  processResultInRLA,
} from "./proposed-model";
import { calculateTrafficLoad } from "./traffic-load";
import { Capacities, ServiceClassConfigs } from "./types";

const calculateSeviceClassesForRLA = (
  serviceClassConfigs: ServiceClassConfigs,
) => {
  return Object.values(serviceClassConfigs.ram).map((ramEntry) => {
    const serviceClass = ramEntry.serviceClass;

    const route = Object.keys(serviceClassConfigs).map((key, index) => ({
      link: index + 1,
      bu:
        serviceClassConfigs[key as keyof ServiceClassConfigs].find(
          (config) => config.serviceClass === serviceClass,
        )?.bu || 0,
    }));

    return {
      serviceClass,
      incomingLoad_a: ramEntry.incomingLoad_a,
      route,
    };
  });
};

// Runs Steps 1-5 of the proposed model given service classes that already
// carry their per-PM offered load (no traffic-load derivation). Reused by
// `proposedModel` below and by the "Try it" calculator.
export const calculateCloudCapacityBlockingProbabilities = (
  resourceCount: number,
  capacities: Capacities,
  serviceClasses: ServiceClassConfigs,
  rlaThreshold?: number,
) => {
  const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(
    capacities,
    serviceClasses,
  );

  const serviceClassConfigsLAR = {
    ram: serviceClasses.ram.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * resourceCount,
    })),
    processor: serviceClasses.processor.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * resourceCount,
    })),
    disk: serviceClasses.disk.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * resourceCount,
    })),
    bitrate: (serviceClasses.bitrate ?? []).map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * resourceCount,
    })),
  };

  const lar = calculateBlockingLAR(
    resourceCount,
    capacities,
    serviceClassConfigsLAR,
  );

  const relationR = calculateBlockingRatios(kaufmanRoberts, lar);

  const serviceClassesinRLA = calculateSeviceClassesForRLA(serviceClasses);

  const reducedLoadApproximation = processResultInRLA(
    capacities,
    serviceClassesinRLA,
    rlaThreshold,
  );

  const Ei = calculateEi(relationR, reducedLoadApproximation);

  return { kaufmanRoberts, lar, relationR, reducedLoadApproximation, Ei };
};

export const proposedModel = (
  resourceCount: number,
  capacities: Capacities,
  initialLoad: number,
  serviceClasses: ServiceClassConfigs,
) => {
  const trafficLoad = calculateTrafficLoad(
    initialLoad,
    capacities.ramCapacity.bu,
    serviceClasses.ram,
  );

  Object.keys(serviceClasses).forEach((category) => {
    const key = category as keyof ServiceClassConfigs;
    serviceClasses[key].forEach((item) => {
      if (trafficLoad[item.serviceClass] !== undefined) {
        item.incomingLoad_a = trafficLoad[item.serviceClass];
      }
    });
  });

  const { Ei } = calculateCloudCapacityBlockingProbabilities(
    resourceCount,
    capacities,
    serviceClasses,
  );

  return Ei;
};
