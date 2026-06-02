import {
  kaufmanRoberts,
  unnormalisedKaufmanRobertsFormula,
} from "../kaufman-roberts/kaufman-roberts-formula";

describe("Kaufman Roberts Formulas", () => {
  describe.each([
    {
      description: "no service classes provided",
      capacity: 4,
      serviceClasses: [],
      expectedUnormalisedValue: [],
    },
    {
      description: "0 bu are occupied [base case] q(j) = 0, then q(0) = 1",
      capacity: 0,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
      ],
      expectedUnormalisedValue: [1],
    },
    {
      description:
        "less than 0 bu are occupied meaning q(j) = -1, then q(-1) = 0",
      capacity: -1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
      ],
      expectedUnormalisedValue: [],
    },
    {
      description: "2 different service classes provided",
      capacity: 4,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
      ],
      expectedUnormalisedValue: [1, 2, 3, 3.3333333, 3.1666667],
    },
  ])(
    `When $description`,
    ({ capacity, serviceClasses, expectedUnormalisedValue }) => {
      it(`should return ${expectedUnormalisedValue}`, () => {
        const result = unnormalisedKaufmanRobertsFormula(
          capacity,
          serviceClasses,
        );
        expect(result).toEqual(expectedUnormalisedValue);
      });
    },
  );
});

describe("Kaufman Roberts normalised formula in complete sharing policy", () => {
  describe.each([
    {
      description: "no service classes provided",
      capacity: 4,
      serviceClasses: [],
      expectedValue: {},
    },
    {
      description: "2 different service classes provided",
      capacity: 4,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
      ],
      expectedValue: {
        "q(0)": 0.08,
        "q(1)": 0.16,
        "q(2)": 0.24,
        "q(3)": 0.2666667,
        "q(4)": 0.2533333,
      },
    },
    {
      description:
        "4 different service classes provided with system total capacity of 10bu",
      capacity: 10,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 4,
          incomingLoad_a: 1,
        },
        {
          serviceClass: 2,
          bu: 3,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 3,
          bu: 2,
          incomingLoad_a: 3,
        },
        {
          serviceClass: 4,
          bu: 1,
          incomingLoad_a: 4,
        },
      ],
      expectedValue: {
        "q(0)": 0.0005825,
        "q(1)": 0.0023301,
        "q(2)": 0.0064077,
        "q(3)": 0.0143689,
        "q(4)": 0.0280581,
        "q(5)": 0.0492425,
        "q(6)": 0.0795272,
        "q(7)": 0.1199126,
        "q(8)": 0.1705627,
        "q(9)": 0.2306511,
        "q(10)": 0.2983565,
      },
    },
    {
      description:
        "3 different service classes provided and the 3rd service class has no incoming traffic load",
      capacity: 3,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
        {
          serviceClass: 3,
          bu: 2,
          incomingLoad_a: 0,
        },
      ],
      expectedValue: {
        "q(0)": 0.1071429,
        "q(1)": 0.2142857,
        "q(2)": 0.3214286,
        "q(3)": 0.3571429,
      },
    },
    {
      description:
        "2 different service classes provided, the second one has a higher bu than the system capacity",
      capacity: 1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 2,
        },
        {
          serviceClass: 2,
          bu: 5,
          incomingLoad_a: 3,
        },
      ],
      expectedValue: {
        "q(0)": 0.3333333,
        "q(1)": 0.6666667,
      },
    },
    {
      description:
        "1 service class, that has a higher bu than the system capacity",
      capacity: 1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 5,
          incomingLoad_a: 3,
        },
      ],
      expectedValue: {
        "q(0)": 1,
        "q(1)": 0,
      },
    },
  ])(`When $description`, ({ capacity, serviceClasses, expectedValue }) => {
    it(`should return expected normalised probabilities`, () => {
      const result = kaufmanRoberts(capacity, serviceClasses);
      expect(result).toEqual(expectedValue);
    });
  });
});
