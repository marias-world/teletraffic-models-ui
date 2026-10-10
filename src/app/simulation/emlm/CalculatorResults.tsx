"use client";

import { useRef, useState } from "react";
import { InlineMath } from "react-katex";
import QComparisonChart from "@/components/QComparisonChart";
import { downloadBlob, downloadSvgAsPng } from "@/lib/download";
import { blockingStateRange, timeAverageBlocking } from "./blockingStates";
import { buildEmlmResultsCsv } from "./resultsCsv";
import type { EmlmOutput } from "./types";

const MAX_CAPACITY_WITH_CHART_LABELS = 12;

const TABLE = "w-full text-sm border-separate border-spacing-y-1";
const HEAD = "text-xs font-semibold text-slate-400 tracking-wider";

function classLabel(k: number, bu: number, load: number) {
  return `Class ${k + 1} (b=${bu}, a=${load})`;
}

export default function CalculatorResults({ output }: { output: EmlmOutput }) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [pngError, setPngError] = useState("");

  const {
    summary,
    seeds,
    capacity,
    classes,
    analyticalQ,
    analyticalBlocking,
    elapsedMs,
  } = output;

  const showChartLabels = capacity <= MAX_CAPACITY_WITH_CHART_LABELS;
  const totalOffered = summary.classOfferedTotal.reduce((a, b) => a + b, 0);
  const totalAccepted = summary.classAcceptedTotal.reduce((a, b) => a + b, 0);
  const totalBlocked = summary.classBlockedTotal.reduce((a, b) => a + b, 0);

  const downloadChartAsPng = () => {
    const node = chartRef.current;
    if (!node) return;
    setPngError("");
    downloadSvgAsPng(node, "emlm-q-comparison.png").catch((e: Error) =>
      setPngError(e.message),
    );
  };

  return (
    <div className="space-y-6 pt-2 border-t border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          Seeds used: <span className="font-mono">{seeds.join(", ")}</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={() =>
              downloadBlob(
                "emlm-simulation-results.csv",
                buildEmlmResultsCsv(output),
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

      {pngError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {pngError}
        </p>
      )}

      <div className="space-y-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <QComparisonChart
            ref={chartRef}
            qMean={summary.qMean}
            analyticalQ={analyticalQ}
            xAxisLabel="state j (occupied b.u.)"
            showValueLabels={showChartLabels}
          />
        </div>
        {!showChartLabels && (
          <p className="text-xs text-slate-400">
            Value labels are hidden above a capacity of{" "}
            {MAX_CAPACITY_WITH_CHART_LABELS} so they stay readable; the exact
            values are in the q(j) table below.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Utilization
          </p>
          <p className="text-lg font-bold text-slate-600 font-mono">
            {summary.utilization.toFixed(7)}
          </p>
          <p className="text-xs text-slate-400">
            average occupied b.u. / capacity
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Wall-clock time (this run)
          </p>
          <p className="text-lg font-bold text-slate-600 font-mono">
            {(elapsedMs / 1000).toFixed(3)}s
          </p>
          <p className="text-xs text-slate-400">
            real time the browser took to run all {summary.n} seeds in parallel
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Call blocking probability per service class
        </h3>
        <p className="text-xs text-slate-400">
          &ldquo;±&rdquo; is the standard deviation across the {summary.n}{" "}
          seeds. Call counts are summed across all seeds, after warm-up.
        </p>
        <div className="overflow-x-auto">
          <table className={TABLE}>
            <thead>
              <tr className={HEAD}>
                <th className="text-left px-2">Class</th>
                <th className="text-left px-2">Simulated</th>
                <th className="text-left px-2">Analytical</th>
                <th className="text-right px-2">Offered</th>
                <th className="text-right px-2">Accepted</th>
                <th className="text-right px-2">Blocked</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, k) => (
                <tr key={k} className="bg-white">
                  <td className="px-2 py-1.5 font-semibold text-slate-500 whitespace-nowrap">
                    {classLabel(k, c.bu, c.offeredLoad)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-700 whitespace-nowrap">
                    {summary.classBlockingMean[k].toFixed(7)}{" "}
                    <span className="text-slate-400">
                      (± {summary.classBlockingStdev[k].toFixed(7)})
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-500">
                    {analyticalBlocking[k].toFixed(7)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-500 text-right">
                    {summary.classOfferedTotal[k].toLocaleString()}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-500 text-right">
                    {summary.classAcceptedTotal[k].toLocaleString()}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-500 text-right">
                    {summary.classBlockedTotal[k].toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-white border-t border-slate-200">
                <td className="px-2 py-1.5 font-semibold text-slate-500">
                  total
                </td>
                <td />
                <td />
                <td className="px-2 py-1.5 font-mono text-slate-500 text-right">
                  {totalOffered.toLocaleString()}
                </td>
                <td className="px-2 py-1.5 font-mono text-slate-500 text-right">
                  {totalAccepted.toLocaleString()}
                </td>
                <td className="px-2 py-1.5 font-mono text-slate-500 text-right">
                  {totalBlocked.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">PASTA check</h3>
        <p className="text-xs text-slate-400">
          For each class, blocking counted over arrivals should equal the
          fraction of time the link spends in the states where that class cannot
          be admitted, <InlineMath math="\sum q(j)" /> over{" "}
          <InlineMath math="j = C - b + 1, \dots, C" />.
        </p>
        <div className="overflow-x-auto">
          <table className={TABLE}>
            <thead>
              <tr className={HEAD}>
                <th className="text-left px-2">Class</th>
                <th className="text-left px-2">Blocking states</th>
                <th className="text-left px-2">Blocking (arrivals)</th>
                <th className="text-left px-2">Σ q(j) (time)</th>
                <th className="text-left px-2">Analytical</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, k) => {
                const { first, last } = blockingStateRange(capacity, c.bu);
                return (
                  <tr key={k} className="bg-white">
                    <td className="px-2 py-1.5 font-semibold text-slate-500 whitespace-nowrap">
                      {classLabel(k, c.bu, c.offeredLoad)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-500">
                      {first === last ? `${last}` : `${first}-${last}`}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-700">
                      {summary.classBlockingMean[k].toFixed(7)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-700">
                      {timeAverageBlocking(
                        summary.qMean,
                        capacity,
                        c.bu,
                      ).toFixed(7)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-500">
                      {analyticalBlocking[k].toFixed(7)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          q(j): fraction of time with j b.u. occupied
        </h3>
        <p className="text-xs text-slate-400">
          &ldquo;±&rdquo; is the standard deviation of that state&apos;s
          estimate across the {summary.n} seeds.
        </p>
        <div className="max-h-96 overflow-auto">
          <table className={TABLE}>
            <thead>
              <tr className={HEAD}>
                <th className="text-left px-2 sticky top-0 bg-white">
                  State j
                </th>
                <th className="text-left px-2 sticky top-0 bg-white">
                  Simulated q(j)
                </th>
                <th className="text-left px-2 sticky top-0 bg-white">
                  Analytical q(j)
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.qMean.map((qj, j) => (
                <tr key={j} className="bg-white">
                  <td className="px-2 py-1.5 font-semibold text-slate-500">
                    {j}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-700 whitespace-nowrap">
                    {qj.toFixed(7)}{" "}
                    <span className="text-slate-400">
                      (± {summary.qStdev[j].toFixed(7)})
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
    </div>
  );
}
