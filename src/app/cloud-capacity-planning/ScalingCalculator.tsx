"use client";

import { useState } from "react";
import { InlineMath } from "react-katex";
import { calculateCloudCapacityBlockingProbabilities } from "@/lib/models/cloud-capacity-planning/proposed-model-data";
import {
  Capacities,
  ServiceClassConfigs,
} from "@/lib/models/cloud-capacity-planning/types";

const MAX_CLASSES = 6;
const MAX_CAPACITY_STEP_SEARCH = 40; // extra b.u. added to every resource, tried one at a time
const MAX_SERVER_STEP_SEARCH = 20; // extra PMs added, tried one at a time
// Base input caps. The scan can add up to MAX_CAPACITY_STEP_SEARCH more b.u.
// or MAX_SERVER_STEP_SEARCH more PMs on top of these, so the worst case
// stays well within what the underlying model can handle quickly.
const MAX_T = 30;
const MAX_CAPACITY = 60;
const MAX_LOAD = 50;
const MAX_BU = 30;

type ResourceKey = "P" | "R" | "D" | "bps";
const RESOURCE_KEYS: ResourceKey[] = ["P", "R", "D", "bps"];
const RESOURCE_LABELS: Record<ResourceKey, string> = {
  P: "Processor",
  R: "RAM",
  D: "Disk",
  bps: "Network",
};

// AWS's EC2 on-demand SLA credit tiers, expressed as blocking-probability
// (CBP) thresholds: CBP = 1 - uptime, so 99.99% uptime <=> CBP <= 0.0001.
const SLA_TIERS = [
  {
    maxCbp: 0.0001,
    uptime: "≥ 99.99%",
    credit: "meets the standard SLA, no credit owed",
  },
  { maxCbp: 0.01, uptime: "99.0% – 99.99%", credit: "10% service credit tier" },
  { maxCbp: 0.05, uptime: "95.0% – 99.0%", credit: "30% service credit tier" },
  { maxCbp: Infinity, uptime: "< 95.0%", credit: "100% service credit tier" },
] as const;

const getSlaTier = (cbp: number) =>
  SLA_TIERS.find((tier) => cbp <= tier.maxCbp) ??
  SLA_TIERS[SLA_TIERS.length - 1];

type ScalingMode = "capacity" | "servers";

type ServiceClassRow = {
  id: number;
  incomingLoad_a: string;
  bu: Record<ResourceKey, string>;
};

const DEFAULT_ROWS: ServiceClassRow[] = [
  { id: 1, incomingLoad_a: "", bu: { P: "", R: "", D: "", bps: "" } },
  { id: 2, incomingLoad_a: "", bu: { P: "", R: "", D: "", bps: "" } },
];

type ScanRow = { step: number; maxB: number };

type ScalingResult = {
  mode: ScalingMode;
  found: boolean;
  step: number | null;
  capacities: Record<ResourceKey, number> | null;
  totalT: number | null;
  perClassB: Record<string, number> | null;
  scan: ScanRow[];
};

export default function ScalingCalculator() {
  const [T, setT] = useState("");
  const [baseCapacities, setBaseCapacities] = useState<
    Record<ResourceKey, string>
  >({
    P: "",
    R: "",
    D: "",
    bps: "",
  });
  const [rows, setRows] = useState<ServiceClassRow[]>(DEFAULT_ROWS);
  const [targetCbpInput, setTargetCbpInput] = useState("1");
  const [scalingMode, setScalingMode] = useState<ScalingMode>("capacity");
  const [result, setResult] = useState<ScalingResult | null>(null);
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
    setResult(null);
    setError("");
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setResult(null);
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

  const runScan = () => {
    setError("");
    setResult(null);

    const groupSize = Number(T);
    if (!T || isNaN(groupSize) || groupSize <= 0) {
      setError(
        "Please enter the specific number of physical machines (T) you have.",
      );
      return;
    }
    if (groupSize > MAX_T) {
      setError(
        `T is capped at ${MAX_T} to keep the search fast. Try scaling down: e.g. use 3 to represent 30 machines.`,
      );
      return;
    }

    const baseCapacityValues: Record<ResourceKey, number> = {
      P: Number(baseCapacities.P),
      R: Number(baseCapacities.R),
      D: Number(baseCapacities.D),
      bps: Number(baseCapacities.bps),
    };
    for (const y of RESOURCE_KEYS) {
      if (
        !baseCapacities[y] ||
        isNaN(baseCapacityValues[y]) ||
        baseCapacityValues[y] <= 0
      ) {
        setError(
          `Please enter a valid current capacity for ${RESOURCE_LABELS[y]}.`,
        );
        return;
      }
      if (baseCapacityValues[y] > MAX_CAPACITY) {
        setError(
          `${RESOURCE_LABELS[y]} capacity is capped at ${MAX_CAPACITY} b.u. Try scaling down: e.g. use 6 to represent 60 b.u.`,
        );
        return;
      }
    }

    for (const row of rows) {
      if (!row.incomingLoad_a) {
        setError("Please fill in the offered traffic for every service class.");
        return;
      }
      if (Number(row.incomingLoad_a) > MAX_LOAD) {
        setError(
          `Offered traffic is capped at ${MAX_LOAD} erl per class. Try scaling down: e.g. use 5 to represent 50 erl.`,
        );
        return;
      }
      for (const y of RESOURCE_KEYS) {
        if (!row.bu[y]) {
          setError(
            `Please fill in the ${RESOURCE_LABELS[y]} demand for every service class.`,
          );
          return;
        }
        if (Number(row.bu[y]) > MAX_BU) {
          setError(
            `${RESOURCE_LABELS[y]} demand is capped at ${MAX_BU} b.u. per class.`,
          );
          return;
        }
      }
    }

    const targetCbp = Number(targetCbpInput) / 100;
    if (isNaN(targetCbp) || targetCbp <= 0 || targetCbp >= 1) {
      setError("Target CBP must be a number between 0 and 100 (exclusive).");
      return;
    }

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
        const scan: ScanRow[] = [];
        let found = false;
        let foundStep: number | null = null;
        let foundCapacities: Record<ResourceKey, number> | null = null;
        let foundTotalT: number | null = null;
        let perClassB: Record<string, number> | null = null;

        if (scalingMode === "capacity") {
          for (let step = 0; step <= MAX_CAPACITY_STEP_SEARCH; step++) {
            const stepCapacities: Record<ResourceKey, number> = {
              P: baseCapacityValues.P + step,
              R: baseCapacityValues.R + step,
              D: baseCapacityValues.D + step,
              bps: baseCapacityValues.bps + step,
            };
            const capacitiesForModel: Capacities = {
              ramCapacity: { link: 1, bu: stepCapacities.R },
              processorCapacity: { link: 2, bu: stepCapacities.P },
              diskCapacity: { link: 3, bu: stepCapacities.D },
              bpsCapacity: { link: 4, bu: stepCapacities.bps },
            };

            const { Ei } = calculateCloudCapacityBlockingProbabilities(
              groupSize,
              capacitiesForModel,
              serviceClassConfigs,
            );
            const values = Object.values(Ei);
            const maxB = values.length > 0 ? Math.max(...values) : 0;
            scan.push({ step, maxB });

            if (isFinite(maxB) && maxB <= targetCbp) {
              found = true;
              foundStep = step;
              foundCapacities = stepCapacities;
              perClassB = Ei;
              break;
            }
          }
        } else {
          const capacitiesForModel: Capacities = {
            ramCapacity: { link: 1, bu: baseCapacityValues.R },
            processorCapacity: { link: 2, bu: baseCapacityValues.P },
            diskCapacity: { link: 3, bu: baseCapacityValues.D },
            bpsCapacity: { link: 4, bu: baseCapacityValues.bps },
          };

          for (let step = 0; step <= MAX_SERVER_STEP_SEARCH; step++) {
            const totalT = groupSize + step;
            const { Ei } = calculateCloudCapacityBlockingProbabilities(
              totalT,
              capacitiesForModel,
              serviceClassConfigs,
            );
            const values = Object.values(Ei);
            const maxB = values.length > 0 ? Math.max(...values) : 0;
            scan.push({ step, maxB });

            if (isFinite(maxB) && maxB <= targetCbp) {
              found = true;
              foundStep = step;
              foundTotalT = totalT;
              perClassB = Ei;
              break;
            }
          }
        }

        setResult({
          mode: scalingMode,
          found,
          step: foundStep,
          capacities: foundCapacities,
          totalT: foundTotalT,
          perClassB,
          scan,
        });
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
        Try it: How Much Do I Need to Scale?
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        Say you already have a fixed number of physical machines{" "}
        <InlineMath math="T" />. Add your current CPU, RAM, disk, and network
        capacity per machine, the traffic for each type of VM you run (small,
        medium, large, or whatever mix you offer), and how much blocking
        you&apos;re willing to accept, to find the smallest change, either
        upgrading each machine or adding more of them, that keeps <em>every</em>{" "}
        VM type at or below that target, not just the average.
      </p>

      {/* What does a blocking % mean? */}
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">💡</span>
        <div className="text-sm text-violet-900 leading-relaxed space-y-2">
          <p>
            <strong>What does a blocking percentage actually mean?</strong> A
            target of <InlineMath math="1\%" /> means about 1 in every 100 VM
            requests gets rejected because no physical machine had room for it,
            the rest are accepted right away. It is the same idea as an SLA
            number: a &ldquo;99% availability&rdquo; commitment is another way
            of saying &ldquo;at most 1% of requests can fail&rdquo;, and
            &ldquo;99.9%&rdquo; (three nines) corresponds to a stricter{" "}
            <InlineMath math="0.1\%" /> target.
          </p>
          <p>
            It is also a trade-off against how full your machines run. To work
            out the maximum traffic a system can support, it helps to require
            the blocking probability stay below <InlineMath math="0.01\%" />{" "}
            (or, at most, <InlineMath math="0.02\%" />
            ), a success rate of 99.99% or higher across every VM type. But that
            safety margin has a cost: at a blocking probability below{" "}
            <InlineMath math="0.02\%" />, system utilisation can drop to around
            43%, meaning the system is underutilised. More than half of its
            capacity, and the energy that powers it, sits idle: hardware stays
            switched on without being put to use, which drives up cost, energy
            use, and carbon footprint. Accepting a higher target (e.g.{" "}
            <InlineMath math="5\%" />) lets you run machines closer to fully
            utilised, but more requests get turned away when several arrive at
            once.
          </p>
        </div>
      </div>

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          For the calculator prefer smaller numbers: think of them as tens
          rather than ones, e.g. enter 1 to represent 10 real machines or b.u.,
          5 for 50, 10 for 100. The blocking probabilities come out the same
          either way, and smaller numbers keep the search fast. Inputs are
          capped at T&nbsp;≤&nbsp;
          {MAX_T}, capacity&nbsp;≤&nbsp;{MAX_CAPACITY} b.u., and
          traffic&nbsp;≤&nbsp;{MAX_LOAD}&nbsp;erl per class.
        </p>
      </div>

      {/* T: fixed number of physical machines */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Number of physical machines you have now (T)
        </label>
        <input
          type="number"
          min={1}
          max={MAX_T}
          value={T}
          onChange={(e) => {
            setT(e.target.value);
            setError("");
          }}
          placeholder="e.g. 4"
          className="w-full sm:w-48 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RESOURCE_KEYS.map((y) => (
          <div key={y}>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Current {RESOURCE_LABELS[y]} capacity (per PM)
            </label>
            <input
              type="number"
              min={1}
              max={MAX_CAPACITY}
              value={baseCapacities[y]}
              onChange={(e) => {
                setBaseCapacities((prev) => ({ ...prev, [y]: e.target.value }));
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
            VM Types (Service Classes){" "}
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
        <p className="text-xs text-slate-400">
          Add one row per VM size you offer, e.g. small/medium/large, or
          general-purpose vs. memory-optimised. Each can have its own traffic
          and its own resource footprint.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left px-1 w-10" />
                <th className="text-left px-1">aₖ per PM (erl)</th>
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
                      max={MAX_LOAD}
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
                        max={MAX_BU}
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

      {/* Target CBP */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Target blocking probability (%)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={targetCbpInput}
          onChange={(e) => {
            setTargetCbpInput(e.target.value);
            setError("");
          }}
          placeholder="e.g. 1"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {/* Scaling mode */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          How would you like to scale?
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "capacity" as const, label: "Upgrade existing machines" },
            { value: "servers" as const, label: "Add more machines" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setScalingMode(value);
                setResult(null);
                setError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150 ${
                scalingMode === value
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-slate-500 border-slate-300 hover:border-sky-400 hover:text-sky-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {scalingMode === "capacity"
            ? `The search tries adding 0, 1, 2, … b.u. (up to ${MAX_CAPACITY_STEP_SEARCH}) to every resource on each of the T machines you already have, keeping T fixed.`
            : `The search tries adding 0, 1, 2, … extra machines (up to ${MAX_SERVER_STEP_SEARCH}) with the same per-machine capacity you entered above, keeping capacity per machine fixed.`}
        </p>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <button
        onClick={runScan}
        disabled={isCalculating}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
      >
        {isCalculating ? "Calculating…" : "Find What I Need"}
      </button>

      {/* Results */}
      {result !== null && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          {result.found ? (
            result.mode === "capacity" && result.capacities ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  {result.step === 0
                    ? "You're already there"
                    : `Required capacity per PM (${T} PMs total)`}
                </p>
                {result.step === 0 ? (
                  <p className="text-lg font-bold text-emerald-700">
                    No capacity upgrade needed
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {RESOURCE_KEYS.map((y) => (
                      <div key={y}>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wider">
                          {RESOURCE_LABELS[y]}
                        </p>
                        <p className="text-xl font-bold text-emerald-700">
                          {result.capacities![y]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-emerald-600">
                  {result.step === 0
                    ? "Your current capacity already keeps every VM type at or below the target, with T unchanged."
                    : `That's +${result.step} b.u. on every resource compared to what you have now.`}
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  {result.step === 0
                    ? "You're already there"
                    : "Machines needed"}
                </p>
                <p className="text-3xl font-bold text-emerald-700">
                  {result.step === 0
                    ? "No new machines needed"
                    : `${result.totalT} PMs total`}
                </p>
                <p className="text-xs text-emerald-600">
                  {result.step === 0
                    ? `Your current ${T} machines already keep every VM type at or below the target.`
                    : `That's +${result.step} more machine${result.step === 1 ? "" : "s"} than the ${T} you have now, same capacity per machine.`}
                </p>
              </div>
            )
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-1">
              <p className="text-sm font-semibold text-red-700">
                {result.mode === "capacity"
                  ? `No capacity increase up to +${MAX_CAPACITY_STEP_SEARCH} b.u. reaches the target with T = ${T} PMs.`
                  : `Adding up to ${MAX_SERVER_STEP_SEARCH} more machines does not reach the target.`}
              </p>
              <p className="text-xs text-red-600">
                Try a higher target blocking probability, the other scaling
                option, or lower per-class traffic.
              </p>
            </div>
          )}

          {result.perClassB && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rows.map((_, i) => {
                const key = `B_class_${i + 1}`;
                const value = result.perClassB![key] ?? 0;
                const sla = getSlaTier(value);
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
                    <p className="text-xs text-violet-600">
                      SLA: {sla.uptime} uptime — {sla.credit}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scan trend table */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {result.mode === "capacity"
                ? `How blocking drops as capacity grows (T = ${T} fixed)`
                : `How blocking drops as machines are added (capacity per PM fixed)`}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                    <th className="text-left px-2">
                      {result.mode === "capacity"
                        ? "+b.u. per resource"
                        : "+PMs"}
                    </th>
                    <th className="text-left px-2">Worst-class CBP</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scan.map(({ step, maxB }) => (
                    <tr
                      key={step}
                      className={
                        result.step === step ? "bg-emerald-50" : "bg-slate-50"
                      }
                    >
                      <td className="px-2 py-1.5 font-mono text-slate-600">
                        +{step}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-slate-600">
                        {(maxB * 100).toFixed(4)}%
                        {result.step === step && (
                          <span className="ml-2 text-[10px] font-semibold text-emerald-600 uppercase">
                            target met
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
