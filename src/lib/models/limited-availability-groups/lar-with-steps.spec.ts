import { lagWithSteps } from "./lar-with-steps";
import { blockingProbabilityLAR } from "./blocking-probability";
import { calculateLinkUtilization } from "./link-utilization";

describe("lagWithSteps", () => {
  it("returns empty results when there are no service classes", () => {
    expect(lagWithSteps(2, 5, [])).toEqual({
      results: {},
      utilization: { U: 0, efficiency: 0 },
      steps: [],
    });
  });

  it("matches blockingProbabilityLAR and calculateLinkUtilization for 2 service classes", () => {
    const distinctResourceCount = 2;
    const individualResourceCapacity = 5;
    const serviceClasses = [
      { serviceClass: 1, bu: 1, incomingLoad_a: 1 },
      { serviceClass: 2, bu: 2, incomingLoad_a: 1 },
    ];

    const { results, utilization, steps } = lagWithSteps(
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses,
    );

    expect(results).toEqual(
      blockingProbabilityLAR(
        distinctResourceCount,
        individualResourceCapacity,
        serviceClasses,
      ),
    );

    const expectedU = calculateLinkUtilization(
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses,
    );
    expect(utilization.U).toEqual(expectedU);
    expect(utilization.efficiency).toEqual(
      (expectedU / (distinctResourceCount * individualResourceCapacity)) * 100,
    );

    expect(steps).toHaveLength(3);
    expect(steps[0].title).toContain("Step 1");
    expect(steps[1].title).toContain("Step 2");
    expect(steps[2].title).toContain("Step 3");
    expect(steps[0].formulas[0]).toBe("q(0) = 1 \\quad \\text{(base case)}");
  });

  it("reduces to Kaufman-Roberts when ell = 1", () => {
    const { results } = lagWithSteps(1, 5, [
      { serviceClass: 1, bu: 1, incomingLoad_a: 2 },
    ]);

    expect(results).toEqual(blockingProbabilityLAR(1, 5, [
      { serviceClass: 1, bu: 1, incomingLoad_a: 2 },
    ]));
    expect(results.B_class_1).toBeCloseTo(0.0366972, 6);
  });
});
