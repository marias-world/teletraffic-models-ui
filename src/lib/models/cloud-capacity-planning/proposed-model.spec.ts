import {
  calculateSubsystemBlockingKaufmanRoberts,
  calculateBlockingLAR,
  calculateBlockingRatios,
  processResultInRLA,
  calculateEi,
} from "./proposed-model";
import {
  capacities,
  resourceCount,
  serviceClassConfigs,
  serviceClassConfigsLAR,
  serviceClasses,
} from "./test-data";

describe("Proposed model for IEEE", () => {
  const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(
    capacities,
    serviceClassConfigs,
  );
  const blockingLAR = calculateBlockingLAR(
    resourceCount,
    capacities,
    serviceClassConfigsLAR,
  );
  const relationR = calculateBlockingRatios(kaufmanRoberts, blockingLAR);
  const { result: reducedLoadApproximation } = processResultInRLA(
    capacities,
    serviceClasses,
  );
  const blockingProbability = calculateEi(relationR, reducedLoadApproximation);

  describe("Step 1: Kaufman-Roberts", () => {
    it("should return the blocking probabilities for each subsystem using the Kaufman-Roberts model", () => {
      expect(kaufmanRoberts).toEqual({
        RAM: {
          B_class_1: 0.1266412,
          B_class_2: 0.2646683,
          B_class_3: 0.4079467,
        },
        Processor: {
          B_class_1: 0.0779775,
          B_class_2: 0.1702896,
          B_class_3: 0.2753651,
        },
        Disk: {
          B_class_1: 0.1001191,
          B_class_2: 0.2140811,
          B_class_3: 0.3382891,
        },
        Bps: {
          B_class_1: 0.3240587,
          B_class_2: 0.3240587,
          B_class_3: 0.3240587,
        },
      });
    });
  });

  describe("Step 2: Limited Available Resources (LAR)", () => {
    it("should return the blocking probabilities using the Limited Available Resources model (LAR)", () => {
      expect(blockingLAR).toEqual({
        RAM: {
          B_class_1: 0.0368211,
          B_class_2: 0.1434586,
          B_class_3: 0.276791,
        },
        Processor: {
          B_class_1: 0.0133649,
          B_class_2: 0.0588798,
          B_class_3: 0.1264048,
        },
        Disk: {
          B_class_1: 0.0228647,
          B_class_2: 0.0949477,
          B_class_3: 0.1935143,
        },
        Bps: {
          B_class_1: 0.2461308,
          B_class_2: 0.2461308,
          B_class_3: 0.2461308,
        },
      });
    });
  });

  describe("Step 3: Calculate the relation R between the blocking probabilities of the Kaufman-Roberts model and the LAR model", () => {
    it("should return the relation R between the blocking probabilities of the Kaufman-Roberts model and the LAR model", () => {
      expect(relationR).toEqual({
        RAM: {
          B_class_1: 0.2907514,
          B_class_2: 0.5420317,
          B_class_3: 0.678498,
        },
        Processor: {
          B_class_1: 0.1713943,
          B_class_2: 0.3457627,
          B_class_3: 0.4590444,
        },
        Disk: {
          B_class_1: 0.228375,
          B_class_2: 0.4435128,
          B_class_3: 0.5720382,
        },
        Bps: {
          B_class_1: 0.7595254,
          B_class_2: 0.7595254,
          B_class_3: 0.7595254,
        },
      });
    });
  });

  describe("Step 4: Reduced Load Approximation ", () => {
    it("should return the blocking probabilities in the reduced load approximation", () => {
      expect(reducedLoadApproximation).toEqual({
        RAM: {
          B_class_1: 0.05370805700264812,
          B_class_2: 0.12547165008207672,
          B_class_3: 0.216925032738696,
        },
        Processor: {
          B_class_1: 0.018455164663592823,
          B_class_2: 0.04643810230394761,
          B_class_3: 0.08728444668800578,
        },
        Disk: {
          B_class_1: 0.03154721665356952,
          B_class_2: 0.07679060750015707,
          B_class_3: 0.13902312106968032,
        },
        Bps: {
          B_class_1: 0.24032865065109082,
          B_class_2: 0.24032865065109082,
          B_class_3: 0.24032865065109082,
        },
      });
    });
  });

  describe("Step 5: Calculate the blocking probability for the proposed model", () => {
    it("should return the blocking probability for the proposed model", () => {
      expect(blockingProbability).toEqual({
        B_class_1: 0.2036255,
        B_class_2: 0.275895,
        B_class_3: 0.3840059,
      });
    });
  });
});
