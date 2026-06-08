import { blockingProbabilityLAR } from "./blocking-probability";
describe("blocking probability", () => {
  describe("LAR model blocking propability", () => {
    describe.each([
      {
        description: "1 service class with bu 1 and incoming load 1",
        distinctResourceCount: 2,
        individualResourceCapacity: 5,
        serviceClasses: [{ serviceClass: 1, bu: 1, incomingLoad_a: 1 }],
        expectedBlocking: {
          B_class_1: 0.0000001,
        },
      },
      {
        description: "1 service class with bu 2 and incoming load 1",
        distinctResourceCount: 2,
        individualResourceCapacity: 5,
        serviceClasses: [{ serviceClass: 1, bu: 2, incomingLoad_a: 1 }],
        expectedBlocking: {
          B_class_1: 0.0071648,
        },
      },
      {
        description: "2 service classes",
        distinctResourceCount: 2,
        individualResourceCapacity: 5,
        serviceClasses: [
          { serviceClass: 1, bu: 1, incomingLoad_a: 1 },
          { serviceClass: 2, bu: 2, incomingLoad_a: 1 },
        ],
        expectedBlocking: {
          B_class_1: 0.0036756,
          B_class_2: 0.0203967,
        },
      },
      {
        description: "1 service class, 1 bu",
        distinctResourceCount: 1,
        individualResourceCapacity: 5,
        serviceClasses: [{ serviceClass: 1, bu: 1, incomingLoad_a: 2 }],
        expectedBlocking: {
          B_class_1: 0.0366972,
        },
      },
      {
        description: "1 service class, 2 bu",
        distinctResourceCount: 1,
        individualResourceCapacity: 5,
        serviceClasses: [{ serviceClass: 1, bu: 2, incomingLoad_a: 2 }],
        expectedBlocking: {
          B_class_1: 0.4,
        },
      },
    ])(
      "when $description",
      ({
        distinctResourceCount,
        individualResourceCapacity,
        serviceClasses,
        expectedBlocking,
      }) => {
        it("should calculate correctly the blocking probability for the system", () => {
          const result = blockingProbabilityLAR(
            distinctResourceCount,
            individualResourceCapacity,
            serviceClasses,
          );
          expect(result).toEqual(expectedBlocking);
        });
      },
    );
  });
});
