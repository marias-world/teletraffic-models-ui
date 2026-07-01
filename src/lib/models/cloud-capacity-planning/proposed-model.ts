import { ServiceClassWithRoute } from "../types";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../constants";
import { callBlockingProbability } from "../kaufman-roberts/call-blocking-probability";
import { blockingProbabilityLAR } from "../limited-availability-groups/blocking-probability";
import { callBlockingProbabilityinRLAForProposedModel } from "../reduced-load-approximation/reduced-load-approximation";
import { BlockingRatios, Capacities, ServiceClassConfigs } from "./types";

// Step 1: Calculate the blocking probabilities for each subsystem using the Kaufman-Roberts model
export const calculateSubsystemBlockingKaufmanRoberts = (
  capacities: Capacities,
  serviceClassConfigs: ServiceClassConfigs,
): BlockingRatios => {
  const { ramCapacity, processorCapacity, diskCapacity, bpsCapacity } =
    capacities;

  const { ram, processor, disk, bitrate } = serviceClassConfigs;
  const ramSubsystem = callBlockingProbability(ramCapacity.bu, ram);
  const processorSubsystem = callBlockingProbability(
    processorCapacity.bu,
    processor,
  );
  const diskSubsystem = callBlockingProbability(diskCapacity.bu, disk);
  const bitrateSubsystem = callBlockingProbability(bpsCapacity.bu, bitrate);

  return {
    RAM: ramSubsystem,
    Processor: processorSubsystem,
    Disk: diskSubsystem,
    Bps: bitrateSubsystem,
  };
};

// Step 2: Calculate the blocking probabilities using the Limited Available Resources model (LAR)
export const calculateBlockingLAR = (
  resourcesCount: number,
  capacities: Capacities,
  serviceClassConfigs: ServiceClassConfigs,
): BlockingRatios => {
  const { ramCapacity, processorCapacity, diskCapacity, bpsCapacity } =
    capacities;
  const { ram, processor, disk, bitrate } = serviceClassConfigs;

  const ramSubsystem = blockingProbabilityLAR(
    resourcesCount,
    ramCapacity.bu,
    ram,
  );
  const processorSubsystem = blockingProbabilityLAR(
    resourcesCount,
    processorCapacity.bu,
    processor,
  );
  const diskSubsystem = blockingProbabilityLAR(
    resourcesCount,
    diskCapacity.bu,
    disk,
  );
  const bitrateSubsystem = blockingProbabilityLAR(
    resourcesCount,
    bpsCapacity.bu,
    bitrate,
  );

  return {
    RAM: ramSubsystem,
    Processor: processorSubsystem,
    Disk: diskSubsystem,
    Bps: bitrateSubsystem,
  };
};

// Step 3: Calculate the relation R between the blocking probabilities of the Kaufman-Roberts model and the LAR model
export const calculateBlockingRatios = (
  kaufmanRoberts: BlockingRatios,
  lar: BlockingRatios,
): BlockingRatios => {
  const result: BlockingRatios = { RAM: {}, Processor: {}, Disk: {}, Bps: {} };

  for (const subsystem in kaufmanRoberts) {
    if (
      kaufmanRoberts.hasOwnProperty(subsystem) &&
      lar.hasOwnProperty(subsystem)
    ) {
      const krValues = kaufmanRoberts[subsystem as keyof BlockingRatios];
      const larValues = lar[subsystem as keyof BlockingRatios];

      result[subsystem as keyof BlockingRatios] = {};

      for (const className in krValues) {
        if (krValues.hasOwnProperty(className)) {
          const krValue = krValues[className];
          const larValue = larValues[className];

          if (isNaN(krValue) || isNaN(larValue)) {
            throw new Error(
              `krValue or larValue is NaN for ${subsystem} and ${className}`,
            );
          }

          result[subsystem as keyof BlockingRatios][className] =
            !isNaN(krValue) && !isNaN(larValue)
              ? parseFloat(
                  (larValue / krValue).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL),
                )
              : NaN;
        }
      }
    }
  }

  return result;
};

// Step 4: Apply the RLA model to calculate the blocking probability

enum Subsystem {
  "link1" = "RAM",
  "link2" = "Processor",
  "link3" = "Disk",
  "link4" = "Bps",
}

export const processResultInRLA = (
  capacities: Capacities,
  serviceClasses: ServiceClassWithRoute[],
): BlockingRatios => {
  const links = Object.values(capacities);
  const rla = callBlockingProbabilityinRLAForProposedModel(
    links,
    serviceClasses,
  );

  const result: BlockingRatios = { RAM: {}, Processor: {}, Disk: {}, Bps: {} };

  for (const key in rla) {
    const value = rla[key];

    const subsystem =
      Subsystem[key.match(/V_(link\d)/)?.[1] as keyof typeof Subsystem];
    const classMatch = key.match(/class_(\d+)/);
    if (classMatch) {
      const classKey = `B_class_${classMatch[1]}`; // Format as "B_class_X"
      result[subsystem][classKey] = value;
    }
  }

  return result;
};

// Step 5: Determine the blocking probabilities in the cloud for each service class
export const calculateEi = (
  relationR: BlockingRatios,
  reducedLoadApproximation: BlockingRatios,
): { [key: string]: number } => {
  const subsystems = ["RAM", "Processor", "Disk", "Bps"] as const;
  const result: { [key: string]: number } = {};

  if (relationR.RAM === undefined) {
    throw new Error("relationR.RAM is undefined");
  }

  const classes = Object.keys(relationR.RAM);

  classes.forEach((classKey) => {
    // Multiply values for each subsystem and class
    const multiplications = subsystems.map((subsystem) => {
      const relRValue = relationR[subsystem][classKey];
      const rlaValue = reducedLoadApproximation[subsystem][classKey];
      return relRValue * rlaValue;
    });

    // Calculate Ei for this class
    const Ei =
      1 - multiplications.reduce((product, value) => product * (1 - value), 1);
    result[classKey] = +Ei.toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL);
  });

  return result;
};
