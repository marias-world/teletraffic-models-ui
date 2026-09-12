"use client";

import { useState } from "react";
import { InlineMath } from "react-katex";
import {
  aggregateErlangBRuns,
  ErlangBSimulationParams,
  ErlangBSimulationResult,
  ReplicationSummary,
} from "@/lib/models/simulation/erlang-b-simulation";
import { recursiveErlangB } from "@/lib/models/erlang-b";
import { kaufmanRoberts } from "@/lib/models/kaufman-roberts/kaufman-roberts-formula";

// Runs one seed's simulation in its own Web Worker, so replications across
// several seeds run in parallel across CPU cores instead of one after
// another on the UI thread that's also drawing the page.
function runInWorker(
  params: ErlangBSimulationParams,
): Promise<ErlangBSimulationResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL(
        "../../../lib/models/simulation/erlang-b-simulation.worker.ts",
        import.meta.url,
      ),
    );
    worker.onmessage = (event: MessageEvent<ErlangBSimulationResult>) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = (event) => {
      reject(new Error(event.message || "Worker failed"));
      worker.terminate();
    };
    worker.postMessage(params);
  });
}

const MAX_CAPACITY = 30;
const MAX_RATE = 50;
const MAX_CALLS_PER_SEED = 10_000_000;
// Same fixed seed list the Python reference implementation defaults to, so
// results here are reproducible and comparable to it, not arbitrary.
const DEFAULT_SEEDS = [42, 50, 58, 59, 57, 38, 39, 68, 28, 80];
const MAX_SEEDS = DEFAULT_SEEDS.length;

export default function Calculator() {
  const [arrivalRate, setArrivalRate] = useState("5");
  const [serviceRate, setServiceRate] = useState("1");
  const [capacity, setCapacity] = useState("5");
  const [callsPerSeed, setCallsPerSeed] = useState("100000");
  const [numSeeds, setNumSeeds] = useState(String(MAX_SEEDS));

  const [result, setResult] = useState<ReplicationSummary | null>(null);
  const [analyticalQ, setAnalyticalQ] = useState<number[] | null>(null);
  const [analyticalBlocking, setAnalyticalBlocking] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [usedSeeds, setUsedSeeds] = useState<number[] | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const seedsPreview = (() => {
    const n = Number(numSeeds);
    if (!numSeeds || isNaN(n) || n <= 0 || !Number.isInteger(n)) return null;
    return DEFAULT_SEEDS.slice(0, Math.min(n, MAX_SEEDS));
  })();

  const runModel = async () => {
    setError("");
    setResult(null);

    const lambda = Number(arrivalRate);
    const mu = Number(serviceRate);
    const c = Number(capacity);
    const calls = Number(callsPerSeed);
    const seeds = Number(numSeeds);

    if (!arrivalRate || isNaN(lambda) || lambda <= 0 || lambda > MAX_RATE) {
      setError(`Arrival rate must be a positive number, up to ${MAX_RATE}.`);
      return;
    }
    if (!serviceRate || isNaN(mu) || mu <= 0 || mu > MAX_RATE) {
      setError(`Service rate must be a positive number, up to ${MAX_RATE}.`);
      return;
    }
    if (!capacity || isNaN(c) || c <= 0 || !Number.isInteger(c) || c > MAX_CAPACITY) {
      setError(
        `Capacity must be a positive whole number, up to ${MAX_CAPACITY}.`,
      );
      return;
    }
    if (
      !callsPerSeed ||
      isNaN(calls) ||
      calls <= 0 ||
      calls > MAX_CALLS_PER_SEED
    ) {
      setError(
        `Calls per seed must be a positive number, up to ${MAX_CALLS_PER_SEED.toLocaleString()}.`,
      );
      return;
    }
    if (!numSeeds || isNaN(seeds) || seeds < 2 || !Number.isInteger(seeds) || seeds > MAX_SEEDS) {
      setError(`Number of seeds must be a whole number between 2 and ${MAX_SEEDS}.`);
      return;
    }

    setIsRunning(true);

    try {
      const seedList = DEFAULT_SEEDS.slice(0, seeds);
      const startTime = performance.now();
      // One Web Worker per seed, all started at once: the seeds are
      // independent replications, so there's no reason to wait for one to
      // finish before starting the next.
      const runs = await Promise.all(
        seedList.map((seed) =>
          runInWorker({
            arrivalRate: lambda,
            serviceRate: mu,
            capacity: c,
            numCallsToSimulate: calls,
            seed,
          }),
        ),
      );
      const summary = aggregateErlangBRuns(runs);
      setElapsedMs(performance.now() - startTime);
      const offeredLoad = lambda / mu;
      // Erlang-B's state distribution is Kaufman-Roberts with a single
      // service class of size 1, so reuse that existing formula rather
      // than duplicating the same math under a new name.
      const qByState = kaufmanRoberts(c, [
        { serviceClass: 1, bu: 1, incomingLoad_a: offeredLoad },
      ]);
      setAnalyticalQ(
        Array.from({ length: c + 1 }, (_, j) => qByState[`q(${j})`]),
      );
      setAnalyticalBlocking(recursiveErlangB(c, offeredLoad).result);
      setUsedSeeds(seedList);
      setResult(summary);
    } catch (e) {
      setError(`Simulation failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        6. Try It: Run the Simulation Yourself
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        This runs the exact same discrete-event simulation described above,
        right in your browser. Pick a system and see how closely the
        simulated blocking probability lands to the analytical Erlang-B
        value.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <InlineMath math="\lambda" /> (arrivals/time)
          </label>
          <input
            type="number"
            value={arrivalRate}
            onChange={(e) => setArrivalRate(e.target.value)}
            max={MAX_RATE}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <InlineMath math="\mu" /> (service rate)
          </label>
          <input
            type="number"
            value={serviceRate}
            onChange={(e) => setServiceRate(e.target.value)}
            max={MAX_RATE}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Capacity <InlineMath math="c" />
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            max={MAX_CAPACITY}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Calls / seed
          </label>
          <input
            type="number"
            value={callsPerSeed}
            onChange={(e) => setCallsPerSeed(e.target.value)}
            max={MAX_CALLS_PER_SEED}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Seeds
          </label>
          <input
            type="number"
            value={numSeeds}
            onChange={(e) => setNumSeeds(e.target.value)}
            max={MAX_SEEDS}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Seeds aren&apos;t random each run, they&apos;re a fixed list (the same
        one the reference Python implementation defaults to): with{" "}
        {numSeeds || "N"} seeds, this uses{" "}
        <span className="font-mono">
          {seedsPreview ? seedsPreview.join(", ") : "…"}
        </span>
        , so results are reproducible.
      </p>

      <p className="text-xs text-slate-400">
        Capacity ≤ {MAX_CAPACITY}, calls/seed ≤{" "}
        {MAX_CALLS_PER_SEED.toLocaleString()}, seeds between 2 and{" "}
        {MAX_SEEDS} (more calls/seeds means a more precise but slower run;{" "}
        {MAX_CALLS_PER_SEED.toLocaleString()} calls with several seeds can
        take several seconds and briefly freeze the page while it runs).
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={runModel}
        disabled={isRunning}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors duration-150"
      >
        {isRunning ? "Simulating…" : "Run Simulation"}
      </button>

      {result && analyticalQ && analyticalBlocking !== null && usedSeeds && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Seeds used:{" "}
            <span className="font-mono">{usedSeeds.join(", ")}</span>
            {elapsedMs !== null && (
              <>
                {", "}
                ran in{" "}
                <span className="font-mono">
                  {elapsedMs < 1000
                    ? `${elapsedMs.toFixed(0)} ms`
                    : `${(elapsedMs / 1000).toFixed(2)} s`}
                </span>
              </>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Simulated blocking
              </p>
              <p className="text-lg font-bold text-sky-600 font-mono">
                {result.blockingMean.toFixed(7)}
              </p>
              <p className="text-xs text-slate-400">
                ± {result.blockingStdev.toFixed(7)} ({result.n} seeds)
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Analytical Erlang-B
              </p>
              <p className="text-lg font-bold text-slate-600 font-mono">
                {analyticalBlocking.toFixed(7)}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Utilization
              </p>
              <p className="text-lg font-bold text-slate-600 font-mono">
                {result.utilization.toFixed(7)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                  <th className="text-left px-2">State j</th>
                  <th className="text-left px-2">Simulated q(j)</th>
                  <th className="text-left px-2">Analytical q(j)</th>
                </tr>
              </thead>
              <tbody>
                {result.qMean.map((qj, j) => (
                  <tr key={j} className="bg-white">
                    <td className="px-2 py-1.5 font-semibold text-slate-500">
                      {j}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-700">
                      {qj.toFixed(7)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-500">
                      {analyticalQ[j].toFixed(7)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
