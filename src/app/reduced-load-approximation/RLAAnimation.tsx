"use client";

import { useReducer, useEffect, useRef } from "react";
import { callBlockingProbabilityinRLA } from "@/lib/models/reduced-load-approximation/reduced-load-approximation";

// ─── fixed scenario ───────────────────────────────────────────────────────────
const LINKS = [
  { id: 1, capacity: 4, label: "L1" },
  { id: 2, capacity: 5, label: "L2" },
];

const CLASSES = [
  {
    id: 1,
    label: "Class 1",
    route: [
      { linkId: 1, bu: 1 },
      { linkId: 2, bu: 1 },
    ],
    incomingLoad_a: 1,
    desc: "Voice call",
    bg: "bg-sky-400",
    light: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-700",
  },
  {
    id: 2,
    label: "Class 2",
    route: [{ linkId: 2, bu: 2 }],
    incomingLoad_a: 1,
    desc: "Video stream",
    bg: "bg-rose-400",
    light: "bg-rose-50",
    border: "border-rose-400",
    text: "text-rose-700",
  },
] as const;

type Cls = (typeof CLASSES)[number];

// ─── analytical CBP ───────────────────────────────────────────────────────────
const THEORETICAL_CBP = callBlockingProbabilityinRLA(
  LINKS.map((l) => ({ link: l.id, bu: l.capacity })),
  CLASSES.map((c) => ({
    serviceClass: c.id,
    incomingLoad_a: c.incomingLoad_a,
    route: c.route.map((r) => ({ link: r.linkId, bu: r.bu })),
  })),
);

// ─── state ────────────────────────────────────────────────────────────────────
// routeIdx = which hop in the class's route this slot currently represents
type Slot = { callId: number; classId: number; ticksLeft: number; routeIdx: number } | null;

type LinkState = { id: number; slots: Slot[] };

type LogEntry = { id: number; msg: string; type: "ok" | "blocked" | "done" };

type State = {
  linkStates: LinkState[];
  incoming: Cls | null;
  lastEvent: "accepted" | "blocked" | null;
  blockingLinkIds: number[];
  log: LogEntry[];
  stats: {
    offered: number;
    carried: number;
    blocked: number;
    perClass: Record<number, { offered: number; blocked: number }>;
    ticks: number;
  };
};

let _cid = 1;
let _lid = 1;

const makeInit = (): State => ({
  linkStates: LINKS.map((l) => ({
    id: l.id,
    slots: Array<Slot>(l.capacity).fill(null),
  })),
  incoming: null,
  lastEvent: null,
  blockingLinkIds: [],
  log: [],
  stats: {
    offered: 0,
    carried: 0,
    blocked: 0,
    perClass: Object.fromEntries(CLASSES.map((c) => [c.id, { offered: 0, blocked: 0 }])),
    ticks: 0,
  },
});

function freeOn(slots: Slot[]): number {
  return slots.filter((s) => s === null).length;
}

function tickReducer(state: State, action: "TICK" | "RESET"): State {
  if (action === "RESET") {
    _cid = 1;
    _lid = 1;
    return makeInit();
  }

  const log = [...state.log];
  const stats = { ...state.stats, perClass: { ...state.stats.perClass } };
  for (const k of CLASSES) stats.perClass[k.id] = { ...stats.perClass[k.id] };

  // ── Step 1: advance calls whose ticksLeft hits 0 ──────────────────────────
  // Collect expiring slots: {callId, classId, routeIdx, linkId}
  type Expiring = { callId: number; classId: number; routeIdx: number; linkId: number };
  const expiring: Expiring[] = [];
  for (const ls of state.linkStates) {
    for (const s of ls.slots) {
      if (s && s.ticksLeft <= 1) {
        expiring.push({ callId: s.callId, classId: s.classId, routeIdx: s.routeIdx, linkId: ls.id });
      }
    }
  }

  // Remove expiring slots (free those link slots)
  let linkStates: LinkState[] = state.linkStates.map((ls) => ({
    ...ls,
    slots: ls.slots.map((s): Slot => {
      if (!s) return null;
      if (expiring.some((e) => e.callId === s.callId && e.linkId === ls.id)) return null;
      return { ...s, ticksLeft: s.ticksLeft - 1 };
    }),
  }));

  // For each expiring slot: try to advance to next hop, or log completion
  const hold = 3; // hold time per link hop
  for (const exp of expiring) {
    const cls = CLASSES.find((c) => c.id === exp.classId)!;
    const nextHopIdx = exp.routeIdx + 1;
    if (nextHopIdx < cls.route.length) {
      // Try to move to the next link
      const nextHop = cls.route[nextHopIdx];
      const nextLs = linkStates.find((l) => l.id === nextHop.linkId)!;
      if (freeOn(nextLs.slots) >= nextHop.bu) {
        // Move: place on next link
        let assigned = 0;
        linkStates = linkStates.map((ls) => {
          if (ls.id !== nextHop.linkId) return ls;
          return {
            ...ls,
            slots: ls.slots.map((s): Slot => {
              if (!s && assigned < nextHop.bu) {
                assigned++;
                return { callId: exp.callId, classId: exp.classId, ticksLeft: hold, routeIdx: nextHopIdx };
              }
              return s;
            }),
          };
        });
        const nextLabel = LINKS.find((l) => l.id === nextHop.linkId)?.label;
        log.unshift({ id: _lid++, msg: `#${exp.callId} Class ${exp.classId} moved to ${nextLabel}`, type: "ok" });
      } else {
        // Mid-route block — call dropped
        const nextLabel = LINKS.find((l) => l.id === nextHop.linkId)?.label;
        log.unshift({ id: _lid++, msg: `#${exp.callId} Class ${exp.classId} dropped — ${nextLabel} full`, type: "blocked" });
        stats.blocked++;
        stats.perClass[exp.classId].blocked++;
      }
    } else {
      // Last hop done — call completed
      const routeLabel = cls.route.map((r) => LINKS.find((l) => l.id === r.linkId)?.label).join(" → ");
      log.unshift({ id: _lid++, msg: `#${exp.callId} Class ${exp.classId} completed ${routeLabel}`, type: "done" });
      stats.carried++;
    }
  }

  // ── Step 2: new arrival ───────────────────────────────────────────────────
  const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  stats.offered++;
  stats.perClass[cls.id].offered++;
  stats.ticks++;

  // All-or-nothing check: every link on the route must have room right now
  const blockingLinkIds: number[] = [];
  for (const hop of cls.route) {
    const ls = linkStates.find((l) => l.id === hop.linkId)!;
    if (freeOn(ls.slots) < hop.bu) blockingLinkIds.push(hop.linkId);
  }

  let lastEvent: State["lastEvent"];

  if (blockingLinkIds.length === 0) {
    // Accept: place on first hop only
    const cid = _cid++;
    const firstHop = cls.route[0];
    let assigned = 0;
    linkStates = linkStates.map((ls) => {
      if (ls.id !== firstHop.linkId) return ls;
      return {
        ...ls,
        slots: ls.slots.map((s): Slot => {
          if (!s && assigned < firstHop.bu) {
            assigned++;
            return { callId: cid, classId: cls.id, ticksLeft: hold, routeIdx: 0 };
          }
          return s;
        }),
      };
    });
    const firstLabel = LINKS.find((l) => l.id === firstHop.linkId)?.label;
    log.unshift({ id: _lid++, msg: `#${cid} Class ${cls.id} entered ${firstLabel}`, type: "ok" });
    lastEvent = "accepted";
  } else {
    const blockLabel = blockingLinkIds.map((id) => LINKS.find((l) => l.id === id)?.label).join(", ");
    log.unshift({ id: _lid++, msg: `Class ${cls.id} blocked — no room on ${blockLabel}`, type: "blocked" });
    lastEvent = "blocked";
    stats.blocked++;
    stats.perClass[cls.id].blocked++;
  }

  return {
    linkStates,
    incoming: cls,
    lastEvent,
    blockingLinkIds,
    log: log.slice(0, 8),
    stats,
  };
}

// ─── component ────────────────────────────────────────────────────────────────
type AnimStatus = "stopped" | "running" | "paused";

export default function RLAAnimation({ status }: { status: AnimStatus }) {
  const [state, dispatch] = useReducer(tickReducer, undefined, makeInit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (status === "running") {
      intervalRef.current = setInterval(() => dispatch("TICK"), 2000);
    }
    if (status === "stopped") {
      dispatch("RESET");
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const { linkStates, incoming, lastEvent, blockingLinkIds, log, stats } = state;

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2">
        {CLASSES.map((cls) => (
          <div
            key={cls.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${cls.light} ${cls.border} ${cls.text}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cls.bg}`} />
            {cls.label} · {cls.route.map((r) => `${r.bu} b.u. on ${LINKS.find((l) => l.id === r.linkId)?.label}`).join(", ")} · {cls.desc}
          </div>
        ))}
      </div>

      {/* Network diagram */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Incoming call */}
        <div className="w-full sm:w-32 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center gap-2 text-center min-h-[100px]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Incoming
          </p>
          {incoming ? (() => {
            const cls = CLASSES.find((c) => c.id === incoming.id)!;
            return (
              <>
                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${cls.light} ${cls.border}`}>
                  <span className={`text-sm font-bold ${cls.text}`}>k{cls.id}</span>
                  <span className={`text-[10px] ${cls.text}`}>{cls.desc}</span>
                </div>
                <p className={`text-[10px] font-medium ${cls.text}`}>
                  {cls.route.map((r) => LINKS.find((l) => l.id === r.linkId)?.label).join(" → ")}
                </p>
              </>
            );
          })() : (
            <p className="text-xs text-slate-300">waiting…</p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl select-none rotate-90 sm:rotate-0">→</div>

        {/* Links */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {linkStates.map((ls) => {
            const link = LINKS.find((l) => l.id === ls.id)!;
            const isBlocking = blockingLinkIds.includes(ls.id);
            const free = freeOn(ls.slots);
            const occ = link.capacity - free;
            const pct = (occ / link.capacity) * 100;

            // which classes use this link?
            const classesHere = CLASSES.filter((c) => c.route.some((r) => r.linkId === ls.id));

            return (
              <div
                key={ls.id}
                className={`flex-1 rounded-xl border p-3 space-y-2 transition-all duration-300 ${
                  isBlocking
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold ${isBlocking ? "text-red-600" : "text-slate-600"}`}>
                    {link.label} · C = {link.capacity} b.u.
                  </p>
                  {isBlocking && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                      full
                    </span>
                  )}
                </div>

                {/* Slot tiles */}
                <div className="flex gap-1 flex-wrap">
                  {ls.slots.map((slot, i) => {
                    const slotCls = slot ? CLASSES.find((c) => c.id === slot.classId) : null;
                    return (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded border flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                          slotCls
                            ? `${slotCls.light} ${slotCls.border} ${slotCls.text}`
                            : isBlocking
                            ? "bg-red-100 border-red-200 text-red-300"
                            : "bg-white border-slate-200 text-slate-200"
                        }`}
                      >
                        {slot ? `k${slot.classId}` : "·"}
                      </div>
                    );
                  })}
                </div>

                {/* Capacity bar */}
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isBlocking ? "bg-red-400" : "bg-sky-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {occ}/{link.capacity} b.u. used · {classesHere.map((c) => `k${c.id}`).join(", ")} use this link
                </p>
              </div>
            );
          })}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl select-none rotate-90 sm:rotate-0">→</div>

        {/* Outcome */}
        <div className="w-full sm:w-28 flex-shrink-0 rounded-xl border flex items-center justify-center min-h-[80px] transition-all duration-300">
          {lastEvent === "accepted" && (
            <div className="w-full h-full rounded-xl bg-emerald-50 border-emerald-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✓</span>
              <p className="text-xs font-bold text-emerald-700 text-center">Accepted</p>
            </div>
          )}
          {lastEvent === "blocked" && (
            <div className="w-full h-full rounded-xl bg-red-50 border-red-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✗</span>
              <p className="text-xs font-bold text-red-600 text-center">Blocked</p>
            </div>
          )}
          {lastEvent === null && (
            <div className="w-full h-full rounded-xl bg-slate-50 border-slate-200 border flex items-center justify-center">
              <p className="text-xs text-slate-300">idle</p>
            </div>
          )}
        </div>
      </div>

      {/* RLA key insight callout */}
      {incoming && lastEvent === "blocked" && blockingLinkIds.length > 0 && (() => {
        const blockLabel = blockingLinkIds.map((id) => LINKS.find((l) => l.id === id)?.label).join(" and ");
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 space-y-1">
            <p className="font-semibold">All-or-nothing blocking</p>
            <p>
              Class {incoming.id} needs capacity on{" "}
              {incoming.route.map((r) => LINKS.find((l) => l.id === r.linkId)?.label).join(" and ")}.{" "}
              {blockLabel} {blockingLinkIds.length > 1 ? "are" : "is"} full, so the call is blocked even if
              the other links have room. This is the key constraint in the RLA model.
            </p>
          </div>
        );
      })()}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Offered", value: stats.offered, color: "text-slate-700" },
          { label: "Carried", value: stats.carried, color: "text-emerald-600" },
          { label: "Blocked", value: stats.blocked, color: "text-red-500" },
          {
            label: "GoS",
            value: stats.offered > 0 ? `${((stats.blocked / stats.offered) * 100).toFixed(1)}%` : "n/a",
            color: "text-sky-600",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Per-class stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CLASSES.map((cls) => {
          const pc = stats.perClass[cls.id];
          const observedB = pc.offered > 0 ? pc.blocked / pc.offered : null;
          const theoretical = THEORETICAL_CBP[`B${cls.id}`] ?? 0;
          return (
            <div key={cls.id} className={`rounded-xl border p-4 space-y-2 ${cls.light} ${cls.border}`}>
              <p className={`text-xs font-semibold ${cls.text}`}>{cls.label} · {cls.desc}</p>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Offered: {pc.offered}</span>
                <span>Blocked: {pc.blocked}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400">Observed B</p>
                  <p className={`text-lg font-bold ${cls.text}`}>
                    {observedB != null ? `${(observedB * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">RLA model B</p>
                  <p className={`text-lg font-bold ${cls.text}`}>
                    {(theoretical * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cls.bg} transition-all duration-500`}
                  style={{ width: `${theoretical * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Event log */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event log</p>
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
                    entry.type === "ok" ? "bg-emerald-400" : entry.type === "blocked" ? "bg-red-400" : "bg-slate-300"
                  }`}
                />
                <span
                  className={
                    entry.type === "ok" ? "text-emerald-700" : entry.type === "blocked" ? "text-red-600" : "text-slate-500"
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
