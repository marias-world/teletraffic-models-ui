"use client";

import { useRef, useState } from "react";
import { InlineMath } from "react-katex";
import {
  aggregateErlangBRuns,
  ErlangBSimulationParams,
  ErlangBSimulationResult,
  ReplicationSummary,
} from "@/lib/models/simulation/erlang-b-simulation";
import { recursiveErlangB } from "@/lib/models/erlang-b";
import { kaufmanRoberts } from "@/lib/models/kaufman-roberts/kaufman-roberts-formula";
import QComparisonChart from "./QComparisonChart";

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

// Builds a CSV with the per-seed results plus an aggregate/analytical
// summary, so the raw numbers can be opened in a spreadsheet for charting
// instead of only being readable in the on-page tables.
function buildResultsCsv(
  seeds: number[],
  runs: ErlangBSimulationResult[],
  summary: ReplicationSummary,
  analyticalQ: number[],
  analyticalBlocking: number,
): string {
  const capacity = analyticalQ.length - 1;
  const qColumns = Array.from({ length: capacity + 1 }, (_, j) => `q(${j})`);
  const lines: string[] = [];

  lines.push("Per-seed results");
  lines.push(
    ["seed", "callBlocking", "utilization", "totalTime", ...qColumns].join(","),
  );
  seeds.forEach((seed, i) => {
    const run = runs[i];
    lines.push(
      [seed, run.callBlocking, run.utilization, run.totalTime, ...run.q].join(
        ",",
      ),
    );
  });

  lines.push("");
  lines.push("Summary across seeds");
  lines.push("metric,value");
  lines.push(`n,${summary.n}`);
  lines.push(`blockingMean,${summary.blockingMean}`);
  lines.push(`blockingStdev,${summary.blockingStdev}`);
  lines.push(`utilization,${summary.utilization}`);
  lines.push(`totalTimeSum,${summary.totalTimeSum}`);
  lines.push(`analyticalBlocking,${analyticalBlocking}`);

  lines.push("");
  lines.push("q(j): simulated (mean, stdev) vs analytical");
  lines.push("state,simulatedMean,simulatedStdev,analytical");
  for (let j = 0; j <= capacity; j++) {
    lines.push(
      [j, summary.qMean[j], summary.qStdev[j], analyticalQ[j]].join(","),
    );
  }

  return lines.join("\n");
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

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
  const [perSeedRuns, setPerSeedRuns] = useState<
    ErlangBSimulationResult[] | null
  >(null);
  const chartRef = useRef<SVGSVGElement>(null);

  // Renders the chart's SVG onto an offscreen canvas at 2x scale (for a
  // crisp, not blurry, PNG) and downloads that, since a raster image opens
  // more predictably than an SVG in places like a slide deck or a Word doc.
  const downloadChartAsPng = () => {
    const node = chartRef.current;
    if (!node) return;

    const viewBox = node.viewBox.baseVal;
    const width = viewBox.width || 700;
    const height = viewBox.height || 340;
    const scale = 2;

    const clone = node.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    const markup = new XMLSerializer().serializeToString(clone);

    const svgBlob = new Blob([markup], {
      type: "image/svg+xml;charset=utf-8;",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = "erlang-b-q-comparison.png";
            link.click();
            URL.revokeObjectURL(pngUrl);
          }
        }, "image/png");
      }
      URL.revokeObjectURL(svgUrl);
    };
    image.onerror = () => {
      setError("Could not render the chart as an image.");
      URL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  };

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
    if (
      !capacity ||
      isNaN(c) ||
      c <= 0 ||
      !Number.isInteger(c) ||
      c > MAX_CAPACITY
    ) {
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
      setPerSeedRuns(runs);
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
        right in your browser. Pick a system and see how closely the simulated
        blocking probability lands to the analytical Erlang-B value.
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
            step="0.1"
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
            step="0.1"
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
        {MAX_CALLS_PER_SEED.toLocaleString()}, seeds between 2 and {MAX_SEEDS}{" "}
        (more calls/seeds means a more precise but slower run;{" "}
        {MAX_CALLS_PER_SEED.toLocaleString()} calls with several seeds can take
        several seconds and briefly freeze the page while it runs).
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

      {result &&
        analyticalQ &&
        analyticalBlocking !== null &&
        usedSeeds &&
        perSeedRuns && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Seeds used:{" "}
                <span className="font-mono">{usedSeeds.join(", ")}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    downloadBlob(
                      "erlang-b-simulation-results.csv",
                      buildResultsCsv(
                        usedSeeds,
                        perSeedRuns,
                        result,
                        analyticalQ,
                        analyticalBlocking,
                      ),
                      "text/csv;charset=utf-8;",
                    )
                  }
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Download results as CSV
                </button>
                <button
                  onClick={downloadChartAsPng}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Download chart as PNG
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <QComparisonChart
                ref={chartRef}
                qMean={result.qMean}
                analyticalQ={analyticalQ}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Wall-clock time (this run)
                </p>
                <p className="text-lg font-bold text-slate-600 font-mono">
                  {elapsedMs !== null
                    ? `${(elapsedMs / 1000).toFixed(3)}s`
                    : "—"}
                </p>
                <p className="text-xs text-slate-400">
                  real time the browser took to run all {result.n} seeds in
                  parallel
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              The &ldquo;±&rdquo; next to each simulated q(j) is that
              state&apos;s spread across the seeds used: e.g. &ldquo;0.0110827
              (± 0.0005159)&rdquo; means across the independent seed runs, the
              fraction-of-time-with-0-busy-servers estimate varied by about
              ±0.0005 from run to run, centered on a mean of 0.0110827. Same
              idea as the overall &ldquo;± stdev (N seeds)&rdquo; shown for the
              blocking probability above, just per state instead of for that one
              aggregate figure.
            </p>
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
                        {qj.toFixed(7)}{" "}
                        <span className="text-slate-400">
                          (± {result.qStdev[j].toFixed(7)})
                        </span>
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
