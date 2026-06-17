"use client";

import ModelTemplate from "@/components/modelTemplate";
import ErlangExplanation from "./erlangExplanation";
import ErlangAnimation from "@/components/ErlangAnimation";
import { recursiveErlangB } from "@/lib/models/erlang-b";

export default function Page() {
  return (
      <div className="min-h-screen p-4 bg-slate-100">
        <div className="max-w-2xl mx-auto py-8 space-y-6">

          <ModelTemplate
            title="Erlang-B Model"
            description={<ErlangExplanation />}
            onRun={(inputs: Record<string, number>) =>
              recursiveErlangB(inputs.capacity, inputs.traffic)
            }
            inputs={[
              { name: "capacity", label: "System Capacity (C)" },
              { name: "traffic", label: "Offered Traffic (α)" },
            ]}
          />

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">See It in Action</h2>
            <p className="text-slate-600 text-sm">
              Calls arrive randomly and are served by a fixed number of channels.
              When all channels are busy, a new call is blocked.
              Adjust capacity C and offered traffic α to see how the blocking rate changes.
            </p>
            <ErlangAnimation />
          </div>

        </div>
      </div>
  );
}
