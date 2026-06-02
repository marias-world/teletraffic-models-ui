import {
  linkUtilization_U,
  meanNumberOfCallsInSystem,
  meanNumberOfCallsInSystemInState_J,
} from "../kaufman-roberts/link-utilization";
describe("link-utilization", () => {
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

  it("should calculate the link utilization U for the system", () => {
    const result = linkUtilization_U(capacity, serviceClasses);
    expect(result).toEqual("2.8918318 b.u");
  });
});

describe("mean-number-of-calls-in-system-in-state-J", () => {
  const capacity = 5;
  describe.each([
    {
      description:
        "when state_j > bu, calculate the mean number of in-service calls when the system is in state_j= 5, full",
      state_j: 5,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 1,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
      ],
      expected: {
        "y_1(5)": 1.54,
        "y_2(5)": 1.73,
      },
    },
    {
      description:
        "when state_j > bu, calculate the mean number of in-service calls when the system is in state_j= 1",
      state_j: 1,
      serviceClasses: [
        {
          serviceClass: 1,
          bu: 1,
          incomingLoad_a: 1,
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
        },
      ],
      expected: {
        "y_1(1)": 1,
        "y_2(1)": 0,
      },
    },
  ])(
    "Given a state_J, $description",
    ({ expected, serviceClasses, state_j }) => {
      it("should calculate the mean number of calls in the system in specified state J", () => {
        const result = meanNumberOfCallsInSystemInState_J(
          capacity,
          serviceClasses,
          state_j,
        );
        expect(result).toEqual(expected);
      });
    },
  );
});

describe("mean-number-of-calls-in-system", () => {
  const capacity = 5;
  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 1,
    },
    {
      serviceClass: 2,
      bu: 2,
      incomingLoad_a: 1,
    },
  ];

  it("should calculate the mean number of calls in the system", () => {
    const result = meanNumberOfCallsInSystem(capacity, serviceClasses);
    expect(result).toEqual({
      n_1: 0.8949,
      n_2: 0.7296,
    });
  });
});
