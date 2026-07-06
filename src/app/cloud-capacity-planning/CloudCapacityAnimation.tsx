"use client";

import { useReducer, useEffect, useRef } from "react";
import { calculateCloudCapacityBlockingProbabilities } from "@/lib/models/cloud-capacity-planning/proposed-model-data";
import { Capacities, ServiceClassConfigs } from "@/lib/models/cloud-capacity-planning/types";

// ─── fixed scenario ───────────────────────────────────────────────────────────
const T = 2; // PMs per Group Manager

type ResourceKey = "P" | "R" | "D" | "bps";
const RESOURCE_KEYS: ResourceKey[] = ["P", "R", "D", "bps"];
const RESOURCE_LABELS: Record<ResourceKey, string> = {
  P: "CPU",
  R: "RAM",
  D: "Disk",
  bps: "Net",
};
const RESOURCE_COLORS: Record<ResourceKey, string> = {
  P: "bg-sky-400",
  R: "bg-violet-400",
  D: "bg-amber-400",
  bps: "bg-emerald-400",
};

const CAPACITY: Record<ResourceKey, number> = { P: 6, R: 6, D: 6, bps: 6 };

const CLASSES = [
  {
    id: 1,
    label: "Small VM",
    bu: { P: 1, R: 1, D: 1, bps: 1 } as Record<ResourceKey, number>,
    incomingLoad_a: 1.5,
    bg: "bg-sky-400",
    light: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-700",
  },
  {
    id: 2,
    label: "Medium VM",
    bu: { P: 2, R: 2, D: 1, bps: 1 } as Record<ResourceKey, number>,
    incomingLoad_a: 1.0,
    bg: "bg-violet-400",
    light: "bg-violet-50",
    border: "border-violet-400",
    text: "text-violet-700",
  },
  {
    id: 3,
    label: "Large VM",
    bu: { P: 2, R: 2, D: 2, bps: 2 } as Record<ResourceKey, number>,
    incomingLoad_a: 0.7,
    bg: "bg-amber-400",
    light: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-700",
  },
] as const;

type Cls = (typeof CLASSES)[number];

// ─── analytical CBP (via the real model) ──────────────────────────────────────
const MODEL_CAPACITIES: Capacities = {
  ramCapacity: { link: 1, bu: CAPACITY.R },
  processorCapacity: { link: 2, bu: CAPACITY.P },
  diskCapacity: { link: 3, bu: CAPACITY.D },
  bpsCapacity: { link: 4, bu: CAPACITY.bps },
};
const MODEL_SERVICE_CLASSES: ServiceClassConfigs = {
  ram: CLASSES.map((c) => ({
    serviceClass: c.id,
    incomingLoad_a: c.incomingLoad_a,
    bu: c.bu.R,
  })),
  processor: CLASSES.map((c) => ({
    serviceClass: c.id,
    incomingLoad_a: c.incomingLoad_a,
    bu: c.bu.P,
  })),
  disk: CLASSES.map((c) => ({
    serviceClass: c.id,
    incomingLoad_a: c.incomingLoad_a,
    bu: c.bu.D,
  })),
  bitrate: CLASSES.map((c) => ({
    serviceClass: c.id,
    incomingLoad_a: c.incomingLoad_a,
    bu: c.bu.bps,
  })),
};
const THEORETICAL_CBP = calculateCloudCapacityBlockingProbabilities(
  T,
  MODEL_CAPACITIES,
  MODEL_SERVICE_CLASSES,
).Ei;

// ─── state ────────────────────────────────────────────────────────────────────
type Tenant = { callId: number; classId: number; ticksLeft: number };
type PmState = { id: number; tenants: Tenant[] };
type LogEntry = { id: number; msg: string; type: "ok" | "blocked" | "done" };

type State = {
  pms: PmState[];
  incoming: Cls | null;
  lastEvent: "accepted" | "blocked" | null;
  placedPmId: number | null;
  shortfallByPm: Record<number, ResourceKey[]>;
  log: LogEntry[];
  stats: {
    offered: number;
    carried: number;
    blocked: number;
    perClass: Record<number, { offered: number; blocked: number }>;
  };
};

let _cid = 1;
let _lid = 1;
const HOLD = 4;

const makeInit = (): State => ({
  pms: Array.from({ length: T }, (_, i) => ({ id: i + 1, tenants: [] })),
  incoming: null,
  lastEvent: null,
  placedPmId: null,
  shortfallByPm: {},
  log: [],
  stats: {
    offered: 0,
    carried: 0,
    blocked: 0,
    perClass: Object.fromEntries(
      CLASSES.map((c) => [c.id, { offered: 0, blocked: 0 }]),
    ),
  },
});

function occupied(pm: PmState, y: ResourceKey): number {
  return pm.tenants.reduce((sum, t) => {
    const cls = CLASSES.find((c) => c.id === t.classId)!;
    return sum + cls.bu[y];
  }, 0);
}

function freeOn(pm: PmState, y: ResourceKey): number {
  return CAPACITY[y] - occupied(pm, y);
}

function shortfallFor(pm: PmState, demand: Record<ResourceKey, number>) {
  return RESOURCE_KEYS.filter((y) => freeOn(pm, y) < demand[y]);
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

  // ── Step 1: expire finished VMs ───────────────────────────────────────────
  let pms: PmState[] = state.pms.map((pm) => ({ ...pm, tenants: [...pm.tenants] }));
  for (const pm of pms) {
    const expiring = pm.tenants.filter((t) => t.ticksLeft <= 1);
    for (const exp of expiring) {
      const cls = CLASSES.find((c) => c.id === exp.classId)!;
      log.unshift({
        id: _lid++,
        msg: `VM #${exp.callId} (${cls.label}) finished on PM${pm.id}`,
        type: "done",
      });
      stats.carried++;
    }
    pm.tenants = pm.tenants
      .filter((t) => t.ticksLeft > 1)
      .map((t) => ({ ...t, ticksLeft: t.ticksLeft - 1 }));
  }

  // ── Step 2: new VM request arrives ────────────────────────────────────────
  const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  stats.offered++;
  stats.perClass[cls.id].offered++;

  // Group Manager scans PMs in order for one with room on all four resources.
  let placedPmId: number | null = null;
  const shortfallByPm: Record<number, ResourceKey[]> = {};
  for (const pm of pms) {
    const shortfall = shortfallFor(pm, cls.bu);
    if (shortfall.length === 0 && placedPmId === null) {
      placedPmId = pm.id;
    } else if (shortfall.length > 0) {
      shortfallByPm[pm.id] = shortfall;
    }
  }

  let lastEvent: State["lastEvent"];

  if (placedPmId !== null) {
    const cid = _cid++;
    pms = pms.map((pm) =>
      pm.id === placedPmId
        ? { ...pm, tenants: [...pm.tenants, { callId: cid, classId: cls.id, ticksLeft: HOLD }] }
        : pm,
    );
    log.unshift({
      id: _lid++,
      msg: `VM #${cid} (${cls.label}) placed on PM${placedPmId}`,
      type: "ok",
    });
    lastEvent = "accepted";
  } else {
    log.unshift({
      id: _lid++,
      msg: `${cls.label} blocked — no PM has room on all four resources`,
      type: "blocked",
    });
    lastEvent = "blocked";
    stats.blocked++;
    stats.perClass[cls.id].blocked++;
  }

  return {
    pms,
    incoming: cls,
    lastEvent,
    placedPmId,
    shortfallByPm,
    log: log.slice(0, 8),
    stats,
  };
}

// ─── component ────────────────────────────────────────────────────────────────
type AnimStatus = "stopped" | "running" | "paused";

export default function CloudCapacityAnimation({ status }: { status: AnimStatus }) {
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

  const { pms, incoming, lastEvent, placedPmId, shortfallByPm, log, stats } = state;

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
            {cls.label} ·{" "}
            {RESOURCE_KEYS.map((y) => `${cls.bu[y]} ${RESOURCE_LABELS[y]}`).join(", ")}
          </div>
        ))}
      </div>

      {/* Diagram */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Incoming VM request */}
        <div className="w-full sm:w-36 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center gap-2 text-center min-h-[110px]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Incoming
          </p>
          {incoming ? (
            <>
              <div
                className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border ${incoming.light} ${incoming.border}`}
              >
                <span className={`text-sm font-bold ${incoming.text}`}>k{incoming.id}</span>
                <span className={`text-[9px] ${incoming.text}`}>{incoming.label}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {RESOURCE_KEYS.map((y) => `${incoming.bu[y]}${y}`).join(" ")}
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-300">waiting…</p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl select-none rotate-90 sm:rotate-0">
          →
        </div>

        {/* Group Manager */}
        <div className="w-full sm:w-32 flex-shrink-0 rounded-xl border border-violet-200 bg-violet-50 p-3 flex flex-col items-center justify-center gap-1 text-center min-h-[110px]">
          <p className="text-xs font-semibold text-violet-700">Group Manager</p>
          <p className="text-[10px] text-violet-400">
            scans PM1…PM{T} for room on all 4 resources
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl select-none rotate-90 sm:rotate-0">
          →
        </div>

        {/* PMs */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {pms.map((pm) => {
            const isPlaced = placedPmId === pm.id;
            const shortfall = shortfallByPm[pm.id] ?? [];
            const isShort = shortfall.length > 0;

            return (
              <div
                key={pm.id}
                className={`flex-1 rounded-xl border p-3 space-y-2 transition-all duration-300 ${
                  isPlaced
                    ? "border-emerald-400 bg-emerald-50"
                    : isShort
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-semibold ${
                      isPlaced ? "text-emerald-700" : isShort ? "text-red-600" : "text-slate-600"
                    }`}
                  >
                    PM{pm.id}
                  </p>
                  {isShort && (
                    <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                      short on {shortfall.map((y) => RESOURCE_LABELS[y]).join(", ")}
                    </span>
                  )}
                </div>

                {/* Resource bars */}
                <div className="space-y-1">
                  {RESOURCE_KEYS.map((y) => {
                    const occ = occupied(pm, y);
                    const pct = (occ / CAPACITY[y]) * 100;
                    return (
                      <div key={y} className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 w-6 flex-shrink-0">
                          {RESOURCE_LABELS[y]}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${RESOURCE_COLORS[y]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 w-8 flex-shrink-0 text-right">
                          {occ}/{CAPACITY[y]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-400">
                  {pm.tenants.length} VM{pm.tenants.length === 1 ? "" : "s"} running
                </p>
              </div>
            );
          })}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-slate-300 text-xl select-none rotate-90 sm:rotate-0">
          →
        </div>

        {/* Outcome */}
        <div className="w-full sm:w-28 flex-shrink-0 rounded-xl border flex items-center justify-center min-h-[80px] transition-all duration-300">
          {lastEvent === "accepted" && (
            <div className="w-full h-full rounded-xl bg-emerald-50 border-emerald-300 border flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">✓</span>
              <p className="text-xs font-bold text-emerald-700 text-center">Placed</p>
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

      {/* Why blocked callout */}
      {incoming && lastEvent === "blocked" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 space-y-1">
          <p className="font-semibold">All-or-nothing across four resources</p>
          <p>
            {incoming.label} needs{" "}
            {RESOURCE_KEYS.map((y) => `${incoming.bu[y]} ${RESOURCE_LABELS[y]}`).join(", ")} at
            once. Every PM in the group is short on at least one resource, so the request is
            blocked even though some PMs may have spare room elsewhere.
          </p>
        </div>
      )}

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CLASSES.map((cls) => {
          const pc = stats.perClass[cls.id];
          const observedB = pc.offered > 0 ? pc.blocked / pc.offered : null;
          const theoretical = THEORETICAL_CBP[`B_class_${cls.id}`] ?? 0;
          return (
            <div key={cls.id} className={`rounded-xl border p-4 space-y-2 ${cls.light} ${cls.border}`}>
              <p className={`text-xs font-semibold ${cls.text}`}>{cls.label}</p>
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
                  <p className="text-[10px] text-slate-400">Model B</p>
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
