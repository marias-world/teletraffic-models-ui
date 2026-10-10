import { describe, it, expect } from "vitest";
import { mulberry32 } from "./random";
import {
  makeServiceSampler,
  SERVICE_DISTRIBUTIONS,
  ServiceDistribution,
} from "./service-time-distributions";

function sampleStats(dist: ServiceDistribution, rate: number, n: number) {
  const sample = makeServiceSampler(dist, mulberry32(7), rate);
  const draws = Array.from({ length: n }, () => sample());
  const mean = draws.reduce((sum, x) => sum + x, 0) / n;
  // Two passes, not E[X^2] - mean^2, which loses precision to cancellation.
  const variance = draws.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
  return { mean, cv: Math.sqrt(variance) / mean };
}

describe("makeServiceSampler", () => {
  const rate = 2.5;

  it.each(SERVICE_DISTRIBUTIONS.map((d) => d.value))(
    "%s has mean 1/rate",
    (dist) => {
      const { mean } = sampleStats(dist, rate, 200_000);
      expect(mean).toBeGreaterThan((1 / rate) * 0.98);
      expect(mean).toBeLessThan((1 / rate) * 1.02);
    },
  );

  it("orders the coefficient of variation: deterministic < Erlang-2 < exponential < hyperexponential", () => {
    const cv = (d: ServiceDistribution) => sampleStats(d, rate, 200_000).cv;
    expect(cv("deterministic")).toBeCloseTo(0, 9);
    expect(cv("erlang2")).toBeGreaterThan(0.65);
    expect(cv("erlang2")).toBeLessThan(0.76);
    expect(cv("exponential")).toBeGreaterThan(0.95);
    expect(cv("exponential")).toBeLessThan(1.05);
    expect(cv("hyperexponential")).toBeGreaterThan(1.15);
    expect(cv("hyperexponential")).toBeLessThan(1.3);
  });

  it("is deterministic for a given seed", () => {
    const a = makeServiceSampler("lognormal", mulberry32(3), rate);
    const b = makeServiceSampler("lognormal", mulberry32(3), rate);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("throws on an unknown distribution", () => {
    expect(() =>
      makeServiceSampler("weibull" as ServiceDistribution, mulberry32(1), rate),
    ).toThrow();
  });
});
