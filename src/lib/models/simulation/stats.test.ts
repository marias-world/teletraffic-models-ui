import { describe, it, expect } from "vitest";
import { confidenceHalfWidth95, meanAndStdev, tCritical95 } from "./stats";
import { replicateErlangBSimulation } from "./erlang-b-simulation";
import { replicateEmlmSimulation } from "./emlm-simulation";
import { DEFAULT_SEEDS } from "./seeds";
import { recursiveErlangB } from "../erlang-b";
import { kaufmanRoberts } from "../kaufman-roberts/kaufman-roberts-formula";
import { callBlockingProbability } from "../kaufman-roberts/call-blocking-probability";

describe("tCritical95", () => {
  it("matches the standard Student-t table", () => {
    expect(tCritical95(1)).toBe(12.706);
    expect(tCritical95(4)).toBe(2.776);
    expect(tCritical95(9)).toBe(2.262);
    expect(tCritical95(29)).toBe(2.045);
    expect(tCritical95(30)).toBe(2.042);
  });

  it("falls back to the normal value for large samples", () => {
    expect(tCritical95(31)).toBe(1.96);
    expect(tCritical95(1000)).toBe(1.96);
  });

  it("is undefined below one degree of freedom", () => {
    expect(tCritical95(0)).toBeNaN();
    expect(tCritical95(-3)).toBeNaN();
  });
});

describe("confidenceHalfWidth95", () => {
  it("is t * s / sqrt(n)", () => {
    // n = 10 -> df = 9 -> t = 2.262
    expect(confidenceHalfWidth95(0.01, 10)).toBeCloseTo(
      (2.262 * 0.01) / Math.sqrt(10),
      12,
    );
    // about 0.72 of the stdev for 10 seeds
    expect(confidenceHalfWidth95(1, 10)).toBeCloseTo(0.7153, 3);
  });

  it("is zero when every replication agrees and undefined for one", () => {
    expect(confidenceHalfWidth95(0, 10)).toBe(0);
    expect(confidenceHalfWidth95(0.5, 1)).toBeNaN();
    expect(confidenceHalfWidth95(0.5, 0)).toBeNaN();
  });

  it("agrees with meanAndStdev on a worked example", () => {
    const values = [0.28, 0.29, 0.285, 0.283, 0.287];
    const { stdev } = meanAndStdev(values);
    expect(confidenceHalfWidth95(stdev, values.length)).toBeCloseTo(
      (2.776 * stdev) / Math.sqrt(5),
      12,
    );
  });
});

describe("confidence intervals in the replication summaries", () => {
  // Follows the number of default seeds, so changing it needs no test edits.
  const n = DEFAULT_SEEDS.length;
  const t = tCritical95(n - 1);

  it("Erlang-B: blockingCi95 follows t * stdev / sqrt(n) and covers the analytical value", () => {
    const params = {
      arrivalRate: 5,
      serviceRate: 1,
      capacity: 5,
      numCallsToSimulate: 100_000,
    };
    const summary = replicateErlangBSimulation(DEFAULT_SEEDS, params);
    expect(summary.blockingCi95).toBeCloseTo(
      (t * summary.blockingStdev) / Math.sqrt(n),
      12,
    );
    const analytical = recursiveErlangB(5, 5).result;
    expect(Math.abs(summary.blockingMean - analytical)).toBeLessThanOrEqual(
      summary.blockingCi95,
    );
    expect(summary.qCi95).toHaveLength(summary.qMean.length);
  });

  it("EMLM: every class's interval is finite and covers the analytical blocking", () => {
    const capacity = 10;
    const classes = [
      { bu: 1, offeredLoad: 4, serviceRate: 1 },
      { bu: 3, offeredLoad: 2, serviceRate: 1 },
    ];
    const summary = replicateEmlmSimulation(DEFAULT_SEEDS, {
      capacity,
      serviceClasses: classes,
      numCallsToSimulate: 100_000,
    });
    const model = classes.map((c, i) => ({
      serviceClass: i + 1,
      bu: c.bu,
      incomingLoad_a: c.offeredLoad,
    }));
    const analytical = callBlockingProbability(capacity, model);
    classes.forEach((_, k) => {
      expect(Number.isFinite(summary.classBlockingCi95[k])).toBe(true);
      expect(summary.classBlockingCi95[k]).toBeCloseTo(
        (t * summary.classBlockingStdev[k]) / Math.sqrt(n),
        12,
      );
      expect(
        Math.abs(summary.classBlockingMean[k] - analytical[`B_class_${k + 1}`]),
      ).toBeLessThanOrEqual(summary.classBlockingCi95[k]);
    });
    expect(kaufmanRoberts(capacity, model)["q(0)"]).toBeGreaterThan(0);
  });
});
