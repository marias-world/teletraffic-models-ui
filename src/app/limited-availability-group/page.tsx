"use client";

import { useState } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  lagWithSteps,
  lagModelResult,
  StepGroup,
} from "@/lib/models/limited-availability-groups/lar-with-steps";
import { ServiceClass } from "@/lib/models/types";
import LimitedAvailabilityGroupAnimation, {
  AnimClass,
} from "./LimitedAvailabilityGroupAnimation";

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
  type AnimStatus = "stopped" | "running" | "paused";
  const [animStatus, setAnimStatus] = useState<AnimStatus>("stopped");
  const [animEll, setAnimEll] = useState(3);
  const [animC, setAnimC] = useState(4);
  const [animClasses, setAnimClasses] = useState<AnimClass[]>([
    { id: 1, bu: 1, incomingLoad_a: 2, desc: "Voice call" },
    { id: 2, bu: 3, incomingLoad_a: 1, desc: "Video stream" },
  ]);

  function stopAndApply(fn: () => void) {
    setAnimStatus("stopped");
    fn();
  }

  function updateAnimClass(
    id: number,
    field: keyof Omit<AnimClass, "id">,
    value: string | number,
  ) {
    stopAndApply(() =>
      setAnimClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      ),
    );
  }

  function addAnimClass() {
    if (animClasses.length >= 4) return;
    stopAndApply(() =>
      setAnimClasses((prev) => [
        ...prev,
        {
          id: Date.now(),
          bu: 1,
          incomingLoad_a: 1,
          desc: `Class ${prev.length + 1}`,
        },
      ]),
    );
  }

  function removeAnimClass(id: number) {
    if (animClasses.length <= 1) return;
    stopAndApply(() =>
      setAnimClasses((prev) => prev.filter((c) => c.id !== id)),
    );
  }

  const animKey = `${animEll}-${animC}-${animClasses.map((c) => `${c.bu}:${c.incomingLoad_a}`).join(",")}`;

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
          const {
            results: cbp,
            utilization: util,
            steps: calcSteps,
          } = lagWithSteps(subgroups, C, serviceClasses);
          setResults(cbp);
          setUtilization(util);
          setSteps(calcSteps);
        } else {
          const { results: cbp, utilization: util } = lagModelResult(
            subgroups,
            C,
            serviceClasses,
          );
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
    <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-10">
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
              total capacity of the system is not a single shared pool. Instead,
              it is split into <InlineMath math="\ell" /> separate resources,
              called <strong>subgroups</strong>, each with its own capacity.
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
                  The model assumes the existence of <InlineMath math="\ell" />{" "}
                  identical separate resources (subgroups), each with a capacity
                  of <InlineMath math="C" /> b.u.
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
                  A request cannot be divided across more than one resource: it
                  must be served entirely by a single subgroup.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  🔗 Special case <InlineMath math="\ell = 1" />
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
              As in the Kaufman-Roberts model, let <InlineMath math="q(j)" /> be
              the unnormalised probability that the system is in state{" "}
              <InlineMath math="j" /> (i.e. <InlineMath math="j" /> bandwidth
              units are occupied across all subgroups). For a system with{" "}
              <InlineMath math="K" /> service-classes, where each class{" "}
              <InlineMath math="k" /> has offered load <InlineMath math="a_k" />{" "}
              and bandwidth requirement <InlineMath math="b_k" />, the occupancy
              distribution satisfies:
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
              <div className="space-y-2">
                <p className="text-sm text-violet-900 leading-relaxed">
                  The term <InlineMath math="\sigma_k(j-b_k)" /> is the factor
                  that distinguishes the LAG model from Kaufman-Roberts: it
                  accounts for the existence of the <InlineMath math="\ell" />{" "}
                  identical subgroups, capturing how a class-
                  <InlineMath math="k" /> request can be placed into one of them
                  when the system is in state <InlineMath math="j-b_k" />.
                </p>
                <p className="text-sm text-violet-900 leading-relaxed">
                  Computing <InlineMath math="\sigma_k(j)" /> requires counting
                  valid bandwidth arrangements across subgroups with capacity
                  constraints: a combinatorial problem solved with the{" "}
                  <strong>Stars and Bars</strong> method combined with the{" "}
                  <Link
                    href="/theory/inclusion-exclusion#stars-and-bars-example"
                    className="text-violet-700 font-medium hover:underline"
                  >
                    Inclusion-Exclusion Principle
                  </Link>
                  .{" "}
                  <Link
                    href="/theory/conditional-transition-probability"
                    className="text-violet-700 font-medium hover:underline"
                  >
                    <strong>
                      See full explanation and step-by-step example.
                    </strong>
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
                💡
              </span>
              <p className="text-sm text-emerald-900 leading-relaxed">
                When <InlineMath math="\ell = 1" />, there is only one subgroup,
                so <InlineMath math="\sigma_k(j-b_k) = 1" /> for every reachable
                state, and the recursion above reduces to the familiar
                <Link
                  href="/kaufman-roberts"
                  className="text-violet-700 font-medium hover:underline"
                >
                  <strong> Kaufman-Roberts formula</strong>
                </Link>
              </p>
            </div>
            <div className="overflow-x-auto py-1">
              <BlockMath math="q(j) = \frac{1}{j} \sum_{k=1}^{K} a_k \cdot b_k \cdot q(j-b_k), \qquad j = 1, 2, \dots, C" />
            </div>
          </section>

          {/* Blocking probability */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Blocking Probability
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Once the occupancy distribution is known, the unnormalised values{" "}
              <InlineMath math="q(j)" /> are normalised so they sum to 1:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath math="Q(j) = \frac{q(j)}{G}, \qquad G = \sum_{j} q(j)" />
            </div>

            <p className="text-slate-600 leading-relaxed">
              After finding all the probabilities <InlineMath math="q(j)" /> and{" "}
              <InlineMath math="\sigma_k(j)" />, we can calculate the CBP for
              the class <InlineMath math="k" /> calls via the formula:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath math="B_k = \sum_{j = \ell C - \ell b_k + \ell}^{\ell C} Q(j)\,\bigl(1 - \sigma_k(j)\bigr)" />
            </div>

            <p className="text-slate-600 leading-relaxed text-sm">
              where <InlineMath math="j = \ell C - \ell b_k + \ell" /> indicates
              the threshold beyond which a new class <InlineMath math="k" />{" "}
              call cannot be accepted, leading the system to block it. This
              mechanism ensures that all states where the system reaches or
              exceeds this point are accurately included in the CBP calculation.
            </p>
          </section>

          {/* Assumptions */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Model Approximations
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              The recursion above relies on two approximations that keep the
              calculation simple enough to run in practice.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
                <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">
                  1️⃣
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-sky-800">
                    Assumption 1: <InlineMath math="\sigma_k" /> depends only on
                    total occupied b.u.
                  </p>
                  <p className="text-sm text-sky-900 leading-relaxed">
                    In the exact model, the probability of accepting a class-
                    <InlineMath math="k" /> call depends on how many calls of
                    each type are in each specific subgroup, a very large state
                    space. We simplify by assuming it depends only on the{" "}
                    <strong>total number of busy b.u.</strong> across all
                    subgroups, <InlineMath math="j" />:
                  </p>
                  <div className="overflow-x-auto">
                    <BlockMath math="\sigma_k(n_{1,1},\,n_{1,2},\,\ldots,\,n_{K,\ell}) \approx \sigma_k(j)" />
                  </div>
                  {/* Visual: two scenarios with same j but different outcomes */}
                  <div className="rounded-lg border border-sky-200 bg-white p-3 space-y-3">
                    <p className="text-[11px] font-semibold text-slate-500 tracking-wider text-center">
                      Example: ℓ=3, C=5, j=12. New class-k call arrives (needs 2
                      free b.u. in one resource).
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                      {[
                        {
                          label: "Scenario 1",
                          busy: [4, 4, 4],
                          result: "blocked",
                          resultColor: "text-red-600",
                          icon: "✗",
                        },
                        {
                          label: "Scenario 2",
                          busy: [5, 4, 3],
                          result: "accepted (fits in R3)",
                          resultColor: "text-emerald-600",
                          icon: "✓",
                        },
                      ].map(({ label, busy, result, resultColor, icon }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-2"
                        >
                          <p className="text-[11px] font-semibold text-slate-600">
                            {label} (j = {busy.reduce((a, b) => a + b, 0)})
                          </p>
                          <div className="flex gap-2 items-end">
                            {busy.map((b, gi) => (
                              <div
                                key={gi}
                                className="flex flex-col items-center gap-0.5"
                              >
                                <div className="flex flex-col-reverse gap-0.5">
                                  {Array.from({ length: 5 }).map((_, si) => (
                                    <div
                                      key={si}
                                      className={`w-7 h-4 rounded-sm border ${si < b ? "bg-slate-400 border-slate-500" : "bg-sky-100 border-sky-300"}`}
                                    />
                                  ))}
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  R{gi + 1}
                                </p>
                              </div>
                            ))}
                          </div>
                          <p className={`text-xs font-semibold ${resultColor}`}>
                            {icon} {result}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">
                      Both have j=12, so the model uses the same{" "}
                      <InlineMath math="\sigma_k(12)" /> for both — even though
                      the real outcome differs.
                    </p>
                  </div>

                  <p className="text-xs text-sky-700 leading-relaxed">
                    This reduces the problem from a high-dimensional state space
                    to the simple 1D recursion. It is an approximation: two
                    states with the same <InlineMath math="j" /> but different
                    distributions across subgroups can give different acceptance
                    outcomes in reality.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">
                  2️⃣
                </span>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-amber-800">
                    Assumption 2: <InlineMath math="\sigma_k" /> changes slowly
                    with <InlineMath math="j" />
                  </p>

                  {/* Step 1: the problem */}
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <strong>Step 1: the problem.</strong> In a real system,
                    whether a new call is accepted can depend on exactly how the
                    busy units are spread across the subgroups, not only on the
                    total number of busy units <InlineMath math="j" />. The
                    example below shows two situations that share the exact same{" "}
                    <InlineMath math="j" />, yet lead to opposite outcomes for
                    the next call. This is called{" "}
                    <strong>mutual dependence between service classes</strong>:
                    which subgroup absorbs one class&apos;s call can flip
                    whether another class&apos;s call gets through.
                  </p>

                  {/* Two-case example */}
                  <div className="rounded-lg border border-amber-200 bg-white p-4 space-y-4">
                    <p className="text-xs font-semibold text-slate-600">
                      Concrete case: ℓ=3 subgroups, each with capacity C=5.
                      Starting from occupancy j=12, split as R1=5, R2=4, R3=3, a
                      new class-1 call arrives (it needs 1 b.u.). Which subgroup
                      it lands in decides what happens next to a class-2 call,
                      which needs 2 b.u. together in a single subgroup.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8">
                      {[
                        {
                          label: "Case a: call placed in R2",
                          after: [5, 5, 3],
                          next: "class-2 accepted",
                          nextColor: "text-emerald-600",
                          icon: "✓",
                          note: "R3 still has 2 free slots",
                        },
                        {
                          label: "Case b: call placed in R3",
                          after: [5, 4, 4],
                          next: "class-2 blocked",
                          nextColor: "text-red-600",
                          icon: "✗",
                          note: "No resource has 2 free slots",
                        },
                      ].map(({ label, after, next, nextColor, icon, note }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-2"
                        >
                          <p className="text-[11px] font-semibold text-slate-600 text-center">
                            {label} (j = 13)
                          </p>
                          <div className="flex gap-2 items-end">
                            {after.map((busy, gi) => (
                              <div
                                key={gi}
                                className="flex flex-col items-center gap-0.5"
                              >
                                <div className="flex flex-col-reverse gap-0.5">
                                  {Array.from({ length: 5 }).map((_, si) => (
                                    <div
                                      key={si}
                                      className={`w-7 h-4 rounded-sm border ${
                                        si < busy
                                          ? "bg-slate-400 border-slate-500"
                                          : "bg-sky-100 border-sky-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  R{gi + 1}
                                </p>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400 text-center">
                            {note}
                          </p>
                          <p className={`text-xs font-semibold ${nextColor}`}>
                            {icon} Next class-2: {next}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                      Same starting point (j=12) and same occupancy after the
                      new call (j=13), but two different outcomes for the next
                      call. Total occupancy alone does not decide the outcome;
                      how it is split across subgroups does too.
                    </p>
                  </div>

                  {/* Step 2: why this is a problem for the model */}
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <strong>
                      Step 2: why this is a problem for the model.
                    </strong>{" "}
                    The model does not want to track every possible way of
                    splitting busy units across subgroups, that state space is
                    huge. It wants one simple number,{" "}
                    <InlineMath math="\sigma_k(j)" />, that depends only on the
                    total <InlineMath math="j" />. But Step 1 just showed that
                    two situations with the same <InlineMath math="j" /> can
                    behave differently in reality. So using a single{" "}
                    <InlineMath math="\sigma_k(j)" /> for both is necessarily
                    wrong for at least one of them, by some amount.
                  </p>

                  {/* Step 3: the assumption that keeps the error small */}
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <strong>Step 3: the fix.</strong> Assumption 2 does not
                    claim mutual dependence goes away, it claims the error it
                    causes stays small. It does this by requiring{" "}
                    <InlineMath math="\sigma_k" /> to change only slightly
                    between two neighbouring occupancy levels,{" "}
                    <InlineMath math="j - 1" /> and <InlineMath math="j" />:
                  </p>

                  <div className="overflow-x-auto">
                    <BlockMath math="\left|\frac{\sigma_k(j) - \sigma_k(j-1)}{\sigma_k(j)}\right| \ll 1" />
                  </div>

                  <p className="text-xs text-amber-700 leading-relaxed">
                    <InlineMath math="\sigma_k(j)" /> is the current state,{" "}
                    <InlineMath math="\sigma_k(j-1)" /> is the previous state,
                    one busy unit earlier. The numerator is how much the
                    acceptance probability moved between those two states.
                    Dividing by <InlineMath math="\sigma_k(j)" /> turns that
                    into a percentage of the current value, so it does not
                    matter whether <InlineMath math="\sigma_k" /> itself is
                    large or small, only how much it moved relative to where it
                    was. The symbol <InlineMath math="\ll" /> means &ldquo;much
                    less than&rdquo;: not just below 1, but close to 0. So the
                    condition says this percentage change must be small, like a
                    few percent, at every step.
                  </p>

                  <p className="text-xs text-amber-700 leading-relaxed">
                    Example: if <InlineMath math="\sigma_k(j-1) = 1.0" /> and{" "}
                    <InlineMath math="\sigma_k(j) = 0.9" />, the change is{" "}
                    <InlineMath math="0.1 / 0.9 \approx 0.11" />, about 11%,
                    small enough to satisfy <InlineMath math="\ll 1" />. But if{" "}
                    <InlineMath math="\sigma_k(j-1) = 0.9" /> and{" "}
                    <InlineMath math="\sigma_k(j) = 0.5" />, the change is{" "}
                    <InlineMath math="0.4 / 0.5 = 0.8" />, 80%, close to 1 and
                    far from 0, so it fails the condition. This tends to happen
                    near saturation, when the system is close to full.
                  </p>

                  {/* Step 4: the explicit connection */}
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <strong>Step 4: how it all connects.</strong> Mutual
                    dependence (Step 1) is the real phenomenon: identical{" "}
                    <InlineMath math="j" /> can hide very different true
                    acceptance probabilities depending on how busy units are
                    split. The assumption (Step 3) does not remove that
                    phenomenon, it bounds it: if <InlineMath math="\sigma_k" />{" "}
                    barely moves from <InlineMath math="j-1" /> to{" "}
                    <InlineMath math="j" />, then any two situations sharing
                    that <InlineMath math="j" /> cannot have truly different
                    acceptance probabilities either, so replacing them with one
                    shared <InlineMath math="\sigma_k(j)" /> costs little
                    accuracy. When <InlineMath math="\sigma_k" /> instead swings
                    sharply (as in the 80% example, typically near saturation),
                    that is exactly when the mutual dependence from Step 1
                    starts to matter, and the approximation gets less reliable.
                  </p>
                </div>
              </div>
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

            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">
                🚧
              </span>
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>Bandwidth reservation</strong> policy support is coming
                soon.
              </p>
            </div>

            <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
              <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">
                💡
              </span>
              <p className="text-sm text-sky-900 leading-relaxed">
                Step-by-step calculations are shown when{" "}
                <InlineMath math="\ell \leq 5" /> and{" "}
                <InlineMath math="C \leq 5" />. For larger inputs, only the
                final results are displayed.
              </p>
            </div>

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
                        Mean b.u. occupied out of{" "}
                        {Number(ell) * Number(capacity)} b.u.
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
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-slate-700">
                                {group.title}
                              </p>
                              {gi === 0 && (
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  <InlineMath math="\sigma_k(j)" /> is the
                                  conditional transition probability:
                                  probability a class-
                                  <InlineMath math="k" /> call can be placed
                                  given <InlineMath math="j" /> busy b.u.
                                </p>
                              )}
                            </div>
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
        </div>

        {/* Animation card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Subgroup Animation
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                ℓ = {animEll} · C = {animC} · {animClasses.length} service{" "}
                {animClasses.length === 1 ? "class" : "classes"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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

          {/* Config controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Configuration (changes reset the simulation)
            </p>

            {/* ℓ and C steppers */}
            <div className="flex flex-wrap gap-6">
              {/* ℓ stepper */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 w-32">
                  Subgroups (ℓ)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      animEll > 1 &&
                      stopAndApply(() => setAnimEll((n) => n - 1))
                    }
                    disabled={animEll <= 1}
                    className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold text-base leading-none flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-slate-700 text-sm">
                    {animEll}
                  </span>
                  <button
                    onClick={() =>
                      animEll < 6 &&
                      stopAndApply(() => setAnimEll((n) => n + 1))
                    }
                    disabled={animEll >= 6}
                    className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold text-base leading-none flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* C stepper */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 w-32">
                  Capacity (C) b.u.
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const minC = Math.max(...animClasses.map((c) => c.bu), 1);
                      animC > minC &&
                        stopAndApply(() => setAnimC((n) => n - 1));
                    }}
                    disabled={
                      animC <= Math.max(...animClasses.map((c) => c.bu), 1)
                    }
                    className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold text-base leading-none flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-slate-700 text-sm">
                    {animC}
                  </span>
                  <button
                    onClick={() =>
                      animC < 8 && stopAndApply(() => setAnimC((n) => n + 1))
                    }
                    disabled={animC >= 8}
                    className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold text-base leading-none flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Service classes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Service classes
                </p>
                <button
                  onClick={addAnimClass}
                  disabled={animClasses.length >= 4}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium border border-sky-300 rounded-md px-2 py-0.5 hover:bg-sky-50 disabled:opacity-30 transition"
                >
                  + Add
                </button>
              </div>
              <div className="grid gap-1 text-[11px] font-semibold text-slate-400 tracking-wider grid-cols-[20px_52px_52px_minmax(0,1fr)_24px] px-1">
                <span />
                <span>bₖ (b.u.)</span>
                <span>aₖ (erl)</span>
                <span>label</span>
                <span />
              </div>
              {animClasses.map((cls, i) => (
                <div
                  key={cls.id}
                  className="grid gap-1.5 items-center grid-cols-[20px_52px_52px_minmax(0,1fr)_24px]"
                >
                  <span className="text-xs font-bold text-slate-400 text-center">
                    k{i + 1}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={animC}
                    value={cls.bu}
                    onChange={(e) => {
                      const v = Math.min(
                        Math.max(1, Number(e.target.value)),
                        animC,
                      );
                      updateAnimClass(cls.id, "bu", v);
                    }}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={cls.incomingLoad_a}
                    onChange={(e) =>
                      updateAnimClass(
                        cls.id,
                        "incomingLoad_a",
                        Number(e.target.value),
                      )
                    }
                    className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={cls.desc}
                    onChange={(e) =>
                      updateAnimClass(cls.id, "desc", e.target.value)
                    }
                    className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    onClick={() => removeAnimClass(cls.id)}
                    disabled={animClasses.length <= 1}
                    className="text-slate-300 hover:text-red-400 disabled:opacity-20 text-lg leading-none font-light"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <LimitedAvailabilityGroupAnimation
            key={animKey}
            ell={animEll}
            cPerGroup={animC}
            serviceClasses={animClasses}
            status={animStatus}
          />
        </div>

        {/* References card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">References</h2>
          <div className="space-y-3">
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
              <em>Efficient Multirate Teletraffic Loss Models Beyond Erlang</em>
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
        </div>
      </div>
    </div>
  );
}
