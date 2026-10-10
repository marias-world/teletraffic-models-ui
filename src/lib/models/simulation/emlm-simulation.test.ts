import { describe, it, expect } from "vitest";
import {
  runEmlmSimulation,
  replicateEmlmSimulation,
  aggregateEmlmRuns,
  EmlmServiceClassParams,
} from "./emlm-simulation";
import { SERVICE_DISTRIBUTIONS } from "./service-time-distributions";
import { kaufmanRoberts } from "../kaufman-roberts/kaufman-roberts-formula";
import { callBlockingProbability } from "../kaufman-roberts/call-blocking-probability";
import { recursiveErlangB } from "../erlang-b";

const capacity = 10;
const classes: EmlmServiceClassParams[] = [
  { bu: 1, offeredLoad: 4, serviceRate: 1 },
  { bu: 3, offeredLoad: 2, serviceRate: 1 },
];
const baseParams = {
  capacity,
  serviceClasses: classes,
  numCallsToSimulate: 100_000,
};

function analytical(cap: number, sc: EmlmServiceClassParams[]) {
  const model = sc.map((c, i) => ({
    serviceClass: i + 1,
    bu: c.bu,
    incomingLoad_a: c.offeredLoad,
  }));
  const qByState = kaufmanRoberts(cap, model);
  const blocking = callBlockingProbability(cap, model);
  return {
    q: Array.from({ length: cap + 1 }, (_, j) => qByState[`q(${j})`]),
    blocking: sc.map((_, k) => blocking[`B_class_${k + 1}`]),
  };
}

describe("runEmlmSimulation", () => {
  it("is deterministic for a given seed", () => {
    const a = runEmlmSimulation({ ...baseParams, seed: 42 });
    const b = runEmlmSimulation({ ...baseParams, seed: 42 });
    expect(a).toEqual(b);
  });

  it("produces different results for different seeds", () => {
    const a = runEmlmSimulation({ ...baseParams, seed: 1 });
    const b = runEmlmSimulation({ ...baseParams, seed: 2 });
    expect(a.classBlocking[0]).not.toBe(b.classBlocking[0]);
  });

  it("q has one entry per state 0..capacity and sums to 1", () => {
    const { q } = runEmlmSimulation({ ...baseParams, seed: 7 });
    expect(q).toHaveLength(capacity + 1);
    expect(q.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });

  it("reports consistent per-class counts and bounded blocking and utilization", () => {
    const run = runEmlmSimulation({ ...baseParams, seed: 7 });
    expect(run.classBlocking).toHaveLength(classes.length);
    classes.forEach((_, k) => {
      expect(run.classAccepted[k] + run.classBlocked[k]).toBe(
        run.classOffered[k],
      );
      expect(run.classBlocking[k]).toBeGreaterThanOrEqual(0);
      expect(run.classBlocking[k]).toBeLessThanOrEqual(1);
    });
    expect(run.utilization).toBeGreaterThanOrEqual(0);
    expect(run.utilization).toBeLessThanOrEqual(1);
  });

  it("pools the requested number of calls across classes", () => {
    const run = runEmlmSimulation({ ...baseParams, seed: 7 });
    const counted = run.classOffered.reduce((a, b) => a + b, 0);
    expect(counted).toBe(baseParams.numCallsToSimulate);
  });

  it("matches the analytical Kaufman-Roberts q(j) and per-class blocking", () => {
    const expected = analytical(capacity, classes);
    const summary = replicateEmlmSimulation([1, 2, 3, 4, 5], {
      ...baseParams,
      numCallsToSimulate: 200_000,
    });

    summary.qMean.forEach((qj, j) => {
      expect(Math.abs(qj - expected.q[j])).toBeLessThan(0.01);
    });
    summary.classBlockingMean.forEach((b, k) => {
      expect(Math.abs(b - expected.blocking[k])).toBeLessThan(0.01);
    });
  });

  it("blocks the wider class more often than the narrower one", () => {
    const summary = replicateEmlmSimulation([1, 2, 3], baseParams);
    // class 2 needs 3 b.u., class 1 needs 1: class 2 is blocked in more states.
    expect(summary.classBlockingMean[1]).toBeGreaterThan(
      summary.classBlockingMean[0],
    );
  });

  it("collapses to Erlang-B for a single class that needs 1 b.u.", () => {
    const single: EmlmServiceClassParams[] = [
      { bu: 1, offeredLoad: 5, serviceRate: 1 },
    ];
    const summary = replicateEmlmSimulation([1, 2, 3, 4, 5], {
      capacity: 5,
      serviceClasses: single,
      numCallsToSimulate: 200_000,
    });
    const erlangB = recursiveErlangB(5, 5).result;
    expect(Math.abs(summary.classBlockingMean[0] - erlangB)).toBeLessThan(0.01);
  });

  it("keeps each class's offered load whatever its service rate is", () => {
    const mixedRates: EmlmServiceClassParams[] = [
      { bu: 1, offeredLoad: 4, serviceRate: 1 },
      { bu: 3, offeredLoad: 2, serviceRate: 2.5 },
    ];
    const expected = analytical(capacity, mixedRates);
    const summary = replicateEmlmSimulation([1, 2, 3, 4, 5], {
      capacity,
      serviceClasses: mixedRates,
      numCallsToSimulate: 200_000,
    });
    summary.classBlockingMean.forEach((b, k) => {
      expect(Math.abs(b - expected.blocking[k])).toBeLessThan(0.01);
    });
  });

  it.each(SERVICE_DISTRIBUTIONS.map((d) => d.value))(
    "stays close to Kaufman-Roberts with %s holding times (insensitivity)",
    (serviceDist) => {
      const expected = analytical(capacity, classes);
      const summary = replicateEmlmSimulation([1, 2, 3, 4], {
        ...baseParams,
        serviceDist,
      });
      summary.classBlockingMean.forEach((b, k) => {
        expect(Math.abs(b - expected.blocking[k])).toBeLessThan(0.015);
      });
    },
  );

  it("throws on invalid input", () => {
    expect(() =>
      runEmlmSimulation({ ...baseParams, serviceClasses: [], seed: 1 }),
    ).toThrow();
    expect(() =>
      runEmlmSimulation({ ...baseParams, capacity: 0, seed: 1 }),
    ).toThrow();
    expect(() =>
      runEmlmSimulation({ ...baseParams, numCallsToSimulate: 0, seed: 1 }),
    ).toThrow();
    expect(() =>
      runEmlmSimulation({
        ...baseParams,
        serviceClasses: [{ bu: 1.5, offeredLoad: 1, serviceRate: 1 }],
        seed: 1,
      }),
    ).toThrow();
    expect(() =>
      runEmlmSimulation({
        ...baseParams,
        serviceClasses: [{ bu: 1, offeredLoad: 0, serviceRate: 1 }],
        seed: 1,
      }),
    ).toThrow();
  });

  it("throws when a class never gets a counted call", () => {
    expect(() =>
      runEmlmSimulation({
        capacity,
        serviceClasses: [
          { bu: 1, offeredLoad: 4, serviceRate: 1 },
          { bu: 1, offeredLoad: 1e-9, serviceRate: 1 },
        ],
        numCallsToSimulate: 1000,
        seed: 1,
      }),
    ).toThrow(/class 2/);
  });
});

describe("replicateEmlmSimulation", () => {
  it("aggregates across all given seeds", () => {
    const seeds = [1, 2, 3];
    const summary = replicateEmlmSimulation(seeds, {
      ...baseParams,
      numCallsToSimulate: 20_000,
    });
    expect(summary.n).toBe(seeds.length);
    expect(summary.qMean.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    expect(summary.qStdev).toHaveLength(summary.qMean.length);
    summary.classBlockingStdev.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(0);
    });
  });

  it("sums per-class counts across seeds", () => {
    const seeds = [1, 2, 3];
    const summary = replicateEmlmSimulation(seeds, {
      ...baseParams,
      numCallsToSimulate: 20_000,
    });
    const pooled = summary.classOfferedTotal.reduce((a, b) => a + b, 0);
    expect(pooled).toBe(20_000 * seeds.length);
    classes.forEach((_, k) => {
      expect(summary.classAcceptedTotal[k] + summary.classBlockedTotal[k]).toBe(
        summary.classOfferedTotal[k],
      );
    });
  });

  it("matches aggregating the same per-seed runs directly", () => {
    const params = { ...baseParams, numCallsToSimulate: 20_000 };
    const seeds = [1, 2, 3];
    const runs = seeds.map((seed) => runEmlmSimulation({ ...params, seed }));
    expect(aggregateEmlmRuns(runs)).toEqual(
      replicateEmlmSimulation(seeds, params),
    );
  });
});
