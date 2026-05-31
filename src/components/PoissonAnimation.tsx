"use client";

import { useState, useEffect, useRef } from "react";

// ─── simulation constants ────────────────────────────────────────────────────
const TIMELINE_SECS = 10;   // seconds of history shown
const PX_PER_SEC    = 52;   // pixels per simulated second
const SVG_W         = TIMELINE_SECS * PX_PER_SEC + 48;
const SVG_H         = 96;
const AXIS_Y        = 62;
const SIM_SPEED     = 1.5;  // sim-seconds per real second
const TICK_MS       = 50;   // update interval (ms)

type Arrival = { id: number; simTime: number; gap: number };

function sampleExp(lambda: number) {
  return -Math.log(Math.random()) / lambda;
}

// ─── component ───────────────────────────────────────────────────────────────
export default function PoissonAnimation() {
  const [lambda,   setLambda]   = useState(1);
  const [running,  setRunning]  = useState(false);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [simTime,  setSimTime]  = useState(0);

  // All mutable sim state lives here so the interval closure always sees it.
  const sim = useRef({
    arrivals: [] as Arrival[],
    simTime:  0,
    nextAt:   sampleExp(1),
    lastAt:   0,
    id:       0,
    lambda:   1,
    running:  false,
  });

  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Keep lambda in sync with the ref
  useEffect(() => { sim.current.lambda = lambda; }, [lambda]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timer.current), []);

  function stop() {
    clearInterval(timer.current);
    sim.current.running = false;
    setRunning(false);
  }

  function reset() {
    stop();
    const s = sim.current;
    s.arrivals = [];
    s.simTime  = 0;
    s.nextAt   = sampleExp(s.lambda);
    s.lastAt   = 0;
    s.id       = 0;
    s.running  = false;
    setArrivals([]);
    setSimTime(0);
  }

  function play() {
    sim.current.running = true;
    setRunning(true);
    timer.current = setInterval(() => {
      const s = sim.current;
      if (!s.running) return;

      s.simTime += (TICK_MS / 1000) * SIM_SPEED;

      // process all arrivals that happened this tick
      while (s.simTime >= s.nextAt) {
        const gap = s.nextAt - s.lastAt;
        s.arrivals = [
          ...s.arrivals.slice(-40),
          { id: s.id++, simTime: s.nextAt, gap },
        ];
        s.lastAt  = s.nextAt;
        s.nextAt += sampleExp(s.lambda);
      }

      setSimTime(s.simTime);
      setArrivals([...s.arrivals]);
    }, TICK_MS);
  }

  // ── derived display values ─────────────────────────────────────────────────
  const visible = arrivals.filter(
    (a) => simTime - a.simTime <= TIMELINE_SECS && a.simTime <= simTime,
  );

  // x position of an arrival on the SVG (left = now, drift rightward with age)
  const xOf = (a: Arrival) =>
    16 + (simTime - a.simTime) * PX_PER_SEC;

  const avgGap =
    arrivals.length > 1
      ? arrivals[arrivals.length - 1].simTime / arrivals.length
      : null;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
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
          <span className="font-mono font-medium w-32">
            λ = {lambda} call{lambda !== 1 ? "s" : ""}/s
          </span>
          <input
            type="range" min={0.5} max={3} step={0.5} value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-28 accent-sky-500"
          />
        </label>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-sky-500" />
          call arrival
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t-2 border-dashed border-sky-200" />
          interarrival gap
        </span>
      </div>

      {/* SVG timeline */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ minWidth: 300 }}
        >
          {/* axis line */}
          <line
            x1={8} y1={AXIS_Y} x2={SVG_W - 8} y2={AXIS_Y}
            stroke="#e2e8f0" strokeWidth={2}
          />
          {/* "now" label on the left */}
          <text x={10} y={AXIS_Y + 13} fontSize={9} fill="#94a3b8" textAnchor="start">
            ← now
          </text>

          {/* gap brackets between consecutive visible dots */}
          {visible.map((a, i) => {
            if (i === 0) return null;
            const prev = visible[i - 1];
            const x1 = xOf(prev);
            const x2 = xOf(a);
            if (x1 > SVG_W - 8 || x2 > SVG_W - 8) return null;
            const mx = (x1 + x2) / 2;
            const bracketY = AXIS_Y - 18;
            return (
              <g key={`gap-${a.id}`}>
                {/* horizontal dashed line */}
                <line
                  x1={x1 + 7} y1={bracketY}
                  x2={x2 - 7} y2={bracketY}
                  stroke="#bae6fd" strokeWidth={1.5} strokeDasharray="3 2"
                />
                {/* left tick */}
                <line
                  x1={x1 + 7} y1={bracketY - 3}
                  x2={x1 + 7} y2={bracketY + 3}
                  stroke="#bae6fd" strokeWidth={1}
                />
                {/* right tick */}
                <line
                  x1={x2 - 7} y1={bracketY - 3}
                  x2={x2 - 7} y2={bracketY + 3}
                  stroke="#bae6fd" strokeWidth={1}
                />
                {/* gap label */}
                <text
                  x={mx} y={bracketY - 5}
                  fontSize={9} fill="#0ea5e9" textAnchor="middle"
                >
                  {a.gap.toFixed(1)}s
                </text>
              </g>
            );
          })}

          {/* arrival dots */}
          {visible.map((a) => {
            const x = xOf(a);
            if (x > SVG_W - 8) return null;
            const age = simTime - a.simTime;
            const isNew = age < 0.35;
            return (
              <g key={a.id}>
                {/* ripple for brand-new arrivals */}
                {isNew && (
                  <circle
                    cx={x} cy={AXIS_Y}
                    r={6 + (age / 0.35) * 12}
                    fill="none"
                    stroke="#bae6fd"
                    strokeWidth={1.5}
                    opacity={1 - age / 0.35}
                  />
                )}
                <circle
                  cx={x} cy={AXIS_Y}
                  r={isNew ? 7 : 6}
                  fill={isNew ? "#38bdf8" : "#0ea5e9"}
                  stroke="white"
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {/* empty state hint */}
          {visible.length === 0 && (
            <text x={SVG_W / 2} y={AXIS_Y - 4} fontSize={11} fill="#cbd5e1" textAnchor="middle">
              press Play to start
            </text>
          )}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-xl font-bold text-sky-500">{arrivals.length}</div>
          <div className="text-xs text-slate-500 mt-1">total arrivals</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-xl font-bold text-sky-500">
            {avgGap != null ? `${avgGap.toFixed(2)}s` : "..."}
          </div>
          <div className="text-xs text-slate-500 mt-1">observed avg gap</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-xl font-bold text-slate-400">
            {(1 / lambda).toFixed(2)}s
          </div>
          <div className="text-xs text-slate-500 mt-1">
            expected (1/λ)
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Watch the observed avg gap converge toward the expected 1/λ as arrivals accumulate.
      </p>
    </div>
  );
}
