"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import BirthDeathAnimation, { AnimStatus } from "./BirthDeathAnimation";

export default function MarkovChainsPage() {
  const [animStatus, setAnimStatus] = useState<AnimStatus>("stopped");

  return (
    <Layout>
      <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                {" / "}
                <span className="text-slate-400">Theory</span>
                {" / "}
                <span className="text-slate-700">Markov Chains</span>
              </p>
              <h1 className="text-2xl font-bold text-slate-800">
                Markov Chains and the Birth-Death Process
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                The mathematical foundation behind the Kaufman-Roberts formula
                and all teletraffic loss models.
              </p>
            </div>

            {/* ── What is a Markov chain ───────────────────────────────── */}
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                What is a Markov chain?
              </p>
              <p>
                A{" "}
                <span className="font-semibold text-slate-700">
                  Markov chain
                </span>{" "}
                is a mathematical model for a system that moves between a set of{" "}
                <em>states</em> over time. The key property, called the{" "}
                <em>memoryless</em> (or Markov) property, is that the next state
                depends only on the current state, not on how the system got
                there.
              </p>
              <p>
                In teletraffic engineering the state represents how many
                bandwidth units (b.u.) are currently occupied. Arrivals push the
                system to a higher state; completed calls pull it back down.
                Because the system&apos;s state continuously changes yet its
                overall behaviour remains stable, we say it is in{" "}
                <em>statistical equilibrium</em>. At equilibrium we can write
                down global balance equations for every state, and solving them
                gives the probability <InlineMath math="P(\mathbf{n})" /> that
                the system is in each state at any given moment in time.
              </p>

              {/* Key terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  {
                    term: "State",
                    desc: "A snapshot of the system:  e.g. how many calls are active.",
                    color: "border-sky-200 bg-sky-50 text-sky-800",
                  },
                  {
                    term: "Transition",
                    desc: "A move between states, triggered by an arrival (birth) or departure (death).",
                    color: "border-emerald-200 bg-emerald-50 text-emerald-800",
                  },
                  {
                    term: "Equilibrium",
                    desc: "The stable condition where the probability distribution over states no longer changes over time, even though the system keeps transitioning. At equilibrium, P(j) equals the long-run fraction of time spent in state j.",
                    color: "border-violet-200 bg-violet-50 text-violet-800",
                  },
                ].map(({ term, desc, color }) => (
                  <div
                    key={term}
                    className={`rounded-lg border p-3 text-xs leading-relaxed ${color}`}
                  >
                    <p className="font-semibold mb-1">{term}</p>
                    <p className="opacity-80">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Global balance ───────────────────────────────────────── */}
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <hr className="border-slate-200" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Global balance equations
              </p>
              <p>
                The occupancy distribution can be found by solving the global
                balance equations. These equations state that, for every state{" "}
                <InlineMath math="j" />, the rate of leaving that state equals
                the rate of entering it:
              </p>

              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Global balance at state j
                </p>
                <BlockMath math="(\lambda + j\mu)\,P(j) = \lambda\,P(j-1) + (j+1)\mu\,P(j+1)" />
                <p className="text-xs text-slate-500">
                  Left side: total rate out of state j. Right side: rate in from
                  j-1 (arrival) plus rate in from j+1 (departure). Boundary
                  conventions: <InlineMath math="P(-1) = P(C+1) = 0" />, and
                  at <InlineMath math="j = C" /> arrivals are blocked so the
                  arrival term on the left is zero, leaving{" "}
                  <InlineMath math="C\mu\,P(C) = \lambda\,P(C-1)" />.
                </p>
              </div>

              <p>
                For birth-death chains this simplifies to the{" "}
                <span className="font-semibold text-slate-700">
                  local (detailed) balance
                </span>{" "}
                equation, which equates the flow across every single boundary:
              </p>

              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Local balance (birth-death)
                </p>
                <BlockMath math="\lambda \cdot P(j) = (j+1)\mu \cdot P(j+1)" />
                <p className="text-xs text-slate-500">
                  Rate of crossings from j to j+1 = rate of crossings from j+1
                  to j.
                </p>
              </div>
              <p>
                Applying local balance recursively from{" "}
                <InlineMath math="j = 0" /> gives the unnormalised steady-state
                weights, and after normalisation:
              </p>
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 space-y-1">
                <BlockMath math="P(j) = \frac{\rho^{\,j}}{j!}\,P(0) \qquad \rho = \frac{\lambda}{\mu}" />
                <p className="text-xs text-slate-500">
                  This is the Erlang-B formula for a single service class.
                  The local balance equation{" "}
                  <InlineMath math="\lambda P(j) = (j+1)\mu\,P(j+1)" />{" "}
                  rearranges to{" "}
                  <InlineMath math="P(j+1) = \tfrac{\rho}{j+1}\,P(j)" />,
                  which iterated from <InlineMath math="P(0)" /> gives the
                  result above.
                </p>
              </div>
            </div>
          </div>

          {/* ── Animation card ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800">
                Interactive: Birth-Death Chain
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                This simulation models how calls arrive and depart in a
                single-class system with capacity C&nbsp;=&nbsp;6&nbsp;b.u. At
                each step the system either gains a call (birth) or loses one
                (death), moving one state up or down the chain.
              </p>

              {/* Parameter definitions */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs space-y-2">
                {[
                  {
                    sym: "λ = 2",
                    def: "Mean arrival rate: the average number of calls arriving per unit of time.",
                  },
                  {
                    sym: "μ = 1",
                    def: "Mean service rate per active call: the reciprocal of the mean call holding time (h = 1/μ). Each of the j active calls departs independently at rate μ, so the total departure rate from state j is j·μ.",
                  },
                  {
                    sym: "C = 6",
                    def: "System capacity in b.u. Calls arriving when j = C are blocked and lost.",
                  },
                ].map(({ sym, def }) => (
                  <div key={sym} className="flex gap-3">
                    <span className="font-mono font-semibold text-sky-700 w-20 flex-shrink-0">
                      {sym}
                    </span>
                    <span className="text-slate-500 leading-relaxed">
                      {def}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              {animStatus === "stopped" && (
                <button
                  onClick={() => setAnimStatus("running")}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Start
                </button>
              )}
              {animStatus === "running" && (
                <>
                  <button
                    onClick={() => setAnimStatus("paused")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-amber-400 text-white hover:bg-amber-500 transition-colors"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => setAnimStatus("stopped")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Stop
                  </button>
                </>
              )}
              {animStatus === "paused" && (
                <>
                  <button
                    onClick={() => setAnimStatus("running")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => setAnimStatus("stopped")}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Stop
                  </button>
                </>
              )}
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  animStatus === "running"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : animStatus === "paused"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {animStatus === "running"
                  ? "Running"
                  : animStatus === "paused"
                    ? "Paused"
                    : "Stopped"}
              </span>
            </div>

            <BirthDeathAnimation status={animStatus} />
          </div>

          {/* ── Multi-class state space ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Multi-class State Space
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete Sharing (CS) Policy: all states satisfying the
                capacity constraint are admissible.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">

              {/* CS policy definition */}
              <p>
                Under the{" "}
                <span className="font-semibold text-slate-700">
                  Complete Sharing policy
                </span>
                , a new call of class&nbsp;k is accepted whenever it fits
                within the remaining link capacity. For{" "}
                <InlineMath math="I = 2" /> service classes the admissible
                state space is:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
                <BlockMath math="\bigl\{(n_1,\,n_2) : n_1 b_1 + n_2 b_2 \leq C\bigr\}" />
              </div>

              {/* Parameters */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs space-y-1.5">
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                  Example parameters
                </p>
                {[
                  { sym: "C = 5", def: "Total link capacity in bandwidth units (b.u.)" },
                  { sym: "b₁ = 1 b.u.", def: "Bandwidth required per Class 1 call" },
                  { sym: "b₂ = 2 b.u.", def: "Bandwidth required per Class 2 call" },
                  { sym: "λ₁ = λ₂ = 1", def: "Mean arrival rates (calls per unit time)" },
                  { sym: "μ₁ = μ₂ = 1", def: "Mean service rates (per active call)" },
                ].map(({ sym, def }) => (
                  <div key={sym} className="flex gap-3">
                    <span className="font-mono font-semibold text-sky-700 w-24 flex-shrink-0">{sym}</span>
                    <span className="text-slate-500">{def}</span>
                  </div>
                ))}
              </div>

              {/* State table + grid */}
              <hr className="border-slate-200" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                All valid states · j = n₁b₁ + n₂b₂
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* State table */}
                <div className="overflow-x-auto flex-shrink-0">
                  <table className="text-xs border-collapse text-center">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-200 px-3 py-1 font-semibold text-slate-600">n₁</th>
                        <th className="border border-slate-200 px-3 py-1 font-semibold text-slate-600">n₂</th>
                        <th className="border border-slate-200 px-3 py-1 font-semibold text-slate-600">j</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        [0,0,0],[0,1,2],[0,2,4],
                        [1,0,1],[1,1,3],[1,2,5],
                        [2,0,2],[2,1,4],
                        [3,0,3],[3,1,5],
                        [4,0,4],[5,0,5],
                      ] as [number,number,number][]).map(([n1,n2,j]) => (
                        <tr key={`${n1}${n2}`} className="odd:bg-white even:bg-slate-50">
                          <td className="border border-slate-200 px-3 py-0.5 text-slate-600">{n1}</td>
                          <td className="border border-slate-200 px-3 py-0.5 text-slate-600">{n2}</td>
                          <td className="border border-slate-200 px-3 py-0.5 font-semibold text-sky-700">{j}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2D coordinate grid SVG */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2 flex-1">
                  {(() => {
                    const B1 = 1, B2 = 2, CAP = 5;
                    const SX = 52, SY = 65;
                    const OX = 42, OY = 175;
                    const R = 11;
                    const px = (n1: number) => OX + n1 * SX;
                    const py = (n2: number) => OY - n2 * SY;
                    const W = OX + Math.floor(CAP / B1) * SX + R + 20;
                    const H = OY + R + 30;

                    const states: [number, number][] = [];
                    for (let n1 = 0; n1 * B1 <= CAP; n1++)
                      for (let n2 = 0; n1 * B1 + n2 * B2 <= CAP; n2++)
                        states.push([n1, n2]);

                    const hEdges: [number, number][] = states.filter(
                      ([n1, n2]) => (n1 + 1) * B1 + n2 * B2 <= CAP
                    );
                    const vEdges: [number, number][] = states.filter(
                      ([n1, n2]) => n1 * B1 + (n2 + 1) * B2 <= CAP
                    );

                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                        <defs>
                          <marker id="mg5" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#10b981" />
                          </marker>
                          <marker id="ma5" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" />
                          </marker>
                        </defs>

                        {/* Horizontal edges */}
                        {hEdges.map(([n1, n2]) => {
                          const x1 = px(n1) + R, x2 = px(n1 + 1) - R, y = py(n2);
                          const mx = (x1 + x2) / 2;
                          return (
                            <g key={`h${n1}${n2}`}>
                              <line x1={x1} y1={y - 4} x2={x2} y2={y - 4}
                                stroke="#10b981" strokeWidth="1.1" markerEnd="url(#mg5)" />
                              <text x={mx} y={y - 7} textAnchor="middle" fontSize="7.5" fill="#059669">λ₁</text>
                              <line x1={x2} y1={y + 4} x2={x1} y2={y + 4}
                                stroke="#f59e0b" strokeWidth="1.1" markerEnd="url(#ma5)" />
                              <text x={mx} y={y + 14} textAnchor="middle" fontSize="7.5" fill="#d97706">{n1 + 1}μ₁</text>
                            </g>
                          );
                        })}

                        {/* Vertical edges */}
                        {vEdges.map(([n1, n2]) => {
                          const x = px(n1);
                          const y1 = py(n2) - R;
                          const y2 = py(n2 + 1) + R;
                          const my = (y1 + y2) / 2;
                          return (
                            <g key={`v${n1}${n2}`}>
                              <line x1={x - 4} y1={y1} x2={x - 4} y2={y2}
                                stroke="#10b981" strokeWidth="1.1" markerEnd="url(#mg5)" />
                              <text x={x - 15} y={my + 3} textAnchor="middle" fontSize="7.5" fill="#059669">λ₂</text>
                              <line x1={x + 4} y1={y2} x2={x + 4} y2={y1}
                                stroke="#f59e0b" strokeWidth="1.1" markerEnd="url(#ma5)" />
                              <text x={x + 17} y={my + 3} textAnchor="middle" fontSize="7.5" fill="#d97706">{n2 + 1}μ₂</text>
                            </g>
                          );
                        })}

                        {/* State circles */}
                        {states.map(([n1, n2]) => (
                          <g key={`s${n1}${n2}`}>
                            <circle cx={px(n1)} cy={py(n2)} r={R}
                              fill="white" stroke="#94a3b8" strokeWidth="1.5" />
                            <text x={px(n1)} y={py(n2) + 3}
                              textAnchor="middle" fontSize="8" fill="#334155" fontWeight="600">
                              {n1},{n2}
                            </text>
                          </g>
                        ))}

                        {/* Axis labels */}
                        <text x={OX + (Math.floor(CAP / B1) * SX) / 2} y={H - 4}
                          textAnchor="middle" fontSize="10" fill="#94a3b8">n₁ →</text>
                        <text x="10" y={OY - SY}
                          textAnchor="middle" fontSize="10" fill="#94a3b8"
                          transform={`rotate(-90, 10, ${OY - SY})`}>n₂ ↑</text>
                      </svg>
                    );
                  })()}

                  <div className="flex gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-[1.5px] bg-emerald-500" />
                      Arrivals (constant λ)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-[1.5px] bg-amber-500" />
                      Departures (n·μ)
                    </span>
                  </div>
                </div>
              </div>

              {/* Global balance — 1D case from notes */}
              <hr className="border-slate-200" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Global balance (rate in = rate out)
              </p>
              <p>
                For each state in the chain, the total rate of leaving that
                state must equal the total rate of entering it. For the
                single-class 1D case (states&nbsp;0, 1, 2,&nbsp;…):
              </p>

              <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  State-by-state balance
                </p>
                {[
                  { label: "n = 0", eq: "\\lambda P_0 = \\mu P_1" },
                  { label: "n = 1", eq: "(\\lambda + \\mu)\\,P_1 = \\lambda P_0 + 2\\mu P_2" },
                  { label: "n = 2", eq: "(\\lambda + 2\\mu)\\,P_2 = \\lambda P_1 + 3\\mu P_3" },
                ].map(({ label, eq }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-sky-600 w-12 flex-shrink-0">{label}:</span>
                    <InlineMath math={eq} />
                  </div>
                ))}
              </div>

              {/* Worked example state (2,0) */}
              <div className="bg-white border border-sky-100 rounded-lg px-4 py-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Worked example: global balance for state (2,&thinsp;0)
                </p>
                <p className="text-xs text-slate-500">
                  In the 2-class CS system above (λ₁=μ₁=λ₂=μ₂=1), state
                  (2,&thinsp;0) can be reached from (1,&thinsp;0) via a
                  class-1 arrival, from (3,&thinsp;0) via a class-1
                  departure, and from (2,&thinsp;1) via a class-2 departure.
                  Setting rate in = rate out:
                </p>
                <BlockMath math="\lambda_1 P(1,0) + 3\mu_1 P(3,0) + \mu_2 P(2,1) = (\lambda_1 + \lambda_2 + 2\mu_1)\,P(2,0)" />
                <p className="text-xs text-slate-500">With unit rates:</p>
                <BlockMath math="P(1,0) + 3\,P(3,0) + P(2,1) = 4\,P(2,0)" />
                <p className="text-xs text-slate-400">
                  Writing such an equation for every reachable state and
                  solving the system gives the exact steady-state
                  distribution, which the{" "}
                  <Link
                    href="/kaufman-roberts"
                    className="text-sky-600 hover:underline"
                  >
                    Kaufman-Roberts recursion
                  </Link>{" "}
                  computes efficiently without solving the full linear system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
