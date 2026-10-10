"use client";

import { useRef, useState } from "react";
import { InlineMath } from "react-katex";
import {
  aggregateEmlmRuns,
  EmlmServiceClassParams,
  EmlmSimulationParams,
  EmlmSimulationResult,
} from "@/lib/models/simulation/emlm-simulation";
import {
  SERVICE_DISTRIBUTIONS,
  ServiceDistribution,
} from "@/lib/models/simulation/service-time-distributions";
import { DEFAULT_SEEDS } from "@/lib/models/simulation/seeds";
import { kaufmanRoberts } from "@/lib/models/kaufman-roberts/kaufman-roberts-formula";
import { callBlockingProbability } from "@/lib/models/kaufman-roberts/call-blocking-probability";
import CalculatorResults from "./CalculatorResults";
import type { EmlmOutput } from "./types";

function runInWorker(
  params: EmlmSimulationParams,
): Promise<EmlmSimulationResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL(
        "../../../lib/models/simulation/emlm-simulation.worker.ts",
        import.meta.url,
      ),
    );
    worker.onmessage = (event: MessageEvent<EmlmSimulationResult>) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = (event) => {
      // The browser prefixes errors thrown in a worker with "Uncaught Error:".
      const message = event.message?.replace(/^(Uncaught )?(\w*Error: )?/, "");
      reject(new Error(message || "Worker failed"));
      worker.terminate();
    };
    worker.postMessage(params);
  });
}

const MAX_CAPACITY = 100;
const MAX_CLASSES = 5;
const MAX_OFFERED_LOAD = 100;
const MAX_SERVICE_RATE = 50;
const MAX_CALLS_PER_SEED = 10_000_000;
const MAX_SEEDS = DEFAULT_SEEDS.length;

interface ClassRow {
  id: number;
  bu: string;
  load: string;
  rate: string;
}

const INPUT = "w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm";
const LABEL = "block text-xs font-medium text-slate-600 mb-1";

function arrivalRateLabel(row: ClassRow) {
  const load = Number(row.load);
  const rate = Number(row.rate);
  if (!row.load || !row.rate || isNaN(load) || isNaN(rate)) return "…";
  return (load * rate).toFixed(2);
}

export default function Calculator() {
  const [capacity, setCapacity] = useState("10");
  const [rows, setRows] = useState<ClassRow[]>([
    { id: 1, bu: "1", load: "4", rate: "1" },
    { id: 2, bu: "3", load: "2", rate: "1" },
  ]);
  const [callsPerSeed, setCallsPerSeed] = useState("100000");
  const [numSeeds, setNumSeeds] = useState(String(MAX_SEEDS));
  const [serviceDist, setServiceDist] =
    useState<ServiceDistribution>("exponential");

  const [output, setOutput] = useState<EmlmOutput | null>(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const nextRowId = useRef(3);

  const updateRow = (
    id: number,
    field: "bu" | "load" | "rate",
    value: string,
  ) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );

  const addRow = () => {
    if (rows.length >= MAX_CLASSES) return;
    const id = nextRowId.current++;
    setRows((current) => [...current, { id, bu: "1", load: "1", rate: "1" }]);
  };

  const removeRow = (id: number) =>
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.id !== id),
    );

  const seedsPreview = (() => {
    const n = Number(numSeeds);
    if (!numSeeds || isNaN(n) || n <= 0 || !Number.isInteger(n)) return null;
    return DEFAULT_SEEDS.slice(0, Math.min(n, MAX_SEEDS));
  })();

  const runModel = async () => {
    setError("");
    setOutput(null);

    const c = Number(capacity);
    const calls = Number(callsPerSeed);
    const seeds = Number(numSeeds);

    if (
      !capacity ||
      isNaN(c) ||
      !Number.isInteger(c) ||
      c <= 0 ||
      c > MAX_CAPACITY
    ) {
      setError(
        `Capacity must be a positive whole number, up to ${MAX_CAPACITY} b.u.`,
      );
      return;
    }

    const classes: EmlmServiceClassParams[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const label = `Class ${i + 1}`;
      const bu = Number(row.bu);
      const load = Number(row.load);
      const rate = Number(row.rate);

      if (!row.bu || !Number.isInteger(bu) || bu < 1 || bu > c) {
        setError(
          `${label}: bandwidth per call must be a whole number between 1 and the capacity (${c}).`,
        );
        return;
      }
      if (!row.load || isNaN(load) || load <= 0 || load > MAX_OFFERED_LOAD) {
        setError(
          `${label}: offered load must be a positive number, up to ${MAX_OFFERED_LOAD}.`,
        );
        return;
      }
      if (!row.rate || isNaN(rate) || rate <= 0 || rate > MAX_SERVICE_RATE) {
        setError(
          `${label}: service rate must be a positive number, up to ${MAX_SERVICE_RATE}.`,
        );
        return;
      }
      classes.push({ bu, offeredLoad: load, serviceRate: rate });
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
    if (
      !numSeeds ||
      isNaN(seeds) ||
      seeds < 2 ||
      !Number.isInteger(seeds) ||
      seeds > MAX_SEEDS
    ) {
      setError(
        `Number of seeds must be a whole number between 2 and ${MAX_SEEDS}.`,
      );
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
            capacity: c,
            serviceClasses: classes,
            numCallsToSimulate: calls,
            seed,
            serviceDist,
          }),
        ),
      );
      const elapsedMs = performance.now() - startTime;

      // The analytical side only ever needs each class's offered load and
      // bandwidth, so the per-class service rate stays simulation-only.
      const model = classes.map((cl, i) => ({
        serviceClass: i + 1,
        bu: cl.bu,
        incomingLoad_a: cl.offeredLoad,
      }));
      const qByState = kaufmanRoberts(c, model);
      const blocking = callBlockingProbability(c, model);

      setOutput({
        summary: aggregateEmlmRuns(runs),
        runs,
        seeds: seedList,
        capacity: c,
        callsPerSeed: calls,
        serviceDist,
        classes,
        analyticalQ: Array.from(
          { length: c + 1 },
          (_, j) => qByState[`q(${j})`],
        ),
        analyticalBlocking: classes.map((_, k) => blocking[`B_class_${k + 1}`]),
        elapsedMs,
      });
    } catch (e) {
      setError(`Simulation failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        4. Try It: Run the Simulation Yourself
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        This runs the same simulation described above, right in your browser,
        and compares it with the Kaufman-Roberts values. Describe a link and its
        service classes, then see how closely the simulated occupancy
        distribution and per-class blocking land on the analytical ones.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>
            Capacity <InlineMath math="C" /> (b.u.)
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            max={MAX_CAPACITY}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Calls / seed</label>
          <input
            type="number"
            value={callsPerSeed}
            onChange={(e) => setCallsPerSeed(e.target.value)}
            max={MAX_CALLS_PER_SEED}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Seeds</label>
          <input
            type="number"
            value={numSeeds}
            onChange={(e) => setNumSeeds(e.target.value)}
            max={MAX_SEEDS}
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Holding-time distribution</label>
        <select
          value={serviceDist}
          onChange={(e) =>
            setServiceDist(e.target.value as ServiceDistribution)
          }
          className={INPUT}
        >
          {SERVICE_DISTRIBUTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">
          Every option keeps the mean holding time at{" "}
          <InlineMath math="1/\mu_k" />, so each class&apos;s offered load is
          unchanged; only the shape of the distribution differs.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Service classes</p>
        {rows.map((row, i) => (
          <div
            key={row.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Class {i + 1}
              </p>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={LABEL}>
                  Bandwidth <InlineMath math="b" /> (b.u./call)
                </label>
                <input
                  type="number"
                  value={row.bu}
                  onChange={(e) => updateRow(row.id, "bu", e.target.value)}
                  min={1}
                  max={MAX_CAPACITY}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>
                  Offered load <InlineMath math="a" /> (erlangs)
                </label>
                <input
                  type="number"
                  value={row.load}
                  onChange={(e) => updateRow(row.id, "load", e.target.value)}
                  step="0.1"
                  max={MAX_OFFERED_LOAD}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>
                  Service rate <InlineMath math="\mu" />
                </label>
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) => updateRow(row.id, "rate", e.target.value)}
                  step="0.1"
                  max={MAX_SERVICE_RATE}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>
                  Arrival rate <InlineMath math="\lambda = a \cdot \mu" />
                </label>
                <div className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono text-slate-500">
                  {arrivalRateLabel(row)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addRow}
          disabled={rows.length >= MAX_CLASSES}
          className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
        >
          + Add a service class
          {rows.length >= MAX_CLASSES ? ` (max ${MAX_CLASSES})` : ""}
        </button>
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
        Capacity ≤ {MAX_CAPACITY} b.u., up to {MAX_CLASSES} classes, calls/seed
        ≤ {MAX_CALLS_PER_SEED.toLocaleString()}, seeds between 2 and {MAX_SEEDS}
        . Calls/seed are counted across all classes together, so a class with a
        small offered load gets proportionally fewer of them and a noisier
        blocking estimate.
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

      {output && <CalculatorResults output={output} />}
    </section>
  );
}
