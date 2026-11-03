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
      expectedUnormalisedValue: [
        1, 2, 3, 3.3333333333333335, 3.166666666666667,
      ],
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
        "q(3)": 0.26666666666666666,
        "q(4)": 0.25333333333333335,
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
        "q(0)": 0.0005825220335620224,
        "q(1)": 0.0023300881342480898,
        "q(2)": 0.0064077423691822465,
        "q(3)": 0.01436887682786322,
        "q(4)": 0.02805814461657075,
        "q(5)": 0.049242529237109624,
        "q(6)": 0.0795272025152952,
        "q(7)": 0.11991262292781656,
        "q(8)": 0.1705626825864973,
        "q(9)": 0.23065108888367758,
        "q(10)": 0.2983564998681774,
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
        "q(0)": 0.10714285714285714,
        "q(1)": 0.21428571428571427,
        "q(2)": 0.3214285714285714,
        "q(3)": 0.35714285714285715,
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
        "q(0)": 0.3333333333333333,
        "q(1)": 0.6666666666666666,
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
