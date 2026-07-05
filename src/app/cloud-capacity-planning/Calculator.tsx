"use client";

import { useState } from "react";
import { InlineMath } from "react-katex";
import { calculateCloudCapacityBlockingProbabilities } from "@/lib/models/cloud-capacity-planning/proposed-model-data";
import {
  BlockingRatios,
  Capacities,
  ServiceClassConfigs,
} from "@/lib/models/cloud-capacity-planning/types";

const MAX_CLASSES = 6;

type ResourceKey = "P" | "R" | "D" | "bps";
const RESOURCE_KEYS: ResourceKey[] = ["P", "R", "D", "bps"];
const RESOURCE_LABELS: Record<ResourceKey, string> = {
  P: "Processor",
  R: "RAM",
  D: "Disk",
  bps: "Network",
};
// Maps our simple P/R/D/bps keys to the model's own subsystem names.
const RESOURCE_TO_SUBSYSTEM: Record<ResourceKey, keyof BlockingRatios> = {
  P: "Processor",
  R: "RAM",
  D: "Disk",
  bps: "Bps",
};

type ServiceClassRow = {
  id: number;
  incomingLoad_a: string;
  bu: Record<ResourceKey, string>;
};

const DEFAULT_ROWS: ServiceClassRow[] = [
  { id: 1, incomingLoad_a: "", bu: { P: "", R: "", D: "", bps: "" } },
  { id: 2, incomingLoad_a: "", bu: { P: "", R: "", D: "", bps: "" } },
];

export default function Calculator() {
  const [T, setT] = useState("");
  const [capacities, setCapacities] = useState<Record<ResourceKey, string>>({
    P: "",
    R: "",
    D: "",
    bps: "",
  });
  const [rows, setRows] = useState<ServiceClassRow[]>(DEFAULT_ROWS);
  const [results, setResults] = useState<ReturnType<
    typeof calculateCloudCapacityBlockingProbabilities
  > | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const addRow = () => {
    if (rows.length >= MAX_CLASSES) return;
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        incomingLoad_a: "",
        bu: { P: "", R: "", D: "", bps: "" },
      },
    ]);
    setResults(null);
    setError("");
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setResults(null);
    setError("");
  };

  const updateLoad = (id: number, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, incomingLoad_a: value } : r)),
    );
    setError("");
  };

  const updateBu = (id: number, resource: ResourceKey, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, bu: { ...r.bu, [resource]: value } } : r,
      ),
    );
    setError("");
  };

  const runModel = () => {
    setError("");
    setResults(null);
    setShowSteps(false);

    const groupSize = Number(T);
    if (!T || isNaN(groupSize) || groupSize <= 0) {
      setError("Please enter a valid number of PMs per group (T).");
      return;
    }

    const capacityValues: Record<ResourceKey, number> = {
      P: Number(capacities.P),
      R: Number(capacities.R),
      D: Number(capacities.D),
      bps: Number(capacities.bps),
    };
    for (const y of RESOURCE_KEYS) {
      if (!capacities[y] || isNaN(capacityValues[y]) || capacityValues[y] <= 0) {
        setError(`Please enter a valid capacity for ${RESOURCE_LABELS[y]}.`);
        return;
      }
    }

    for (const row of rows) {
      if (!row.incomingLoad_a) {
        setError("Please fill in the offered traffic for every service class.");
        return;
      }
      for (const y of RESOURCE_KEYS) {
        if (!row.bu[y]) {
          setError(
            `Please fill in the ${RESOURCE_LABELS[y]} demand for every service class.`,
          );
          return;
        }
      }
    }

    const capacitiesForModel: Capacities = {
      ramCapacity: { link: 1, bu: capacityValues.R },
      processorCapacity: { link: 2, bu: capacityValues.P },
      diskCapacity: { link: 3, bu: capacityValues.D },
      bpsCapacity: { link: 4, bu: capacityValues.bps },
    };

    const serviceClassConfigs: ServiceClassConfigs = {
      ram: rows.map((row, i) => ({
        serviceClass: i + 1,
        incomingLoad_a: Number(row.incomingLoad_a),
        bu: Number(row.bu.R),
      })),
      processor: rows.map((row, i) => ({
        serviceClass: i + 1,
        incomingLoad_a: Number(row.incomingLoad_a),
        bu: Number(row.bu.P),
      })),
      disk: rows.map((row, i) => ({
        serviceClass: i + 1,
        incomingLoad_a: Number(row.incomingLoad_a),
        bu: Number(row.bu.D),
      })),
      bitrate: rows.map((row, i) => ({
        serviceClass: i + 1,
        incomingLoad_a: Number(row.incomingLoad_a),
        bu: Number(row.bu.bps),
      })),
    };

    setIsCalculating(true);

    setTimeout(() => {
      try {
        const result = calculateCloudCapacityBlockingProbabilities(
          groupSize,
          capacitiesForModel,
          serviceClassConfigs,
        );
        setResults(result);
      } catch (e) {
        setError(`Calculation failed: ${e instanceof Error ? e.message : e}`);
      } finally {
        setIsCalculating(false);
      }
    }, 0);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Try it: Cloud Capacity Planning Calculator
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        Enter the number of PMs per group <InlineMath math="T" />, the
        capacity of each resource, and the offered traffic and per-resource
        demand for each service class. This runs the same five steps as the
        worked example above: EMLM, LAR, the ratio between them, RLA within a
        single PM, and the combined total blocking probability.
      </p>

      {/* T and capacities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            PMs per group (T)
          </label>
          <input
            type="number"
            min={1}
            value={T}
            onChange={(e) => {
              setT(e.target.value);
              setError("");
            }}
            placeholder="e.g. 3"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RESOURCE_KEYS.map((y) => (
          <div key={y}>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              {RESOURCE_LABELS[y]} capacity
            </label>
            <input
              type="number"
              min={1}
              value={capacities[y]}
              onChange={(e) => {
                setCapacities((prev) => ({ ...prev, [y]: e.target.value }));
                setError("");
              }}
              placeholder="e.g. 18"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* Service classes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            Service Classes{" "}
            <span className="text-xs font-normal text-slate-400">
              ({rows.length}/{MAX_CLASSES})
            </span>
          </p>
          <button
            onClick={addRow}
            disabled={rows.length >= MAX_CLASSES}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium border border-sky-300 rounded-md px-2 py-1 hover:bg-sky-50 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            + Add class
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left px-1 w-10" />
                <th className="text-left px-1">aₖ (erl)</th>
                {RESOURCE_KEYS.map((y) => (
                  <th key={y} className="text-left px-1">
                    b<sub>k,{y}</sub>
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td className="px-1">
                    <span className="text-xs font-semibold text-slate-500">
                      k{i + 1}
                    </span>
                  </td>
                  <td className="px-1">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={row.incomingLoad_a}
                      onChange={(e) => updateLoad(row.id, e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </td>
                  {RESOURCE_KEYS.map((y) => (
                    <td key={y} className="px-1">
                      <input
                        type="number"
                        min={0}
                        value={row.bu[y]}
                        onChange={(e) => updateBu(row.id, y, e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-1 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <button
        onClick={runModel}
        disabled={isCalculating}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
      >
        {isCalculating ? "Calculating…" : "Run Model"}
      </button>

      {/* Results */}
      {results !== null && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="font-semibold text-slate-700">
            Total Blocking Probabilities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rows.map((_, i) => {
              const key = `B_class_${i + 1}`;
              const value = results.Ei[key] ?? 0;
              return (
                <div
                  key={key}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Class {i + 1}
                  </p>
                  <p className="text-2xl font-bold text-sky-600">
                    {(value * 100).toFixed(4)}%
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    B<sub>{i + 1}</sub> = {value.toFixed(7)}
                  </p>
                </div>
              );
            })}
          </div>

          <div>
            <button
              onClick={() => setShowSteps((prev) => !prev)}
              className="text-sky-600 font-medium text-sm hover:text-sky-700 transition-colors"
            >
              {showSteps ? "Hide calculation" : "Show calculation"}
            </button>

            {showSteps && (
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6">
                {(
                  [
                    [
                      "Step 1 (Applying the EMLM in each subsystem)",
                      "q(j) = \\frac{1}{j}\\sum_{k=1}^{K} \\alpha_k \\cdot b_k \\cdot q(j-b_k)",
                      results.kaufmanRoberts,
                      "B_{EMLM}",
                    ],
                    [
                      "Step 2 (Applying the LAR model in the group of T subsystems)",
                      "B_{k,\\text{LAR},y} \\text{ with offered load } \\alpha_k \\cdot T",
                      results.lar,
                      "B_{LAR}",
                    ],
                    [
                      "Step 3 (Determining the ratio ρ between Steps 1 & 2)",
                      "\\rho_{k,y} = \\frac{B_{k,\\text{LAR},y}}{B_{k,\\text{EMLM},y}}",
                      results.relationR,
                      "\\rho",
                    ],
                    [
                      "Step 4 (Applying the RLA method in a single PM)",
                      "V_{y,k} \\text{ from the RLA fixed-point iteration across the four resources}",
                      results.reducedLoadApproximation,
                      "V",
                    ],
                  ] as const
                ).map(([title, formula, table, symbol]) => (
                  <div key={title} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {title}
                    </p>
                    <div className="overflow-x-auto">
                      <BlockMath math={formula} />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-separate border-spacing-y-1">
                        <thead>
                          <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                            <th className="text-left px-2">Subsystem</th>
                            {rows.map((_, i) => (
                              <th key={i} className="text-left px-2">
                                Class {i + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {RESOURCE_KEYS.map((y) => {
                            const subsystem = RESOURCE_TO_SUBSYSTEM[y];
                            return (
                              <tr key={y} className="bg-white">
                                <td className="px-2 py-1.5 font-semibold text-slate-500">
                                  {RESOURCE_LABELS[y]}
                                </td>
                                {rows.map((_, i) => {
                                  const value =
                                    table[subsystem][`B_class_${i + 1}`] ?? 0;
                                  return (
                                    <td
                                      key={i}
                                      className="px-2 py-1.5 font-mono text-slate-600"
                                    >
                                      <InlineMath
                                        math={`${symbol} \\approx ${value.toFixed(5)}`}
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Step 5: total blocking probability */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Step 5 (Total blocking probability in the CC system)
                  </p>
                  <div className="overflow-x-auto">
                    <BlockMath math="B_k = 1 - \Bigl[\bigl(1 - B^*_{k,P}\bigr)\bigl(1 - B^*_{k,R}\bigr)\bigl(1 - B^*_{k,D}\bigr)\bigl(1 - B^*_{k,bps}\bigr)\Bigr], \qquad B^*_{k,y} = \rho_{k,y} \cdot V_{y,k}" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rows.map((_, i) => {
                      const value = results.Ei[`B_class_${i + 1}`] ?? 0;
                      return (
                        <div
                          key={i}
                          className="bg-white border border-slate-200 rounded-lg p-3 text-center"
                        >
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Class {i + 1}
                          </p>
                          <p className="text-sm font-mono text-sky-600">
                            <InlineMath math={`B_${i + 1} \\approx ${value.toFixed(5)}`} />
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
