"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import KaufmanRobertsAnimation from "./KaufmanRobertsAnimation";
import KaufmanRobertsBRAnimation from "./KaufmanRobertsBRAnimation";
import { callBlockingProbability } from "@/lib/models/kaufman-roberts/call-blocking-probability";
import { kaufmanRoberts } from "@/lib/models/kaufman-roberts/kaufman-roberts-formula";
import { robertsFormulaBRPolicy } from "@/lib/models/kaufman-roberts/roberts-formula-br-policy";
import { linkUtilizationFromProbabilities } from "@/lib/models/kaufman-roberts/link-utilization";
import { ServiceClass, ServiceClassWithBR } from "@/lib/models/types";

type Policy = "CS" | "BR";

type ServiceClassRow = {
  id: number;
  bu: string;
  incomingLoad_a: string;
  tk: string;
};

const DEFAULT_ROWS: ServiceClassRow[] = [
  { id: 1, bu: "", incomingLoad_a: "", tk: "" },
  { id: 2, bu: "", incomingLoad_a: "", tk: "" },
];

export default function KaufmanRobertsPage() {
  type AnimStatus = "stopped" | "running" | "paused";
  const [animStatus, setAnimStatus] = useState<AnimStatus>("stopped");
  const [animPolicy, setAnimPolicy] = useState<Policy>("CS");

  const switchAnimPolicy = (p: Policy) => {
    setAnimStatus("stopped");
    setAnimPolicy(p);
  };
  const [policy, setPolicy] = useState<Policy>("CS");
  const [capacity, setCapacity] = useState("");
  const [rows, setRows] = useState<ServiceClassRow[]>(DEFAULT_ROWS);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [utilization, setUtilization] = useState<{
    U: number;
    efficiency: number;
  } | null>(null);
  const [error, setError] = useState("");

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), bu: "", incomingLoad_a: "", tk: "" },
    ]);
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (
    id: number,
    field: keyof Omit<ServiceClassRow, "id">,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
    setError("");
  };

  const switchPolicy = (p: Policy) => {
    setPolicy(p);
    setResults(null);
    setUtilization(null);
    setError("");
  };

  const runModel = () => {
    setError("");
    setResults(null);

    const C = Number(capacity);
    if (!capacity || isNaN(C) || C <= 0) {
      setError("Please enter a valid system capacity.");
      return;
    }

    for (const row of rows) {
      if (!row.bu || !row.incomingLoad_a) {
        setError(
          "Please fill in bandwidth and offered traffic for every service class.",
        );
        return;
      }
      if (policy === "BR" && row.tk === "") {
        setError(
          "Please fill in the reservation (tₖ) for every service class.",
        );
        return;
      }
    }

    const serviceClasses: ServiceClass[] | ServiceClassWithBR[] = rows.map(
      (row, i) => {
        const base: ServiceClass = {
          serviceClass: i + 1,
          bu: Number(row.bu),
          incomingLoad_a: Number(row.incomingLoad_a),
        };
        if (policy === "BR") {
          return { ...base, tk: Number(row.tk) } as ServiceClassWithBR;
        }
        return base;
      },
    );

    const cbp = callBlockingProbability(C, serviceClasses);
    setResults(cbp);

    const probabilities =
      policy === "BR"
        ? robertsFormulaBRPolicy(C, serviceClasses as ServiceClassWithBR[])
        : kaufmanRoberts(C, serviceClasses);

    setUtilization(linkUtilizationFromProbabilities(C, probabilities));
  };

  const gosEqualised =
    results !== null &&
    Object.values(results).length > 1 &&
    Object.values(results).every(
      (v, _, arr) => Math.abs(v - arr[0]) < 0.000001,
    );

  return (
    <Layout>
      <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          {/* ── Main card ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm text-slate-500 mb-2">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                {" / "}
                <span className="text-slate-700">Kaufman-Roberts Model</span>
              </p>
              <h1 className="text-2xl font-bold text-slate-800">
                Kaufman-Roberts Model (or EMLM)
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Multirate loss model for systems where multiple service classes
                share a single link (or resource) with finite capacity.
              </p>
            </div>

            {/* ── History ──────────────────────────────────────────────────── */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Kaufman and Roberts introduced the recursion formula for
                calculating the occupancy distribution{" "}
                <InlineMath math="q(j)" />. Remarkably, both researchers,
                Kaufman at Bell Laboratories in the United States and Roberts at
                France Telekom, developed the same formula in 1981 while working
                on similar problems, unaware of each other&apos;s efforts. Known
                as the{" "}
                <span className="font-semibold text-slate-700">
                  Kaufman-Roberts formula
                </span>
                , this recursion provides both accuracy and computational
                efficiency, offering a straightforward implementation.
              </p>

              {/* Formula */}
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recursion formula
                </p>
                <BlockMath math="q(j) = \frac{1}{j} \sum_{i=1}^{I} \alpha_i \cdot b_i \cdot q(j - b_i) \qquad \text{for } j = 1, 2, \ldots, C" />
                <p className="text-xs text-slate-400">
                  with boundary condition <InlineMath math="q(0) = 1" /> and{" "}
                  <InlineMath math="q(j) = 0" /> for <InlineMath math="j < 0" />
                  . After computing all values, normalise so that{" "}
                  <InlineMath math="\sum_{j=0}^{C} q(j) = 1" />.
                </p>

                {/* Parameter table */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
                  {[
                    [
                      "q(j)",
                      "Normalised state probability that j b.u. are occupied",
                    ],
                    ["C", "Total system capacity in bandwidth units (b.u.)"],
                    ["I", "Number of service classes"],
                    [
                      "αᵢ",
                      "Offered traffic (arrival rate / service rate) for class i",
                    ],
                    ["bᵢ", "Bandwidth demand per call of class i (b.u.)"],
                  ].map(([sym, desc]) => (
                    <div
                      key={sym}
                      className="flex gap-2 items-start col-span-1 sm:col-span-1"
                    >
                      <span className="font-mono font-semibold text-sky-700 w-10 flex-shrink-0">
                        {sym}
                      </span>
                      <span className="text-slate-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recursion insight */}
              <div className="space-y-3">
                <p>
                  The key aspect of the recursive calculation is linking the
                  values of <InlineMath math="q(j)" /> to the previous values
                  of <InlineMath math="q(j - b_i)" />.
                </p>
                <p>
                  If <InlineMath math="j = 0" />, where no basic units are
                  occupied, then <InlineMath math="q(0) = 1" />. This is only
                  valid when the system is in an idle state and serves as the
                  starting point of the recursion.
                </p>
                <p>
                  <InlineMath math="q(1)" /> represents the unnormalised
                  probability of transitioning from an empty system to a state
                  where exactly one b.u. is occupied due to the arrival of a
                  new call. It reflects how likely the system is to reach a
                  state where one unit is in use, given the arrival rates and
                  service dynamics.
                </p>
              </div>

              {/* Worked example */}
              <div className="bg-white border border-sky-100 rounded-lg px-4 py-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Worked example: computing q(1)
                </p>
                <p className="text-xs text-slate-500">
                  Consider a system with capacity{" "}
                  <InlineMath math="C = 5" /> b.u. and{" "}
                  <InlineMath math="I = 2" /> service classes where{" "}
                  <InlineMath math="b_1 = 1" /> b.u.,{" "}
                  <InlineMath math="\alpha_1 = 1" /> erl,{" "}
                  <InlineMath math="b_2 = 2" /> b.u.,{" "}
                  <InlineMath math="\alpha_2 = 1" /> erl.
                </p>
                <p className="text-xs text-slate-500">
                  Expanding the recursion for <InlineMath math="j = 1" />:
                </p>
                <BlockMath math="q(1) = \frac{1}{1}\bigl[\alpha_1 \cdot b_1 \cdot q(1 - b_1) + \alpha_2 \cdot b_2 \cdot q(1 - b_2)\bigr]" />
                <p className="text-xs text-slate-500">
                  Substituting the given values:
                </p>
                <BlockMath math="q(1) = 1\bigl[1 \cdot 1 \cdot q(0) + 1 \cdot 2 \cdot q(-1)\bigr]" />
                <p className="text-xs text-slate-500">
                  Since <InlineMath math="q(0) = 1" /> and{" "}
                  <InlineMath math="q(-1) = 0" /> (boundary condition):
                </p>
                <BlockMath math="q(1) = 1 \cdot 1 \cdot 1 + 1 \cdot 2 \cdot 0 = 1" />
                <p className="text-xs text-slate-400">
                  This unnormalised value will be divided by the sum of all{" "}
                  <InlineMath math="q(j)" /> for{" "}
                  <InlineMath math="j = 0, \ldots, C" /> to obtain the true
                  steady-state probability.
                </p>
              </div>

              <p className="text-xs text-slate-400">
                The formula computes the exact steady-state distribution under a
                Poisson arrival process and exponentially distributed holding
                times, assuming a Complete Sharing (CS) policy. For Bandwidth
                Reservation (BR), the Roberts extension modifies which states
                are accessible to each class.
              </p>
            </div>

            {/* Policy toggle */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">
                Bandwidth Sharing Policy
              </p>
              <div className="flex gap-2 flex-wrap">
                {(["CS", "BR"] as Policy[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => switchPolicy(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors duration-150 ${
                      policy === p
                        ? "bg-sky-500 text-white border-sky-500"
                        : "bg-white text-slate-600 border-slate-300 hover:border-sky-400 hover:text-sky-600"
                    }`}
                  >
                    {p === "CS"
                      ? "Complete Sharing (CS)"
                      : "Bandwidth Reservation (BR)"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                {policy === "CS"
                  ? "All service classes compete freely for the full system capacity."
                  : "Each class k has a reserved amount tₖ, giving it an effective capacity of C − tₖ."}
              </p>
            </div>

            {/* System capacity */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                System Capacity (C) in b.u.
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => {
                  setCapacity(e.target.value);
                  setError("");
                }}
                placeholder="e.g. 10"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Service classes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">
                  Service Classes
                </p>
                <button
                  onClick={addRow}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium border border-sky-300 rounded-md px-2 py-1 hover:bg-sky-50 transition"
                >
                  + Add class
                </button>
              </div>

              {/* Column headers */}
              <div
                className={`grid gap-2 text-xs font-semibold text-slate-400 tracking-wider px-1 ${
                  policy === "BR"
                    ? "grid-cols-[24px_1fr_1fr_1fr_32px]"
                    : "grid-cols-[24px_1fr_1fr_32px]"
                }`}
              >
                <span />
                <span>bₖ (b.u.)</span>
                <span>aₖ (erl)</span>
                {policy === "BR" && <span>tₖ (b.u.)</span>}
                <span />
              </div>

              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className={`grid gap-2 items-center ${
                    policy === "BR"
                      ? "grid-cols-[24px_1fr_1fr_1fr_32px]"
                      : "grid-cols-[24px_1fr_1fr_32px]"
                  }`}
                >
                  {/* Class label */}
                  <span className="text-xs font-bold text-slate-400 text-center">
                    k{i + 1}
                  </span>

                  {/* Bandwidth */}
                  <input
                    type="number"
                    min={1}
                    value={row.bu}
                    onChange={(e) => updateRow(row.id, "bu", e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />

                  {/* Offered traffic */}
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={row.incomingLoad_a}
                    onChange={(e) =>
                      updateRow(row.id, "incomingLoad_a", e.target.value)
                    }
                    placeholder="e.g. 2"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />

                  {/* Reservation — BR only */}
                  {policy === "BR" && (
                    <input
                      type="number"
                      min={0}
                      value={row.tk}
                      onChange={(e) => updateRow(row.id, "tk", e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    aria-label={`Remove class k${i + 1}`}
                    className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition text-xl leading-none font-light"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button
              onClick={runModel}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition-colors duration-150"
            >
              Run Model
            </button>

            {/* Results */}
            {results !== null && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="font-semibold text-slate-700">
                  Call Blocking Probabilities
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(results).map(([key, value]) => {
                    const idx = key.replace("B_class_", "");
                    const percent = (value * 100).toFixed(4);
                    return (
                      <div
                        key={key}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1"
                      >
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Class {idx}
                        </p>
                        <p className="text-2xl font-bold text-sky-600">
                          {percent}%
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          B<sub>{idx}</sub> = {value.toFixed(7)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {utilization !== null && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Link Utilization
                      </p>
                      <p className="text-2xl font-bold text-violet-600">
                        {utilization.U.toFixed(4)} b.u.
                      </p>
                      <p className="text-xs text-slate-400">
                        Mean b.u. occupied out of {capacity} b.u.
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Trunk Efficiency
                      </p>
                      <p className="text-2xl font-bold text-violet-600">
                        {utilization.efficiency.toFixed(2)}%
                      </p>
                      <p className="text-xs text-slate-400">
                        Fraction of capacity in active use
                      </p>
                    </div>
                  </div>
                )}

                {gosEqualised && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-2">
                    <span className="text-emerald-600 text-lg">⚖️</span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        GoS equalisation achieved
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        All service classes share the same blocking probability.
                        The reservation parameters satisfy b&#x2096; + t&#x2096;
                        = constant.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Animation card ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Processor Animation
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  C = 5 b.u. · 3 service classes
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Policy toggle */}
                {(["CS", "BR"] as Policy[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => switchAnimPolicy(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150 ${
                      animPolicy === p
                        ? "bg-sky-500 text-white border-sky-500"
                        : "bg-white text-slate-500 border-slate-300 hover:border-sky-400 hover:text-sky-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {/* Start / Pause / Stop */}
                {animStatus === "stopped" && (
                  <button
                    onClick={() => setAnimStatus("running")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-150"
                  >
                    Start
                  </button>
                )}
                {animStatus === "running" && (
                  <>
                    <button
                      onClick={() => setAnimStatus("paused")}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors duration-150"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => setAnimStatus("stopped")}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-150"
                    >
                      Stop
                    </button>
                  </>
                )}
                {animStatus === "paused" && (
                  <>
                    <button
                      onClick={() => setAnimStatus("running")}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-150"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setAnimStatus("stopped")}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-150"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            {animPolicy === "CS" ? (
              <KaufmanRobertsAnimation status={animStatus} />
            ) : (
              <KaufmanRobertsBRAnimation status={animStatus} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
