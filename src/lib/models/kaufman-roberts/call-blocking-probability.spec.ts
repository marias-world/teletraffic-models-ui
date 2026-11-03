import { callBlockingProbability } from "../kaufman-roberts/call-blocking-probability";
import { kaufmanRoberts } from "./kaufman-roberts-formula";
import { kaufmanRobertsWithSteps } from "./kaufman-roberts-with-steps";

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
      B_class_2: 0.3818985,
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
      B_class_1: 0.0366972,
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

describe("Call Blocking probability for a very large system (values overflow a double without rescaling)", () => {
  const capacity = 2000;
  const serviceClasses = [
    { serviceClass: 1, bu: 1, incomingLoad_a: 800 },
    { serviceClass: 2, bu: 10, incomingLoad_a: 60 },
    { serviceClass: 3, bu: 50, incomingLoad_a: 10 },
  ];

  it("matches the exact blocking probabilities", () => {
    const result = callBlockingProbability(capacity, serviceClasses);
    expect(result.B_class_1).toBeCloseTo(0.002497396, 6);
    expect(result.B_class_2).toBeCloseTo(0.02536615, 6);
    expect(result.B_class_3).toBeCloseTo(0.1347808, 6);
  });

  it("gives a valid probability distribution", () => {
    const q = Object.values(kaufmanRoberts(capacity, serviceClasses));
    expect(q).toHaveLength(capacity + 1);
    expect(q.every((v) => Number.isFinite(v) && v >= 0)).toBe(true);
    expect(q.reduce((a, v) => a + v, 0)).toBeCloseTo(1, 4);
  });

  it("works with the bandwidth reservation policy too", () => {
    const withBr = serviceClasses.map((c) => ({ ...c, tk: 0 }));
    const result = callBlockingProbability(capacity, withBr);
    expect(result.B_class_1).toBeCloseTo(0.002497396, 6);
    expect(result.B_class_3).toBeCloseTo(0.1347808, 6);
  });
});

describe("Show-calculation version for a very large system", () => {
  const classes = [
    { serviceClass: 1, bu: 1, incomingLoad_a: 800 },
    { serviceClass: 2, bu: 10, incomingLoad_a: 60 },
    { serviceClass: 3, bu: 50, incomingLoad_a: 10 },
  ];

  it("returns the same blocking and explains the scaling instead of listing 2000 steps", () => {
    const out = kaufmanRobertsWithSteps(2000, classes);
    expect(out.results.B_class_1).toBeCloseTo(0.002497396, 6);
    expect(out.results.B_class_3).toBeCloseTo(0.1347808, 6);
    expect(Number.isFinite(out.utilization.U)).toBe(true);
    expect(out.steps).toHaveLength(1);
    expect(out.steps[0].title).toContain("Large system");
  });

  it("still lists every step for a normal system", () => {
    const out = kaufmanRobertsWithSteps(10, classes);
    expect(out.steps).toHaveLength(3);
  });
});
