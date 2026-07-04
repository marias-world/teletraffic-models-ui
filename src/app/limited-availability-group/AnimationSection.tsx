"use client";

import { useState } from "react";
import LimitedAvailabilityGroupAnimation, {
  AnimClass,
} from "./LimitedAvailabilityGroupAnimation";

type AnimStatus = "stopped" | "running" | "paused";

export default function AnimationSection() {
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
    stopAndApply(() => setAnimClasses((prev) => prev.filter((c) => c.id !== id)));
  }

  const animKey = `${animEll}-${animC}-${animClasses.map((c) => `${c.bu}:${c.incomingLoad_a}`).join(",")}`;

  return (
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
                  animEll > 1 && stopAndApply(() => setAnimEll((n) => n - 1))
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
                  animEll < 6 && stopAndApply(() => setAnimEll((n) => n + 1))
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
                  animC > minC && stopAndApply(() => setAnimC((n) => n - 1));
                }}
                disabled={animC <= Math.max(...animClasses.map((c) => c.bu), 1)}
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
                onChange={(e) => updateAnimClass(cls.id, "desc", e.target.value)}
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
  );
}
