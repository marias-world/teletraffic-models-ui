import { describe, it, expect } from "vitest";
import { recursiveErlangB } from "./erlang-b";

const PRECISION = 7;

describe("recursiveErlangB", () => {
  describe("base case", () => {
    it("returns 1 when capacity is 0", () => {
      expect(recursiveErlangB(0, 1).result).toBe(1);
    });

    it("includes B(0) = 1 as the first step", () => {
      expect(recursiveErlangB(0, 5).steps[0]).toBe("B(0) = 1");
    });
  });

  describe("zero traffic", () => {
    it("returns 0 blocking probability when traffic is 0", () => {
      expect(recursiveErlangB(5, 0).result).toBe(0);
    });
  });

  describe("known values", () => {
    it.each([
      { capacity: 1, traffic: 1, expected: 0.5 },
      { capacity: 2, traffic: 1, expected: 0.2 },
      { capacity: 3, traffic: 1, expected: 0.0625 },
      { capacity: 2, traffic: 2, expected: 0.4 },
      { capacity: 1, traffic: 10, expected: 10 / 11 },
    ])(
      "B($capacity, $traffic) ≈ $expected",
      ({ capacity, traffic, expected }) => {
        const { result } = recursiveErlangB(capacity, traffic);
        expect(result).toBeCloseTo(expected, PRECISION);
      },
    );
  });

  describe("steps", () => {
    it("produces one step per capacity level", () => {
      const capacity = 4;
      const { steps } = recursiveErlangB(capacity, 1);
      // one step for B(0), one for each level up to capacity
      expect(steps).toHaveLength(capacity + 1);
    });

    it("steps are in ascending order from B(0) to B(capacity)", () => {
      const { steps } = recursiveErlangB(3, 2);
      expect(steps[0]).toMatch(/^B\(0\)/);
      expect(steps[1]).toMatch(/^B\(1\)/);
      expect(steps[2]).toMatch(/^B\(2\)/);
      expect(steps[3]).toMatch(/^B\(3\)/);
    });
  });

  describe("monotonicity", () => {
    it("blocking probability increases as traffic increases (fixed capacity)", () => {
      const capacity = 5;
      const low = recursiveErlangB(capacity, 1).result;
      const high = recursiveErlangB(capacity, 10).result;
      expect(high).toBeGreaterThan(low);
    });

    it("blocking probability decreases as capacity increases (fixed traffic)", () => {
      const traffic = 5;
      const small = recursiveErlangB(3, traffic).result;
      const large = recursiveErlangB(10, traffic).result;
      expect(large).toBeLessThan(small);
    });
  });
});
