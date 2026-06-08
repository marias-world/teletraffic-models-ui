import { unnormalisedLARModel } from "./limited-available-resources-model";

describe("LimitedAvailableResourcesModel", () => {
  describe.each([
    {
      description: "no service classes provided",
      distinctResourceCount: 2,
      individualResourceCapacity: 5,
      serviceClasses: [],
      expectedUnormalisedValue: [],
    },
    {
      description: "1 service class provided",
      distinctResourceCount: 2,
      individualResourceCapacity: 5,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 1,
        },
      ],
      expectedUnormalisedValue: [
        1,
        1,
        0.5,
        0.16666666666666666, // 1/6
        0.041666666666666664, // 1/24
        0.008333333333333333, // 1/120
        0.0013888888888888887, // 1/720
        0.00019841269841269839, // 1/5040
        0.000024801587301587298, // 1/40320
        0.0000027557319223985884, // 1/362880
        2.7557319223985883e-7, // 1/3628800
      ],
    },
  ])(
    `When $description`,
    ({
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses,
      expectedUnormalisedValue,
    }) => {
      it(`should return ${expectedUnormalisedValue}`, () => {
        const result = unnormalisedLARModel(
          distinctResourceCount,
          individualResourceCapacity,
          serviceClasses,
        );
        expect(result).toEqual(expectedUnormalisedValue);
      });
    },
  );
});
