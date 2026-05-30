"use client";

import { useState, useRef, useEffect } from "react";
import { recursiveErlangB } from "@/lib/models/erlang-b";

// ─── types ────────────────────────────────────────────────────────────────────
type ActiveCall = { id: number; endsAt: number };
type ArrivalDot = { id: number; simTime: number; accepted: boolean };

// ─── helpers ──────────────────────────────────────────────────────────────────
function sampleExp(rate: number) {
  return -Math.log(Math.random()) / rate;
}

// ─── constants ────────────────────────────────────────────────────────────────
const SIM_SPEED = 1;
const TICK_MS = 50;
const TIMELINE_S = 10;
const PX_PER_SEC = 50;
const SVG_W = TIMELINE_S * PX_PER_SEC + 48;
const SVG_H = 70;
const AXIS_Y = 40;
const MU = 1;
const SIM_DURATION = 30; // simulated seconds before auto-stop

// ─── main component ───────────────────────────────────────────────────────────
export default function ErlangAnimation() {
  const [capacity, setCapacity] = useState(5);
  const [alpha, setAlpha] = useState(2);
  const [running, setRunning] = useState(false);
  const [dots, setDots] = useState<ArrivalDot[]>([]);
  const [simTime, setSimTime] = useState(0);
  const [stats, setStats] = useState({ total: 0, blocked: 0, busy: 0 });
  const [firstBlockCall, setFirstBlockCall] = useState<number | null>(null);

  const sim = useRef({
    activeSlots: [] as ActiveCall[],
    dots: [] as ArrivalDot[],
    simTime: 0,
    nextAt: sampleExp(2),
    id: 0,
    capacity: 3,
    lambda: 2,
    running: false,
    total: 0,
    blocked: 0,
    firstBlockAt: null as number | null,
  });

  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  function handleCapacityChange(v: number) {
    setCapacity(v);
    sim.current.capacity = v;
  }

  function handleAlphaChange(v: number) {
    setAlpha(v);
    sim.current.lambda = v * MU;
  }

  function stop() {
    clearInterval(timer.current);
    timer.current = undefined;
    sim.current.running = false;
    setRunning(false);
  }

  function reset() {
    clearInterval(timer.current);
    timer.current = undefined;
    const s = sim.current;
    s.activeSlots = [];
    s.dots = [];
    s.simTime = 0;
    s.nextAt = sampleExp(s.lambda);
    s.id = 0;
    s.total = 0;
    s.blocked = 0;
    s.firstBlockAt = null;
    s.running = false;
    setRunning(false);
    setDots([]);
    setSimTime(0);
    setStats({ total: 0, blocked: 0, busy: 0 });
    setFirstBlockCall(null);
  }

  function play() {
    clearInterval(timer.current);
    sim.current.running = true;
    sim.current.nextAt = sim.current.simTime + sampleExp(sim.current.lambda);
    setRunning(true);

    timer.current = setInterval(() => {
      const s = sim.current;
      if (!s.running) return;

      s.simTime += (TICK_MS / 1000) * SIM_SPEED;
      s.activeSlots = s.activeSlots.filter((c) => c.endsAt > s.simTime);

      while (s.simTime >= s.nextAt) {
        s.total++;
        const accepted = s.activeSlots.length < s.capacity;
        if (accepted) {
          s.activeSlots.push({ id: s.id, endsAt: s.nextAt + sampleExp(MU) });
        } else {
          s.blocked++;
          if (s.firstBlockAt === null) {
            s.firstBlockAt = s.total;
            setFirstBlockCall(s.total);
          }
        }
        s.dots = [
          ...s.dots.slice(-40),
          { id: s.id++, simTime: s.nextAt, accepted },
        ];
        s.nextAt += sampleExp(s.lambda);
      }

      setSimTime(s.simTime);
      setDots([...s.dots]);
      setStats({
        total: s.total,
        blocked: s.blocked,
        busy: s.activeSlots.length,
      });

      // auto-stop when the simulation period ends
      if (s.simTime >= SIM_DURATION) {
        clearInterval(timer.current);
        timer.current = undefined;
        s.running = false;
        setRunning(false);
      }
    }, TICK_MS);
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const progress = Math.min(simTime / SIM_DURATION, 1);
  const visible = dots.filter(
    (d) => simTime - d.simTime <= TIMELINE_S && d.simTime <= simTime,
  );
  const xOf = (d: ArrivalDot) => 16 + (simTime - d.simTime) * PX_PER_SEC;
  const busySlots = Math.min(stats.busy, capacity);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {running ? (
            <button
              onClick={stop}
              className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-lg font-medium text-sm"
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              onClick={play}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium text-sm"
            >
              ▶ Play
            </button>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50"
          >
            ↺ Reset
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-mono font-medium w-28">
            C = {capacity} channels
          </span>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={capacity}
            onChange={(e) => handleCapacityChange(Number(e.target.value))}
            className="w-24 accent-sky-500"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-mono font-medium w-20">α = {alpha} Erl</span>
          <input
            type="range"
            min={0.5}
            max={6}
            step={0.5}
            value={alpha}
            onChange={(e) => handleAlphaChange(Number(e.target.value))}
            className="w-24 accent-sky-500"
          />
        </label>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{simTime.toFixed(1)}s</span>
          <span>{SIM_DURATION}s</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
          call accepted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-400" />
          call blocked (all channels busy)
        </span>
      </div>

      {/* Arrival stream */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H + 16}`}
          className="w-full"
          style={{ minWidth: 300 }}
        >
          <line
            x1={8}
            y1={AXIS_Y}
            x2={SVG_W - 8}
            y2={AXIS_Y}
            stroke="#e2e8f0"
            strokeWidth={2}
          />

          {[2, 4, 6, 8, 10].map((t) => {
            const x = 16 + t * PX_PER_SEC;
            return (
              <g key={t}>
                <line
                  x1={x}
                  y1={AXIS_Y - 4}
                  x2={x}
                  y2={AXIS_Y + 4}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={AXIS_Y + 16}
                  fontSize={9}
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  -{t}s
                </text>
              </g>
            );
          })}

          <text x={18} y={AXIS_Y + 16} fontSize={9} fill="#94a3b8">
            now
          </text>

          {visible.length === 0 && (
            <text
              x={SVG_W / 2}
              y={AXIS_Y - 10}
              fontSize={11}
              fill="#cbd5e1"
              textAnchor="middle"
            >
              press Play to start
            </text>
          )}

          {visible.map((d) => {
            const x = xOf(d);
            if (x > SVG_W - 8) return null;
            const age = simTime - d.simTime;
            const isNew = age < 0.35;
            const fill = d.accepted ? "#22c55e" : "#ef4444";
            const ring = d.accepted ? "#86efac" : "#fca5a5";
            return (
              <g key={d.id}>
                {isNew && (
                  <circle
                    cx={x}
                    cy={AXIS_Y}
                    r={6 + (age / 0.35) * 10}
                    fill="none"
                    stroke={ring}
                    strokeWidth={1.5}
                    opacity={1 - age / 0.35}
                  />
                )}
                <circle
                  cx={x}
                  cy={AXIS_Y}
                  r={isNew ? 7 : 6}
                  fill={fill}
                  stroke="white"
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Server channels */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">
            Server — {busySlots} / {capacity} channels busy
          </span>
          {busySlots === capacity && running && (
            <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
              FULL — next call will be blocked
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: capacity }).map((_, i) => (
            <div
              key={i}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-200 ${
                i < busySlots
                  ? "bg-sky-500 border-sky-600 scale-110 shadow-md"
                  : "bg-white border-slate-200"
              }`}
            >
              {i < busySlots ? "📞" : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-3xl font-bold text-red-500">
            {(recursiveErlangB(capacity, alpha).result * 100).toFixed(2)}%
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">
            blocking probability
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Erlang-B (C = {capacity}, α = {alpha})
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-3xl font-bold text-slate-700">
            {firstBlockCall !== null ? firstBlockCall : "—"}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">
            calls until first block
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {firstBlockCall !== null
              ? `call #${firstBlockCall} was blocked`
              : "no block yet"}
          </div>
        </div>
      </div>
    </div>
  );
}
