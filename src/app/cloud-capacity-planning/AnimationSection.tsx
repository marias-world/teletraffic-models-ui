"use client";

import { useState } from "react";
import CloudCapacityAnimation from "./CloudCapacityAnimation";

type AnimStatus = "stopped" | "running" | "paused";

export default function AnimationSection() {
  const [status, setStatus] = useState<AnimStatus>("stopped");

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Animation</h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        Watch VM requests arrive needing CPU, RAM, disk, and network capacity
        all at once. The Group Manager scans the physical machines (PMs) in
        its group and places the VM on the first one with enough free room on
        every resource. If none has room on all four, the request is blocked.
      </p>

      {/* Controls */}
      <div className="flex gap-2">
        {status === "stopped" && (
          <button
            onClick={() => setStatus("running")}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
          >
            Start
          </button>
        )}
        {status === "running" && (
          <>
            <button
              onClick={() => setStatus("paused")}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition"
            >
              Pause
            </button>
            <button
              onClick={() => setStatus("stopped")}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold transition"
            >
              Stop
            </button>
          </>
        )}
        {status === "paused" && (
          <>
            <button
              onClick={() => setStatus("running")}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
            >
              Resume
            </button>
            <button
              onClick={() => setStatus("stopped")}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold transition"
            >
              Stop
            </button>
          </>
        )}
      </div>

      <CloudCapacityAnimation status={status} />
    </section>
  );
}
