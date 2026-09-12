import { describe, it, expect } from "vitest";
import {
  runErlangBSimulation,
  replicateErlangBSimulation,
  aggregateErlangBRuns,
} from "./erlang-b-simulation";
import { recursiveErlangB } from "../erlang-b";

describe("runErlangBSimulation", () => {
  const baseParams = {
    arrivalRate: 5,
    serviceRate: 1,
    capacity: 5,
    numCallsToSimulate: 100_000,
  };

  it("is deterministic for a given seed", () => {
    const a = runErlangBSimulation({ ...baseParams, seed: 42 });
    const b = runErlangBSimulation({ ...baseParams, seed: 42 });
    expect(a).toEqual(b);
  });

  it("produces different results for different seeds", () => {
    const a = runErlangBSimulation({ ...baseParams, seed: 1 });
    const b = runErlangBSimulation({ ...baseParams, seed: 2 });
    expect(a.callBlocking).not.toBe(b.callBlocking);
  });

  it("q sums to 1", () => {
    const { q } = runErlangBSimulation({ ...baseParams, seed: 7 });
    const sum = q.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 9);
  });

  it("q has one entry per state 0..capacity", () => {
    const { q } = runErlangBSimulation({ ...baseParams, seed: 7 });
    expect(q).toHaveLength(baseParams.capacity + 1);
  });

  it("callBlocking and utilization are within [0, 1]", () => {
    const { callBlocking, utilization } = runErlangBSimulation({
      ...baseParams,
      seed: 7,
    });
    expect(callBlocking).toBeGreaterThanOrEqual(0);
    expect(callBlocking).toBeLessThanOrEqual(1);
    expect(utilization).toBeGreaterThanOrEqual(0);
    expect(utilization).toBeLessThanOrEqual(1);
  });

  it("matches the analytical Erlang-B blocking probability within tolerance", () => {
    const offeredLoad = baseParams.arrivalRate / baseParams.serviceRate;
    const analytical = recursiveErlangB(baseParams.capacity, offeredLoad).result;

    const { blockingMean } = replicateErlangBSimulation(
      [1, 2, 3, 4, 5],
      baseParams,
    );

    // Stochastic simulation vs. a closed-form result: allow a generous
    // absolute tolerance so this doesn't flake, while still catching a
    // genuinely broken implementation (which would be off by a lot more).
    expect(Math.abs(blockingMean - analytical)).toBeLessThan(0.02);
  });

  it("throws on non-positive capacity or call count", () => {
    expect(() =>
      runErlangBSimulation({ ...baseParams, capacity: 0, seed: 1 }),
    ).toThrow();
    expect(() =>
      runErlangBSimulation({
        ...baseParams,
        numCallsToSimulate: 0,
        seed: 1,
      }),
    ).toThrow();
  });
});

describe("replicateErlangBSimulation", () => {
  it("aggregates across all given seeds", () => {
    const seeds = [1, 2, 3];
    const summary = replicateErlangBSimulation(seeds, {
      arrivalRate: 5,
      serviceRate: 1,
      capacity: 5,
      numCallsToSimulate: 20_000,
    });
    expect(summary.n).toBe(seeds.length);
    expect(summary.qMean.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });

  it("matches aggregating the same per-seed runs directly", () => {
    // replicateErlangBSimulation runs seeds itself; aggregateErlangBRuns
    // aggregates runs gathered some other way (e.g. from parallel Web
    // Workers). Both must produce the same summary for the same runs.
    const params = {
      arrivalRate: 5,
      serviceRate: 1,
      capacity: 5,
      numCallsToSimulate: 20_000,
    };
    const seeds = [1, 2, 3];
    const runs = seeds.map((seed) =>
      runErlangBSimulation({ ...params, seed }),
    );
    expect(aggregateErlangBRuns(runs)).toEqual(
      replicateErlangBSimulation(seeds, params),
    );
  });
});
