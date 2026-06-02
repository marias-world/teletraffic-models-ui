import { callBlockingProbability } from "../kaufman-roberts/call-blocking-probability";

describe("Call Blocking probability with 1 service class - complete sharing policy", () => {
  const capacity = 10;
  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 1,
    },
  ];

  it("should calculate the CBP for the system", () => {
    const result = callBlockingProbability(capacity, serviceClasses);
    expect(result).toEqual({
      B_class_1: 0.0000001,
    });
  });
});

describe("Call Blocking probability with 2 service classes - complete sharing policy", () => {
  const capacity = 5;
  const serviceClasses = [
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
  ];

  it("should calculate the CBP for the system", () => {
    const result = callBlockingProbability(capacity, serviceClasses);
    expect(result).toEqual({
      B_class_1: 0.1721854,
      B_class_2: 0.3818984,
    });
  });
});

describe.each([
  {
    description: "1 service class, 1 bu",
    capacity: 5,
    serviceClasses: [
      {
        serviceClass: 1,
        bu: 1,
        incomingLoad_a: 2,
      },
    ],
    expected: {
      B_class_1: 0.0366973,
    },
  },
  {
    description: "1 service classes, 2 bu",
    capacity: 5,
    serviceClasses: [
      {
        serviceClass: 1,
        bu: 2,
        incomingLoad_a: 2,
      },
    ],
    expected: {
      B_class_1: 0.4,
    },
  },
])(
  "Call Blocking probability - complete sharing policy",
  ({ capacity, serviceClasses, expected }) => {
    it("should calculate the CBP for the system", () => {
      // should give the same results as the Limited availability model
      const result = callBlockingProbability(capacity, serviceClasses);
      expect(result).toEqual(expected);
    });
  },
);

describe("Call Blocking probability - bandwidth reservation policy", () => {
  const capacity = 5;
  const serviceClasses = [
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
  ];

  it("should calculate the CBP for the system", () => {
    const result = callBlockingProbability(capacity, serviceClasses);
    expect(result).toEqual({
      B_class_1: 0.3253012,
      B_class_2: 0.3253012,
    });
  });
});
