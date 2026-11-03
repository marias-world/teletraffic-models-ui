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
        "q(0)": 0.0923076923076923,
        "q(1)": 0.1846153846153846,
        "q(2)": 0.2769230769230769,
        "q(3)": 0.3076923076923077,
        "q(4)": 0.13846153846153844,
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
        "q(0)": 0.0011251014265541972,
        "q(1)": 0.004500405706216789,
        "q(2)": 0.01237611569209617,
        "q(3)": 0.027752501855003536,
        "q(4)": 0.05419238537902717,
        "q(5)": 0.0951085739247148,
        "q(6)": 0.15360134697857133,
        "q(7)": 0.23160302159382162,
        "q(8)": 0.2136286333669782,
        "q(9)": 0.14467137528558746,
        "q(10)": 0.06144053879142854,
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
        "q(0)": 0.13636363636363638,
        "q(1)": 0.27272727272727276,
        "q(2)": 0.4090909090909091,
        "q(3)": 0.18181818181818182,
      },
    },
  ])(`When $description`, ({ capacity, serviceClasses, expectedValue }) => {
    it(`should return expected normalised probabilities`, () => {
      const result = robertsFormulaBRPolicy(capacity, serviceClasses);
      expect(result).toEqual(expectedValue);
    });
  });
});
