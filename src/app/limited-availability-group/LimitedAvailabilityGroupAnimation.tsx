"use client";

import { useReducer, useEffect, useMemo } from "react";
import { lagModelResult } from "@/lib/models/limited-availability-groups/lar-with-steps";

const TICK_MS = 1800;

const CLASS_COLORS = [
  {
    light: "bg-sky-100",
    border: "border-sky-400",
    textColor: "text-sky-700",
    dot: "bg-sky-400",
  },
  {
    light: "bg-emerald-100",
    border: "border-emerald-400",
    textColor: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  {
    light: "bg-violet-100",
    border: "border-violet-400",
    textColor: "text-violet-700",
    dot: "bg-violet-400",
  },
  {
    light: "bg-amber-100",
    border: "border-amber-400",
    textColor: "text-amber-700",
    dot: "bg-amber-400",
  },
];

export type AnimClass = {
  id: number;
  bu: number;
  incomingLoad_a: number;
  desc: string;
};

type AnimStatus = "stopped" | "running" | "paused";

type Slot = { callId: number; classId: number; ticksLeft: number } | null;
type Subgroup = Slot[];

type LogEntry = { id: number; msg: string; type: "ok" | "blocked" | "done" };

type State = {
  subgroups: Subgroup[];
  incomingId: number | null;
  lastEvent: "accepted" | "blocked" | null;
  assignedSubgroupIdx: number | null;
  log: LogEntry[];
  stats: {
    offered: number;
    carried: number;
    blocked: number;
    buAccum: number;
    ticks: number;
  };
};

let _cid = 1;
let _lid = 1;

function makeInit(ell: number, cPerGroup: number): State {
  return {
    subgroups: Array.from(
      { length: ell },
      () => Array(cPerGroup).fill(null) as Subgroup,
    ),
    incomingId: null,
    lastEvent: null,
    assignedSubgroupIdx: null,
    log: [],
    stats: { offered: 0, carried: 0, blocked: 0, buAccum: 0, ticks: 0 },
  };
}

export default function LimitedAvailabilityGroupAnimation({
  ell,
  cPerGroup,
  serviceClasses,
  status,
}: {
  ell: number;
  cPerGroup: number;
  serviceClasses: AnimClass[];
  status: AnimStatus;
}) {
  const V = ell * cPerGroup;

  const theoretical = useMemo(
    () =>
      lagModelResult(
        ell,
        cPerGroup,
        serviceClasses.map((c) => ({
          serviceClass: c.id,
          bu: c.bu,
          incomingLoad_a: c.incomingLoad_a,
        })),
      ),
    // key prop guarantees remount on changes; memo is a safety net
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Reducer defined inline so it closes over current ell/cPerGroup/serviceClasses.
  // Since key prop forces remount on param changes, these values are stable per instance.
  function reducer(state: State, action: "TICK" | "RESET"): State {
    if (action === "RESET") {
      _cid = 1;
      _lid = 1;
      return makeInit(ell, cPerGroup);
    }

    const log = [...state.log];
    const stats = { ...state.stats };

    // 1. Decrement timers, free completed calls
    const afterTick: Subgroup[] = state.subgroups.map((sg) =>
      sg.map((s): Slot => {
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
      }),
    );

    // 2. Random arrival
    const cls = serviceClasses[Math.floor(Math.random() * serviceClasses.length)];
    stats.offered++;

    // 3. Find first subgroup with enough free slots
    const candidateIdx = afterTick.findIndex(
      (sg) => sg.filter((s) => s === null).length >= cls.bu,
    );

    let finalSubgroups = afterTick;
    let lastEvent: State["lastEvent"];
    let assignedSubgroupIdx: number | null = null;

    if (candidateIdx !== -1) {
      const cid = _cid++;
      const hold = 2 + Math.floor(Math.random() * 4);
      let assigned = 0;
      finalSubgroups = afterTick.map((sg, i) => {
        if (i !== candidateIdx) return sg;
        return sg.map((s): Slot => {
          if (!s && assigned < cls.bu) {
            assigned++;
            return { callId: cid, classId: cls.id, ticksLeft: hold };
          }
          return s;
        });
      });
      log.unshift({
        id: _lid++,
        msg: `#${cid} Class ${cls.id} · ${cls.bu} b.u. accepted (SG ${candidateIdx + 1})`,
        type: "ok",
      });
      lastEvent = "accepted";
      assignedSubgroupIdx = candidateIdx;
      stats.carried++;
    } else {
      log.unshift({
        id: _lid++,
        msg: `Class ${cls.id} · ${cls.bu} b.u. blocked`,
        type: "blocked",
      });
      lastEvent = "blocked";
      stats.blocked++;
    }

    const totalOccupied = finalSubgroups
      .flatMap((sg) => sg)
      .filter((s) => s !== null).length;
    stats.buAccum += totalOccupied;
    stats.ticks++;

    return {
      subgroups: finalSubgroups,
      incomingId: cls.id,
      lastEvent,
      assignedSubgroupIdx,
      log: log.slice(0, 8),
      stats,
    };
  }

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    makeInit(ell, cPerGroup),
  );

  useEffect(() => {
    if (status !== "running") return;
    const timer = setInterval(() => dispatch("TICK"), TICK_MS);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "stopped") dispatch("RESET");
  }, [status]);

  const { subgroups, incomingId, lastEvent, assignedSubgroupIdx, log, stats } =
    state;
  const incomingCls = serviceClasses.find((c) => c.id === incomingId) ?? null;
  const totalOccupied = subgroups
    .flatMap((sg) => sg)
    .filter((s) => s !== null).length;
  const totalFree = V - totalOccupied;
  const observedU =
    stats.ticks > 0 ? (stats.buAccum / stats.ticks).toFixed(3) : null;
  const observedEff =
    stats.ticks > 0
      ? ((stats.buAccum / stats.ticks / V) * 100).toFixed(1)
      : null;

  function colorFor(classId: number) {
    const idx = serviceClasses.findIndex((c) => c.id === classId);
    return CLASS_COLORS[idx % CLASS_COLORS.length];
  }

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2">
        {serviceClasses.map((cls, i) => {
          const col = CLASS_COLORS[i % CLASS_COLORS.length];
          return (
            <div
              key={cls.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${col.light} ${col.border} ${col.textColor}`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${col.dot}`}
              />
              Class {cls.id} · {cls.bu} b.u. · {cls.desc}
            </div>
          );
        })}
      </div>

      {/* Incoming + Subgroups + Status */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4">
        {/* Incoming */}
        <div className="w-full sm:w-32 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center gap-2 text-center min-h-[100px]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Incoming
          </p>
          {incomingCls ? (
            <>
              <div
                className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${colorFor(incomingCls.id).light} border ${colorFor(incomingCls.id).border}`}
              >
                <span
                  className={`text-base font-bold ${colorFor(incomingCls.id).textColor}`}
                >
                  k{incomingCls.id}
                </span>
                <span
                  className={`text-xs ${colorFor(incomingCls.id).textColor}`}
                >
                  {incomingCls.bu} b.u.
                </span>
              </div>
              <p className="text-xs text-slate-500">{incomingCls.desc}</p>
            </>
          ) : (
            <p className="text-xs text-slate-300">waiting…</p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl font-light select-none rotate-90 sm:rotate-0">
          →
        </div>

        {/* Subgroups */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <p className="text-xs font-semibold text-slate-500">
              ℓ = {ell}, C = {cPerGroup} b.u., V = {V}
            </p>
            <p className="text-xs text-slate-400">
              {totalFree} free · {totalOccupied} occupied
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {subgroups.map((sg, gi) => {
              const free = sg.filter((s) => s === null).length;
              const isActive =
                gi === assignedSubgroupIdx && lastEvent === "accepted";
              return (
                <div
                  key={gi}
                  className={`flex-shrink-0 rounded-xl border-2 p-2 space-y-1.5 transition-all duration-300 ${
                    isActive
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                  style={{ minWidth: "64px" }}
                >
                  <p
                    className={`text-xs font-semibold text-center ${
                      isActive ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    SG {gi + 1}
                  </p>
                  <div className="flex flex-col gap-1">
                    {sg.map((slot, si) => {
                      const col = slot ? colorFor(slot.classId) : null;
                      return (
                        <div
                          key={si}
                          className={`h-7 rounded-lg border flex items-center justify-center transition-all duration-500 ${
                            col
                              ? `${col.light} ${col.border}`
                              : "bg-white border-slate-100"
                          }`}
                        >
                          {col ? (
                            <span
                              className={`text-xs font-bold ${col.textColor}`}
                            >
                              k{slot!.classId}
                            </span>
                          ) : (
                            <span className="text-slate-200 text-[10px]">
                              b.u.
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p
                    className={`text-[10px] text-center ${
                      isActive ? "text-emerald-500" : "text-slate-400"
                    }`}
                  >
                    {free}/{cPerGroup}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${(totalOccupied / V) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            {((totalOccupied / V) * 100).toFixed(0)}% utilization
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl font-light select-none rotate-90 sm:rotate-0">
          →
        </div>

        {/* Status */}
        <div className="w-full sm:w-28 flex-shrink-0 rounded-xl border flex flex-col items-center justify-center gap-1 min-h-[80px] transition-all duration-300">
          {lastEvent === "accepted" && (
            <div className="w-full h-full rounded-xl bg-emerald-50 border-emerald-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✓</span>
              <p className="text-xs font-bold text-emerald-700">Accepted</p>
              <p className="text-[10px] text-emerald-600 text-center">
                SG {(assignedSubgroupIdx ?? 0) + 1}
              </p>
            </div>
          )}
          {lastEvent === "blocked" && (
            <div className="w-full h-full rounded-xl bg-red-50 border-red-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✗</span>
              <p className="text-xs font-bold text-red-600">Blocked</p>
              <p className="text-[10px] text-red-500 text-center">
                no SG has {incomingCls?.bu} free
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

      {/* Stats */}
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

      {/* Blocking condition note */}
      {incomingCls && lastEvent === "blocked" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 space-y-1">
          <p className="font-semibold">
            Blocking condition for Class {incomingCls.id} (b ={" "}
            {incomingCls.bu} b.u.)
          </p>
          <p>
            Needs {incomingCls.bu} free b.u. in one subgroup. LAG threshold: n
            = ℓ(C &minus; b + 1) = {ell}&times;({cPerGroup} &minus;{" "}
            {incomingCls.bu} + 1) ={" "}
            {ell * (cPerGroup - incomingCls.bu + 1)}. Currently j ={" "}
            {totalOccupied}.
          </p>
        </div>
      )}

      {/* Analytical CBP */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            LAG model · analytical B<sub>k</sub>
          </p>
          <p className="text-xs text-slate-400">
            ℓ = {ell} · C = {cPerGroup} · CS policy
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {serviceClasses.map((cls, i) => {
            const col = CLASS_COLORS[i % CLASS_COLORS.length];
            const key = `B_class_${cls.id}`;
            const B = theoretical.results[key] ?? 0;
            return (
              <div
                key={cls.id}
                className={`rounded-lg border p-3 space-y-1 ${col.light} ${col.border}`}
              >
                <p className={`text-xs font-semibold ${col.textColor}`}>
                  Class {cls.id}
                </p>
                <p className={`text-xs font-mono ${col.textColor}`}>
                  a = {cls.incomingLoad_a} erl · b = {cls.bu} b.u.
                </p>
                <p className={`text-lg font-bold ${col.textColor}`}>
                  B<sub>{cls.id}</sub> = {(B * 100).toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">
          Exact blocking probabilities from the LAG formula. The observed GoS
          converges to these over time.
        </p>
      </div>

      {/* Utilization */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Resource utilization
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              Analytical (model)
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-slate-400">U</p>
                <p className="text-lg font-bold text-slate-700">
                  {theoretical.utilization.U.toFixed(3)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    b.u.
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Efficiency</p>
                <p className="text-lg font-bold text-sky-600">
                  {theoretical.utilization.efficiency.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-400"
                style={{ width: `${theoretical.utilization.efficiency}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              Observed ({stats.ticks} ticks)
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-slate-400">Mean occupancy</p>
                <p className="text-lg font-bold text-slate-700">
                  {observedU ?? "-"}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    b.u.
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Efficiency</p>
                <p className="text-lg font-bold text-emerald-600">
                  {observedEff != null ? `${observedEff}%` : "-"}
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{
                  width: observedEff != null ? `${observedEff}%` : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event log */}
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
