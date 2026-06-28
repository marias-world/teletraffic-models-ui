import { lagModelResult, lagWithSteps } from "./lar-with-steps";
import { blockingProbabilityLAR } from "./blocking-probability";

// Helper to assert a value is a valid probability
const expectProbability = (v: number) => {
  expect(v).toBeGreaterThanOrEqual(0);
  expect(v).toBeLessThanOrEqual(1);
};

describe("LAG model integration", () => {
  describe("ℓ=1 reduces to Kaufman-Roberts", () => {
    it("single class, bu=1, a=2, C=5 matches KR blocking", () => {
      const serviceClasses = [{ serviceClass: 1, bu: 1, incomingLoad_a: 2 }];
      const { results } = lagModelResult(1, 5, serviceClasses);
      const kr = blockingProbabilityLAR(1, 5, serviceClasses);
      expect(results.B_class_1).toBeCloseTo(kr.B_class_1, 6);
    });

    it("two classes, bu=1/2, a=1/1, C=5 matches KR blocking", () => {
      const serviceClasses = [
        { serviceClass: 1, bu: 1, incomingLoad_a: 1 },
        { serviceClass: 2, bu: 2, incomingLoad_a: 1 },
      ];
      const { results } = lagModelResult(1, 5, serviceClasses);
      const kr = blockingProbabilityLAR(1, 5, serviceClasses);
      expect(results.B_class_1).toBeCloseTo(kr.B_class_1, 6);
      expect(results.B_class_2).toBeCloseTo(kr.B_class_2, 6);
    });
  });

  describe("ℓ=3, C=10 — previously crashing inputs", () => {
    const serviceClasses = [
      { serviceClass: 1, bu: 1, incomingLoad_a: 13 },
      { serviceClass: 2, bu: 5, incomingLoad_a: 2 },
    ];

    it("does not throw", () => {
      expect(() => lagModelResult(3, 10, serviceClasses)).not.toThrow();
    });

    it("returns valid blocking probabilities in [0, 1]", () => {
      const { results } = lagModelResult(3, 10, serviceClasses);
      expectProbability(results.B_class_1);
      expectProbability(results.B_class_2);
    });

    it("returns positive utilization within total capacity", () => {
      const { utilization } = lagModelResult(3, 10, serviceClasses);
      expect(utilization.U).toBeGreaterThan(0);
      expect(utilization.U).toBeLessThanOrEqual(3 * 10);
    });
  });

  describe("lagModelResult and lagWithSteps agree for small inputs", () => {
    const ell = 2;
    const C = 5;
    const serviceClasses = [
      { serviceClass: 1, bu: 1, incomingLoad_a: 1 },
      { serviceClass: 2, bu: 2, incomingLoad_a: 1 },
    ];

    it("blocking probabilities match", () => {
      const { results: fast } = lagModelResult(ell, C, serviceClasses);
      const { results: stepped } = lagWithSteps(ell, C, serviceClasses);
      expect(fast.B_class_1).toBeCloseTo(stepped.B_class_1, 5);
      expect(fast.B_class_2).toBeCloseTo(stepped.B_class_2, 5);
    });

    it("link utilization matches", () => {
      const { utilization: fast } = lagModelResult(ell, C, serviceClasses);
      const { utilization: stepped } = lagWithSteps(ell, C, serviceClasses);
      expect(fast.U).toBeCloseTo(stepped.U, 5);
    });
  });

  describe("higher traffic load → higher blocking", () => {
    it("doubling offered load increases blocking probability", () => {
      const base = [{ serviceClass: 1, bu: 2, incomingLoad_a: 1 }];
      const heavy = [{ serviceClass: 1, bu: 2, incomingLoad_a: 5 }];
      const { results: r1 } = lagModelResult(2, 5, base);
      const { results: r2 } = lagModelResult(2, 5, heavy);
      expect(r2.B_class_1).toBeGreaterThan(r1.B_class_1);
    });
  });

  describe("larger capacity → lower blocking", () => {
    it("increasing C reduces blocking probability for the same traffic", () => {
      const serviceClasses = [{ serviceClass: 1, bu: 2, incomingLoad_a: 4 }];
      const { results: small } = lagModelResult(2, 4, serviceClasses);
      const { results: large } = lagModelResult(2, 8, serviceClasses);
      expect(large.B_class_1).toBeLessThan(small.B_class_1);
    });
  });

  describe("edge cases", () => {
    it("empty service classes returns empty results", () => {
      expect(lagModelResult(2, 5, [])).toEqual({
        results: {},
        utilization: { U: 0, efficiency: 0 },
      });
    });

    it("zero subgroups returns empty results", () => {
      expect(
        lagModelResult(0, 5, [{ serviceClass: 1, bu: 1, incomingLoad_a: 1 }]),
      ).toEqual({
        results: {},
        utilization: { U: 0, efficiency: 0 },
      });
    });

    it("single slot, single class fills entirely → blocking near 1 at saturation", () => {
      // ℓ=1, C=1, bu=1, a=100: almost all calls blocked
      const { results } = lagModelResult(1, 1, [
        { serviceClass: 1, bu: 1, incomingLoad_a: 100 },
      ]);
      expect(results.B_class_1).toBeGreaterThan(0.98);
    });
  });
});
