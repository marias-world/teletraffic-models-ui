import { robertsFormulaBRPolicy } from "../kaufman-roberts/roberts-formula-br-policy";

describe("Erland Multirate Loss Model under BR policy = Roberts Formula", () => {
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
          tk: 1,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
          tk: 0,
        },
      ],
      expectedValue: {
        "q(0)": 0.0923077,
        "q(1)": 0.1846154,
        "q(2)": 0.2769231,
        "q(3)": 0.3076923,
        "q(4)": 0.1384615,
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
          tk: 0,
        },
        {
          serviceClass: 2,
          bu: 3,
          incomingLoad_a: 2,
          tk: 1,
        },
        {
          serviceClass: 3,
          bu: 2,
          incomingLoad_a: 3,
          tk: 2,
        },
        {
          serviceClass: 4,
          bu: 1,
          incomingLoad_a: 4,
          tk: 3,
        },
      ],
      expectedValue: {
        "q(0)": 0.0011251,
        "q(1)": 0.0045004,
        "q(2)": 0.0123761,
        "q(3)": 0.0277525,
        "q(4)": 0.0541924,
        "q(5)": 0.0951086,
        "q(6)": 0.1536013,
        "q(7)": 0.231603,
        "q(8)": 0.2136286,
        "q(9)": 0.1446714,
        "q(10)": 0.0614405,
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
          tk: 1,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
          tk: 0,
        },
        {
          serviceClass: 3,
          bu: 2,
          incomingLoad_a: 0,
          tk: 0,
        },
      ],
      expectedValue: {
        "q(0)": 0.1363636,
        "q(1)": 0.2727273,
        "q(2)": 0.4090909,
        "q(3)": 0.1818182,
      },
    },
  ])(`When $description`, ({ capacity, serviceClasses, expectedValue }) => {
    it(`should return expected normalised probabilities`, () => {
      const result = robertsFormulaBRPolicy(capacity, serviceClasses);
      expect(result).toEqual(expectedValue);
    });
  });
});
