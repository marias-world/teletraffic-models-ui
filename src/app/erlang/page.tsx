"use client";

import ModelTemplate from "@/components/modelTemplate";
import ErlangExplanation from "./erlangExplanation";
import Layout from "@/components/layout";
import { recursiveErlangB } from "@/lib/models/erlang-b";

export default function Page() {
  return (
    <Layout>
      <div className="min-h-screen p-4 bg-slate-100 flex items-center justify-center">
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
      </div>
    </Layout>
  );
}
