"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  lagWithSteps,
  lagModelResult,
  StepGroup,
} from "@/lib/models/limited-availability-groups/lar-with-steps";
import { ServiceClass } from "@/lib/models/types";

const STEPS_MAX_ELL = 5;
const STEPS_MAX_C = 5;

type ServiceClassRow = {
  id: number;
  bu: string;
  incomingLoad_a: string;
};

const DEFAULT_ROWS: ServiceClassRow[] = [
  { id: 1, bu: "", incomingLoad_a: "" },
  { id: 2, bu: "", incomingLoad_a: "" },
];

// ─── subgroup diagram ──────────────────────────────────────────────────────
function SubgroupBox({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <div className="border border-slate-300 rounded-lg w-16 divide-y divide-dashed divide-slate-300 bg-slate-50">
        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="h-6 flex items-center justify-center text-xs text-slate-500"
          >
            {row}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">C = 4</p>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function LimitedAvailabilityGroupPage() {
  const [ell, setEll] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rows, setRows] = useState<ServiceClassRow[]>(DEFAULT_ROWS);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [utilization, setUtilization] = useState<{
    U: number;
    efficiency: number;
  } | null>(null);
  const [steps, setSteps] = useState<StepGroup[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), bu: "", incomingLoad_a: "" },
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

  const runModel = () => {
    setError("");
    setResults(null);
    setSteps([]);
    setShowSteps(false);

    const subgroups = Number(ell);
    if (!ell || isNaN(subgroups) || subgroups <= 0) {
      setError("Please enter a valid number of subgroups (ℓ).");
      return;
    }

    const C = Number(capacity);
    if (!capacity || isNaN(C) || C <= 0) {
      setError("Please enter a valid subgroup capacity (C).");
      return;
    }

    for (const row of rows) {
      if (!row.bu || !row.incomingLoad_a) {
        setError(
          "Please fill in bandwidth and offered traffic for every service class.",
        );
        return;
      }
    }

    const serviceClasses: ServiceClass[] = rows.map((row, i) => ({
      serviceClass: i + 1,
      bu: Number(row.bu),
      incomingLoad_a: Number(row.incomingLoad_a),
    }));

    setIsCalculating(true);

    // Defer to next tick so React can render the loading state before
    // the synchronous computation blocks the main thread.
    setTimeout(() => {
      try {
        if (subgroups <= STEPS_MAX_ELL && C <= STEPS_MAX_C) {
          const { results: cbp, utilization: util, steps: calcSteps } =
            lagWithSteps(subgroups, C, serviceClasses);
          setResults(cbp);
          setUtilization(util);
          setSteps(calcSteps);
        } else {
          const { results: cbp, utilization: util } =
            lagModelResult(subgroups, C, serviceClasses);
          setResults(cbp);
          setUtilization(util);
          setSteps([]);
        }
      } finally {
        setIsCalculating(false);
      }
    }, 0);
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-10">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span>Theory &amp; Formulas</span>
              {" / "}
              <span className="text-slate-700">
                Limited Availability Group Model
              </span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Limited Availability Group (LAG) Model
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              A network model where multiple separate resources, called
              subgroups, each handle their own share of the traffic.
            </p>
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              In the <strong>LAG model</strong> (also referred to as the{" "}
              <strong>Limited Availability Resources, LAR, model</strong>), the
              total capacity of the system is not a single shared pool.
              Instead, it is split into <InlineMath math="\ell" /> separate
              resources, called <strong>subgroups</strong>, each with its own
              capacity.
            </p>

            {/* subgroup diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Subgroups
              </p>
              <div className="w-full overflow-x-auto">
                <div className="flex items-end justify-center gap-4 py-1 min-w-max mx-auto">
                  <SubgroupBox label="1" />
                  <SubgroupBox label="2" />
                  <span className="text-slate-400 text-lg pb-6">&hellip;</span>
                  <SubgroupBox label={"ℓ"} />
                </div>
              </div>
              <p className="text-center text-sm text-slate-600 whitespace-nowrap">
                Total system capacity&nbsp;
                <InlineMath math="V = \ell \cdot C" />
              </p>
            </div>
          </section>

          {/* Assumptions */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Model Assumptions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-sky-800">
                  🗂️ <InlineMath math="\ell" /> identical subgroups
                </p>
                <p className="text-sm text-slate-600">
                  The model assumes the existence of{" "}
                  <InlineMath math="\ell" /> identical separate resources
                  (subgroups), each with a capacity of{" "}
                  <InlineMath math="C" /> b.u.
                </p>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-sky-800">
                  📐 Total capacity
                </p>
                <p className="text-sm text-slate-600">
                  The total capacity of all resources is{" "}
                  <InlineMath math="\ell \cdot C" /> b.u., i.e.{" "}
                  <InlineMath math="V = \ell \cdot C" />.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-amber-800">
                  🚫 No splitting
                </p>
                <p className="text-sm text-slate-600">
                  A request cannot be divided across more than one resource:
                  it must be served entirely by a single subgroup.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  🔗 Special case{" "}
                  <InlineMath math="\ell = 1" />
                </p>
                <p className="text-sm text-slate-600">
                  If there&apos;s only one resource (
                  <InlineMath math="\ell = 1" />
                  ), the model is identical to the{" "}
                  <Link
                    href="/kaufman-roberts"
                    className="text-emerald-700 font-medium hover:underline"
                  >
                    Kaufman-Roberts
                  </Link>{" "}
                  model.
                </p>
              </div>
            </div>
          </section>

          {/* Occupancy distribution */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Occupancy Distribution
            </h2>
            <p className="text-slate-600 leading-relaxed">
              As in the Kaufman-Roberts model, let <InlineMath math="q(j)" />{" "}
              be the unnormalised probability that the system is in state{" "}
              <InlineMath math="j" /> (i.e. <InlineMath math="j" /> bandwidth
              units are occupied across all subgroups). For a system with{" "}
              <InlineMath math="K" /> service-classes, where each class{" "}
              <InlineMath math="k" /> has offered load{" "}
              <InlineMath math="a_k" /> and bandwidth requirement{" "}
              <InlineMath math="b_k" />, the occupancy distribution satisfies:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath
                math="q(j) =
                \begin{cases}
                  1, & j = 0 \\[4pt]
                  \dfrac{1}{j} \displaystyle\sum_{k=1}^{K} a_k \cdot b_k \cdot \sigma_k(j-b_k) \cdot q(j-b_k), & j = 1, 2, \dots, \ell \cdot C \\[8pt]
                  0, & \text{otherwise}
                \end{cases}"
              />
            </div>

            <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
              <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
                📖
              </span>
              <p className="text-sm text-violet-900 leading-relaxed">
                The term <InlineMath math="\sigma_k(j-b_k)" /> is the factor
                that distinguishes the LAG model from Kaufman-Roberts: it
                accounts for the existence of the <InlineMath math="\ell" />{" "}
                identical subgroups, capturing how a class-<InlineMath math="k" />{" "}
                request can be placed into one of them when the system is in
                state <InlineMath math="j-b_k" />.
              </p>
            </div>

            <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
                💡
              </span>
              <p className="text-sm text-emerald-900 leading-relaxed">
                When <InlineMath math="\ell = 1" />, there is only one
                subgroup, so <InlineMath math="\sigma_k(j-b_k) = 1" /> for
                every reachable state, and the recursion above reduces to the
                familiar Kaufman-Roberts formula:
              </p>
            </div>
            <div className="overflow-x-auto py-1">
              <BlockMath math="q(j) = \frac{1}{j} \sum_{k=1}^{K} a_k \cdot b_k \cdot q(j-b_k), \qquad j = 1, 2, \dots, C" />
            </div>
          </section>

          {/* Interactive calculator */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Try it: LAG Calculator
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Enter the number of subgroups <InlineMath math="\ell" />, the
              capacity <InlineMath math="C" /> per subgroup, and the offered
              traffic per service class under a{" "}
              <strong>Complete Sharing (CS)</strong> policy.
            </p>

            {/* Subgroups & capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Number of Subgroups (ℓ)
                </label>
                <input
                  type="number"
                  min={1}
                  value={ell}
                  onChange={(e) => {
                    setEll(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. 2"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Subgroup Capacity (C) in b.u.
                </label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => {
                    setCapacity(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. 5"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
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
              <div className="grid gap-2 text-xs font-semibold text-slate-400 tracking-wider px-1 grid-cols-[24px_1fr_1fr_32px]">
                <span />
                <span>bₖ (b.u.)</span>
                <span>aₖ (erl)</span>
                <span />
              </div>

              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className="grid gap-2 items-center grid-cols-[24px_1fr_1fr_32px]"
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
              disabled={isCalculating}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Calculating…
                </>
              ) : (
                "Run Model"
              )}
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
                        Mean b.u. occupied out of {Number(ell) * Number(capacity)} b.u.
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
                        Fraction of total capacity in active use
                      </p>
                    </div>
                  </div>
                )}

                {steps.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowSteps((prev) => !prev)}
                      className="text-sky-600 font-medium text-sm hover:text-sky-700 transition-colors"
                    >
                      {showSteps ? "Hide calculation" : "Show calculation"}
                    </button>

                    {showSteps && (
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6">
                        {steps.map((group, gi) => (
                          <div key={gi} className="space-y-3">
                            <p className="text-sm font-semibold text-slate-600">
                              {group.title}
                            </p>
                            {group.formulas.map((formula, fi) => (
                              <div key={fi} className="overflow-x-auto py-1">
                                <BlockMath math={formula} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Reference */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">
              References
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                M. Vlasakis, M. Kourtesi, I-A. Chousainov, I. Keramidi, D.
                Uzunidis, O. Zestas, I. D. Moscholios and M. Logothetis.{" "}
                <em>
                  &quot;On the limited-availability group model for multirate
                  Poisson traffic.&quot;
                </em>{" "}
                Proc. Panhellenic Conf. Electronics and Telecommunications
                (PACET).
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Michael Logothetis, Ioannis D. Moscholios.{" "}
                <em>
                  Efficient Multirate Teletraffic Loss Models Beyond Erlang
                </em>
                . Wiley-IEEE Press, 2019.{" "}
                <a
                  href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  onlinelibrary.wiley.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
