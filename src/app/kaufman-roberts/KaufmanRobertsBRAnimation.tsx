"use client";

import { useReducer, useEffect } from "react";
import { callBlockingProbability } from "@/lib/models/kaufman-roberts/call-blocking-probability";

// ─── constants ───────────────────────────────────────────────────────────────
const CAPACITY = 5;
const TICK_MS = 3000;

// GoS-equalised example: bₖ + tₖ = 3 for all classes
// → each class needs exactly 3 free b.u. to be accepted → B₁ = B₂ = B₃
const CLASSES = [
  {
    id: 1,
    label: "Class 1",
    cpus: 1,
    tk: 2,
    incomingLoad_a: 2,
    desc: "Video Call",
    bg: "bg-sky-400",
    light: "bg-sky-100",
    border: "border-sky-400",
    textColor: "text-sky-700",
    dot: "bg-sky-400",
  },
  {
    id: 2,
    label: "Class 2",
    cpus: 2,
    tk: 1,
    incomingLoad_a: 1.5,
    desc: "Video stream",
    bg: "bg-emerald-400",
    light: "bg-emerald-100",
    border: "border-emerald-400",
    textColor: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  {
    id: 3,
    label: "Class 3",
    cpus: 3,
    tk: 0,
    incomingLoad_a: 1,
    desc: "ML inference",
    bg: "bg-violet-400",
    light: "bg-violet-100",
    border: "border-violet-400",
    textColor: "text-violet-700",
    dot: "bg-violet-400",
  },
] as const;

type Cls = (typeof CLASSES)[number];

// ─── analytical CBP via roberts formula BR policy (computed once) ─────────────
const THEORETICAL_CBP = callBlockingProbability(
  CAPACITY,
  CLASSES.map((c) => ({
    serviceClass: c.id,
    bu: c.cpus,
    incomingLoad_a: c.incomingLoad_a,
    tk: c.tk,
  })),
);

const gosEqualised = (() => {
  const vals = CLASSES.map((c) => THEORETICAL_CBP[`B_class_${c.id}`] ?? 0);
  return vals.every((v) => Math.abs(v - vals[0]) < 0.000001);
})();

// ─── state types ─────────────────────────────────────────────────────────────
type Slot = { callId: number; classId: number; ticksLeft: number } | null;

type LogEntry = {
  id: number;
  msg: string;
  type: "ok" | "blocked" | "done";
};

type State = {
  slots: Slot[];
  incoming: Cls | null;
  lastEvent: "accepted" | "blocked" | null;
  log: LogEntry[];
  stats: { offered: number; carried: number; blocked: number };
};

let _cid = 1;
let _lid = 1;

const INIT: State = {
  slots: Array(CAPACITY).fill(null) as Slot[],
  incoming: null,
  lastEvent: null,
  log: [],
  stats: { offered: 0, carried: 0, blocked: 0 },
};

// ─── reducer ─────────────────────────────────────────────────────────────────
function tickReducer(state: State, action: "TICK" | "RESET"): State {
  if (action === "RESET") {
    _cid = 1;
    _lid = 1;
    return INIT;
  }

  const log = [...state.log];
  const stats = { ...state.stats };

  // Decrement timers, free completed calls
  const afterTick = state.slots.map((s): Slot => {
    if (!s) return null;
    if (s.ticksLeft <= 1) {
      log.unshift({
        id: _lid++,
        msg: `Call #${s.callId} (Class ${s.classId}) completed`,
        type: "done",
      });
      return null;
    }
    return { ...s, ticksLeft: s.ticksLeft - 1 };
  });

  // Random new arrival
  const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const freeCount = afterTick.filter((s) => s === null).length;
  stats.offered++;

  // BR acceptance condition: need bₖ + tₖ free b.u.
  const threshold = cls.cpus + cls.tk;

  let finalSlots = afterTick;
  let lastEvent: State["lastEvent"];

  if (freeCount >= threshold) {
    const cid = _cid++;
    const hold = 2 + Math.floor(Math.random() * 4);
    let assigned = 0;
    finalSlots = afterTick.map((s): Slot => {
      if (!s && assigned < cls.cpus) {
        assigned++;
        return { callId: cid, classId: cls.id, ticksLeft: hold };
      }
      return s;
    });
    log.unshift({
      id: _lid++,
      msg: `#${cid} Class ${cls.id} · ${cls.cpus} b.u. accepted (t=${cls.tk})`,
      type: "ok",
    });
    lastEvent = "accepted";
    stats.carried++;
  } else {
    log.unshift({
      id: _lid++,
      msg: `Class ${cls.id} blocked · need ${threshold} free, have ${freeCount}`,
      type: "blocked",
    });
    lastEvent = "blocked";
    stats.blocked++;
  }

  return {
    slots: finalSlots,
    incoming: cls,
    lastEvent,
    log: log.slice(0, 8),
    stats,
  };
}

function classById(id: number) {
  return CLASSES.find((c) => c.id === id);
}

// ─── component ───────────────────────────────────────────────────────────────
type AnimStatus = "stopped" | "running" | "paused";

export default function KaufmanRobertsBRAnimation({
  status,
}: {
  status: AnimStatus;
}) {
  const [state, dispatch] = useReducer(tickReducer, INIT);

  useEffect(() => {
    if (status !== "running") return;
    const timer = setInterval(() => dispatch("TICK"), TICK_MS);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "stopped") dispatch("RESET");
  }, [status]);

  const { slots, incoming, lastEvent, log, stats } = state;
  const freeCount = slots.filter((s) => s === null).length;
  const occupiedCount = CAPACITY - freeCount;
  const utilization = ((occupiedCount / CAPACITY) * 100).toFixed(0);

  // Compute which slot indices are in the "reservation zone" for the incoming class.
  // The last tₖ free slots are marked reserved — the class cannot use them.
  const reservedIndices = new Set<number>();
  if (incoming && incoming.tk > 0) {
    const freeIndices = slots
      .map((s, i) => (s === null ? i : -1))
      .filter((i) => i >= 0);
    freeIndices.slice(-incoming.tk).forEach((i) => reservedIndices.add(i));
  }

  return (
    <div className="space-y-5">
      {/* ── Service class legend ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CLASSES.map((cls) => (
          <div
            key={cls.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${cls.light} ${cls.border} ${cls.textColor}`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cls.dot}`}
            />
            {cls.label} · b={cls.cpus} · t={cls.tk} · {cls.desc}
          </div>
        ))}
      </div>

      {/* ── Incoming + Processor grid ────────────────────────────────────── */}
      <div className="flex items-stretch gap-4">
        {/* Incoming request panel */}
        <div className="w-36 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center gap-2 text-center min-h-[130px]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Incoming
          </p>
          {incoming ? (
            <>
              <div
                className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center ${classById(incoming.id)?.light} border ${classById(incoming.id)?.border}`}
              >
                <span
                  className={`text-base font-bold ${classById(incoming.id)?.textColor}`}
                >
                  k{incoming.id}
                </span>
                <span
                  className={`text-[10px] ${classById(incoming.id)?.textColor}`}
                >
                  b={incoming.cpus}
                </span>
                <span
                  className={`text-[10px] ${classById(incoming.id)?.textColor}`}
                >
                  t={incoming.tk}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                needs {incoming.cpus + incoming.tk} free
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-300">waiting…</p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center text-slate-300 text-xl font-light select-none">
          →
        </div>

        {/* Processor */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Processor · C = {CAPACITY} b.u.
            </p>
            <p className="text-xs text-slate-400">
              {freeCount} free · {occupiedCount} occupied
            </p>
          </div>

          {/* CPU core tiles */}
          <div className="flex gap-2">
            {slots.map((slot, i) => {
              const cls = slot ? classById(slot.classId) : null;
              const isReserved = reservedIndices.has(i);
              return (
                <div
                  key={i}
                  className={`flex-1 aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-500 ${
                    cls
                      ? `${cls.light} ${cls.border}`
                      : isReserved
                        ? "bg-amber-50 border-amber-300 border-dashed"
                        : "bg-white border-slate-200"
                  }`}
                >
                  {cls ? (
                    <>
                      <span
                        className={`text-xs font-bold ${cls.textColor} leading-none`}
                      >
                        k{slot!.classId}
                      </span>
                      <span className={`text-[10px] ${cls.textColor} mt-0.5`}>
                        {slot!.ticksLeft}t
                      </span>
                    </>
                  ) : isReserved ? (
                    <span className="text-amber-400 text-[10px] font-semibold">
                      rsv
                    </span>
                  ) : (
                    <span className="text-slate-200 text-xs">b.u.</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Capacity bar with effective capacity marker */}
          <div className="relative h-2 rounded-full bg-slate-200 overflow-visible">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${(occupiedCount / CAPACITY) * 100}%` }}
            />
            {/* Effective capacity threshold for incoming class */}
            {incoming && incoming.tk > 0 && (
              <div
                className="absolute top-[-4px] h-4 w-0.5 bg-amber-400"
                style={{
                  left: `${((CAPACITY - incoming.tk) / CAPACITY) * 100}%`,
                }}
                title={`C - t${incoming.id} = ${CAPACITY - incoming.tk}`}
              />
            )}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{utilization}% utilization</span>
            {incoming && incoming.tk > 0 && (
              <span className="text-amber-500">
                ▲ C − t{incoming.id} = {CAPACITY - incoming.tk} b.u. (effective
                capacity)
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center text-slate-300 text-xl font-light select-none">
          →
        </div>

        {/* Status */}
        <div className="w-28 flex-shrink-0 rounded-xl border flex flex-col items-center justify-center gap-1 min-h-[130px] transition-all duration-300">
          {lastEvent === "accepted" && (
            <div className="w-full h-full rounded-xl bg-emerald-50 border-emerald-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✓</span>
              <p className="text-xs font-bold text-emerald-700">Accepted</p>
              <p className="text-[10px] text-emerald-600 text-center">
                {incoming?.cpus} b.u. used, {incoming?.tk} b.u. reserved
              </p>
            </div>
          )}
          {lastEvent === "blocked" && (
            <div className="w-full h-full rounded-xl bg-red-50 border-red-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✗</span>
              <p className="text-xs font-bold text-red-600">Blocked</p>
              <p className="text-[10px] text-red-500 text-center">
                need {incoming ? incoming.cpus + incoming.tk : "?"}, have{" "}
                {freeCount}
              </p>
            </div>
          )}
          {lastEvent === null && (
            <div className="w-full h-full rounded-xl bg-slate-50 border-slate-200 border flex items-center justify-center">
              <p className="text-xs text-slate-300">idle</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Offered", value: stats.offered, color: "text-slate-700" },
          { label: "Carried", value: stats.carried, color: "text-emerald-600" },
          { label: "Blocked", value: stats.blocked, color: "text-red-500" },
          {
            label: "GoS",
            value:
              stats.offered > 0
                ? `${((stats.blocked / stats.offered) * 100).toFixed(1)}%`
                : "n/a",
            color: "text-sky-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-0.5"
          >
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Blocking condition note (BR) ─────────────────────────────────── */}
      {incoming && lastEvent === "blocked" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 space-y-1">
          <p className="font-semibold">
            BR blocking condition for Class {incoming.id}
          </p>
          <p>
            A call of Class {incoming.id} is accepted only if occupied bandwidth
            j ≤ C − b − t = {CAPACITY} − {incoming.cpus} − {incoming.tk} ={" "}
            {CAPACITY - incoming.cpus - incoming.tk}. Currently {occupiedCount}{" "}
            b.u. are occupied (threshold exceeded by{" "}
            {occupiedCount - (CAPACITY - incoming.cpus - incoming.tk)} b.u.).
          </p>
        </div>
      )}

      {/* ── GoS equalisation callout ─────────────────────────────────────── */}
      {gosEqualised && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sky-600 text-base">⚖️</span>
            <p className="text-xs font-semibold text-sky-800">
              GoS equalisation: bₖ + tₖ = {CLASSES[0].cpus + CLASSES[0].tk} for
              all classes
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Because b₁ + t₁ = b₂ + t₂ = b₃ + t₃ ={" "}
            {CLASSES[0].cpus + CLASSES[0].tk}, every class needs the same number
            of free b.u. to be accepted. The model guarantees B₁ = B₂ = B₃.
          </p>
          <div className="flex gap-2 flex-wrap text-[10px] font-mono text-sky-700">
            {CLASSES.map((c) => (
              <span key={c.id} className="bg-sky-100 rounded px-2 py-0.5">
                b{c.id} + t{c.id} = {c.cpus} + {c.tk} = {c.cpus + c.tk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Theoretical blocking probabilities ──────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Roberts formula · analytical B<sub>k</sub>
          </p>
          <p className="text-xs text-slate-400">
            C = {CAPACITY} b.u. · BR policy
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CLASSES.map((cls) => {
            const key = `B_class_${cls.id}`;
            const B = THEORETICAL_CBP[key] ?? 0;
            return (
              <div
                key={cls.id}
                className={`rounded-lg border p-3 space-y-1 ${cls.light} ${cls.border}`}
              >
                <p className={`text-xs font-semibold ${cls.textColor}`}>
                  {cls.label}
                </p>
                <p className={`text-[11px] font-mono ${cls.textColor}`}>
                  a{cls.id} = {cls.incomingLoad_a} erl · b={cls.cpus} · t=
                  {cls.tk}
                </p>
                <p className={`text-lg font-bold ${cls.textColor}`}>
                  B<sub>{cls.id}</sub> = {(B * 100).toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
        {gosEqualised && (
          <p className="text-xs text-emerald-700 font-medium">
            ✓ B₁ = B₂ = B₃, GoS equalisation confirmed analytically.
          </p>
        )}
        <p className="text-xs text-slate-400 leading-relaxed">
          The observed GoS in the animation will converge to these values over
          time.
        </p>
      </div>

      {/* ── Event log ────────────────────────────────────────────────────── */}
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
                className={`text-xs flex items-start gap-2 transition-opacity duration-300 ${
                  i === 0 ? "opacity-100" : "opacity-60"
                }`}
              >
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    entry.type === "ok"
                      ? "bg-emerald-400"
                      : entry.type === "blocked"
                        ? "bg-red-400"
                        : "bg-slate-300"
                  }`}
                />
                <span
                  className={
                    entry.type === "ok"
                      ? "text-emerald-700"
                      : entry.type === "blocked"
                        ? "text-red-600"
                        : "text-slate-500"
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
