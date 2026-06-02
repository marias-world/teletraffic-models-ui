"use client";

import { useReducer, useEffect } from "react";
import { callBlockingProbability } from "@/lib/models/kaufman-roberts/call-blocking-probability";

// ─── constants ───────────────────────────────────────────────────────────────
const CAPACITY = 5;
const TICK_MS = 3000;

const CLASSES = [
  {
    id: 1,
    label: "Class 1",
    cpus: 1,
    incomingLoad_a: 2,
    desc: "Video call",
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

// ─── analytical CBP for this fixed example (computed once) ───────────────────
const THEORETICAL_CBP = callBlockingProbability(
  CAPACITY,
  CLASSES.map((c) => ({
    serviceClass: c.id,
    bu: c.cpus,
    incomingLoad_a: c.incomingLoad_a,
  })),
);

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

// ─── module-level counters (reset on component unmount is fine) ───────────────
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

  // 1. Decrement hold timers; free completed calls
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

  // 2. Random new arrival
  const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const freeCount = afterTick.filter((s) => s === null).length;
  stats.offered++;

  let finalSlots = afterTick;
  let lastEvent: State["lastEvent"];

  if (freeCount >= cls.cpus) {
    const cid = _cid++;
    const hold = 2 + Math.floor(Math.random() * 4); // 2–5 ticks
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
      msg: `#${cid} Class ${cls.id} · ${cls.cpus} b.u. accepted`,
      type: "ok",
    });
    lastEvent = "accepted";
    stats.carried++;
  } else {
    log.unshift({
      id: _lid++,
      msg: `Class ${cls.id} · ${cls.cpus} b.u. blocked (${freeCount} free)`,
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

// ─── helpers ─────────────────────────────────────────────────────────────────
function classById(id: number): (typeof CLASSES)[number] | undefined {
  return CLASSES.find((c) => c.id === id);
}

// ─── component ───────────────────────────────────────────────────────────────
type AnimStatus = "stopped" | "running" | "paused";

export default function KaufmanRobertsAnimation({
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
            {cls.label} · {cls.cpus} b.u. · {cls.desc}
          </div>
        ))}
      </div>

      {/* ── Incoming + Processor grid ────────────────────────────────────── */}
      <div className="flex items-stretch gap-4">
        {/* Incoming request panel */}
        <div className="w-36 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Incoming
          </p>
          {incoming ? (
            <>
              <div
                className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${classById(incoming.id)?.light} border ${classById(incoming.id)?.border}`}
              >
                <span
                  className={`text-base font-bold ${classById(incoming.id)?.textColor}`}
                >
                  k{incoming.id}
                </span>
                <span
                  className={`text-xs ${classById(incoming.id)?.textColor}`}
                >
                  {incoming.cpus} b.u.
                </span>
              </div>
              <p className="text-xs text-slate-500">{incoming.desc}</p>
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
              return (
                <div
                  key={i}
                  className={`flex-1 aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-500 ${
                    cls
                      ? `${cls.light} ${cls.border}`
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
                  ) : (
                    <span className="text-slate-200 text-xs">b.u.</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Capacity bar */}
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${(occupiedCount / CAPACITY) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            {utilization}% utilization
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center text-slate-300 text-xl font-light select-none">
          →
        </div>

        {/* Status */}
        <div className="w-28 flex-shrink-0 rounded-xl border flex flex-col items-center justify-center gap-1 min-h-[120px] transition-all duration-300">
          {lastEvent === "accepted" && (
            <div className="w-full h-full rounded-xl bg-emerald-50 border-emerald-300 border flex flex-col items-center justify-center gap-1">
              <span className="text-2xl">✓</span>
              <p className="text-xs font-bold text-emerald-700">Accepted</p>
              <p className="text-[10px] text-emerald-600">
                {incoming?.cpus} b.u. assigned
              </p>
            </div>
          )}
          {lastEvent === "blocked" && (
            <div className="w-full h-full rounded-xl bg-red-50 border-red-300 border flex flex-col items-center justify-center gap-1">
              <span className="text-2xl">✗</span>
              <p className="text-xs font-bold text-red-600">Blocked</p>
              <p className="text-[10px] text-red-500">
                need {incoming?.cpus}, have {freeCount}
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
          {
            label: "Offered",
            value: stats.offered,
            color: "text-slate-700",
          },
          {
            label: "Carried",
            value: stats.carried,
            color: "text-emerald-600",
          },
          {
            label: "Blocked",
            value: stats.blocked,
            color: "text-red-500",
          },
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

      {/* ── Blocking condition note ───────────────────────────────────────── */}
      {incoming && lastEvent === "blocked" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 space-y-1">
          <p className="font-semibold">
            Blocking condition for Class {incoming.id} (b = {incoming.cpus}{" "}
            b.u.)
          </p>
          <p>
            A call is blocked when occupied bandwidth j &gt; C &minus; b + 1 ={" "}
            {CAPACITY} &minus; {incoming.cpus} + 1 ={" "}
            {CAPACITY - incoming.cpus + 1}. Currently {occupiedCount} b.u. are
            occupied.
          </p>
        </div>
      )}

      {/* ── Theoretical blocking probabilities ──────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Kaufman-Roberts model · analytical B<sub>k</sub>
          </p>
          <p className="text-xs text-slate-400">
            C = {CAPACITY} b.u. · CS policy
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
                <p className={`text-sm font-mono ${cls.textColor}`}>
                  a<sub>{cls.id}</sub> = {cls.incomingLoad_a} erl
                </p>
                <p className={`text-sm font-mono ${cls.textColor}`}>
                  b<sub>{cls.id}</sub> = {cls.cpus} b.u.
                </p>
                <p className={`text-lg font-bold ${cls.textColor}`}>
                  B<sub>{cls.id}</sub> = {(B * 100).toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          These are the exact blocking probabilities the Kaufman-Roberts formula
          gives for this system. The observed GoS in the animation above will
          converge to these values over time.
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
                className={`text-xs flex items-start gap-2 transition-opacity duration-300 ${i === 0 ? "opacity-100" : "opacity-60"}`}
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
