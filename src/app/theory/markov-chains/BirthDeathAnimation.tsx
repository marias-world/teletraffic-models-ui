"use client";

import { useReducer, useEffect } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const CAPACITY = 6;
const LAMBDA = 2; // arrival rate λ
const MU = 1; // service rate per active call μ
const TICK_MS = 1500;
const BAR_HEIGHT_PX = 80; // height of bar chart area in px

// ─── helpers ──────────────────────────────────────────────────────────────────
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
function frac(num: number, den: number): string {
  const g = gcd(num, den);
  const n = num / g, d = den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

export type AnimStatus = "stopped" | "running" | "paused";

// ─── theoretical steady-state (birth-death / Erlang-B) ───────────────────────
function computeSteadyState(C: number, rho: number): number[] {
  const unnorm: number[] = [];
  let factorial = 1;
  for (let j = 0; j <= C; j++) {
    if (j > 0) factorial *= j;
    unnorm[j] = Math.pow(rho, j) / factorial;
  }
  const total = unnorm.reduce((s, v) => s + v, 0);
  return unnorm.map((v) => v / total);
}

const THEORETICAL = computeSteadyState(CAPACITY, LAMBDA / MU);

// ─── state ────────────────────────────────────────────────────────────────────
type LogEntry = {
  id: number;
  msg: string;
  type: "arrival" | "departure";
};

type SimState = {
  j: number; // current state
  lastEvent: "arrival" | "departure" | null;
  log: LogEntry[];
  timeInState: number[]; // ticks spent in each state
  ticks: number;
};

let _lid = 1;

function makeInit(): SimState {
  return {
    j: 0,
    lastEvent: null,
    log: [],
    timeInState: Array(CAPACITY + 1).fill(0) as number[],
    ticks: 0,
  };
}

// ─── reducer ──────────────────────────────────────────────────────────────────
function reducer(state: SimState, action: "TICK" | "RESET"): SimState {
  if (action === "RESET") {
    _lid = 1;
    return makeInit();
  }

  const { j } = state;
  // record time spent in current state
  const timeInState = [...state.timeInState];
  timeInState[j]++;

  const log = [...state.log];
  const ticks = state.ticks + 1;

  // transition rates
  const canArrive = j < CAPACITY;
  const arrivalRate = canArrive ? LAMBDA : 0;
  const departureRate = j * MU;
  const totalRate = arrivalRate + departureRate;

  let newJ = j;
  let lastEvent: SimState["lastEvent"] = null;

  if (totalRate > 0) {
    const pArrival = arrivalRate / totalRate;
    if (Math.random() < pArrival) {
      // birth
      newJ = j + 1;
      lastEvent = "arrival";
      log.unshift({
        id: _lid++,
        msg: `Birth: ${j} → ${j + 1}   (λ = ${LAMBDA})`,
        type: "arrival",
      });
    } else {
      // death
      newJ = Math.max(0, j - 1);
      lastEvent = "departure";
      log.unshift({
        id: _lid++,
        msg: `Death: ${j} → ${newJ}   (${j}·μ = ${j * MU})`,
        type: "departure",
      });
    }
  }

  return {
    j: newJ,
    lastEvent,
    log: log.slice(0, 7),
    timeInState,
    ticks,
  };
}

// ─── component ────────────────────────────────────────────────────────────────
export default function BirthDeathAnimation({
  status,
}: {
  status: AnimStatus;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInit);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => dispatch("TICK"), TICK_MS);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "stopped") dispatch("RESET");
  }, [status]);

  const { j, lastEvent, log, timeInState, ticks } = state;

  const observed = timeInState.map((t) => (ticks > 0 ? t / ticks : 0));
  const maxBar = Math.max(...THEORETICAL, ...observed, 0.001);

  return (
    <div className="space-y-5">

      {/* ── Chain diagram ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs text-slate-400 tracking-wide">
          birth-death chain · C = {CAPACITY} b.u. · λ = {LAMBDA} (mean arrival rate) · μ = {MU} (service rate per call)
        </p>

        <div className="overflow-x-auto">
          <div className="flex items-center min-w-max gap-0">
            {Array.from({ length: CAPACITY + 1 }, (_, s) => (
              <div key={s} className="flex items-center">
                {/* State circle */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    s === j
                      ? "bg-slate-700 border-slate-800 text-white scale-110 shadow-md"
                      : s === j - 1 && lastEvent === "arrival"
                        ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                        : s === j + 1 && lastEvent === "departure"
                          ? "bg-amber-100 border-amber-400 text-amber-700"
                          : "bg-white border-slate-300 text-slate-500"
                  }`}
                >
                  {s}
                </div>

                {/* Arrow segment between s and s+1 */}
                {s < CAPACITY && (
                  <div className="flex flex-col items-center w-12 px-1">
                    <span
                      className={`text-[9px] font-mono leading-tight transition-colors duration-200 ${
                        lastEvent === "arrival" && j === s + 1
                          ? "text-emerald-600 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      λ →
                    </span>
                    <span
                      className={`text-[9px] font-mono leading-tight transition-colors duration-200 ${
                        lastEvent === "departure" && j === s
                          ? "text-amber-500 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      ← {s > 0 ? s + 1 : ""}μ
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event badge */}
        <div
          className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 border transition-all duration-300 ${
            lastEvent === "arrival"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : lastEvent === "departure"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
          }`}
        >
          <span className="text-base select-none">
            {lastEvent === "arrival" ? "↗" : lastEvent === "departure" ? "↙" : "·"}
          </span>
          <span>
            {lastEvent === "arrival"
              ? `Birth: new call arrived. Now in state ${j}.`
              : lastEvent === "departure"
                ? `Death: call completed and left. Now in state ${j}.`
                : status === "running"
                  ? "Waiting for next event…"
                  : "Press Start to run the simulation."}
          </span>
        </div>
      </div>

      {/* ── Local balance equation ─────────────────────────────────────────── */}
      {(() => {
        // Show balance at boundary j | j+1 (outgoing form) for j < C,
        // fall back to j-1 | j at the capacity ceiling.
        const atCap = j === CAPACITY;
        const lo = atCap ? j - 1 : j;
        const hi = atCap ? j : j + 1;
        const depRate = hi * MU;           // departure rate from upper state
        const ratio = frac(LAMBDA, depRate); // P(hi) = (λ / depRate) · P(lo)
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Local balance · boundary {lo} | {hi}
            </p>

            {/* Step-by-step derivation */}
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono text-slate-700 space-y-1.5">
              {/* 1. Symbolic form */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-32 flex-shrink-0">symbolic:</span>
                <span>λ · P({lo}) = {hi}·μ · P({hi})</span>
              </div>
              {/* 2. Substitute values */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-32 flex-shrink-0">substitute:</span>
                <span>{LAMBDA} · P({lo}) = {depRate} · P({hi})</span>
              </div>
              {/* 3. Rearranged to show P(hi) */}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-1.5">
                <span className="text-slate-400 w-32 flex-shrink-0">rearranged:</span>
                <span className="text-sky-700 font-semibold">
                  P({hi}) = {ratio} · P({lo})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {atCap
                ? `At capacity j = C = ${CAPACITY} arrivals are blocked. P(${hi}) = ${ratio} · P(${lo}) shows how the top state relates to the one below.`
                : `Each step from state ${lo} to ${hi} scales the probability by λ / (${hi}·μ) = ${LAMBDA} / ${depRate} = ${ratio}. When this ratio is less than 1 the chain is pulled back down — states become less likely as j grows.`}
            </p>
          </div>
        );
      })()}

      {/* ── Probability distribution ───────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            State probabilities · {ticks} ticks
          </p>
          <div className="flex gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-300 inline-block" />
              Theoretical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
              Observed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: CAPACITY + 1 }, (_, s) => {
            const thH = Math.round((THEORETICAL[s] / maxBar) * BAR_HEIGHT_PX);
            const obH = Math.round((observed[s] / maxBar) * BAR_HEIGHT_PX);
            return (
              <div key={s} className="flex flex-col items-center gap-1">
                {/* Bar area */}
                <div
                  className="w-full relative"
                  style={{ height: `${BAR_HEIGHT_PX}px` }}
                >
                  {/* Theoretical bar (left half) */}
                  <div
                    className="absolute bottom-0 left-0 bg-sky-300 rounded-t w-[48%]"
                    style={{ height: `${thH}px` }}
                  />
                  {/* Observed bar (right half) */}
                  <div
                    className="absolute bottom-0 right-0 bg-emerald-400 rounded-t w-[48%] transition-all duration-500"
                    style={{ height: `${obH}px` }}
                  />
                </div>
                {/* State label */}
                <p className={`text-[10px] font-bold ${s === j ? "text-slate-700" : "text-slate-400"}`}>
                  {s}
                </p>
                {/* Theoretical % */}
                <p className="text-[9px] text-sky-600">
                  {(THEORETICAL[s] * 100).toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          P(j) = (ρ<sup>j</sup>/j!) · P(0) where ρ = λ/μ = {LAMBDA}/{MU} erl
          (offered traffic intensity). The observed (green) bars converge to
          the theoretical (blue) values as the simulation runs longer.
        </p>
      </div>

      {/* ── Event log ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Event log
        </p>
        {log.length === 0 ? (
          <p className="text-xs text-slate-300">No events yet. Press Start.</p>
        ) : (
          <ul className="space-y-1">
            {log.map((entry, i) => (
              <li
                key={entry.id}
                className={`text-xs flex items-center gap-2 transition-opacity duration-200 ${
                  i === 0 ? "opacity-100" : "opacity-55"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    entry.type === "arrival" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={
                    entry.type === "arrival" ? "text-emerald-700" : "text-amber-700"
                  }
                >
                  {entry.msg}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
