"use client";

import ModelTemplate from "@/components/modelTemplate";
import ErlangExplanation from "./erlangExplanation";
import Layout from "@/components/layout";

export default function Page() {
  const erlangBWithSteps = (inputs: { capacity: number; traffic: number }) => {
    let B = 1;
    const steps: string[] = [];
    steps.push(`B(0) = 1`);

    for (let n = 1; n <= inputs.capacity; n++) {
      const prev = B;
      B = (inputs.traffic * prev) / (n + inputs.traffic * prev);

      steps.push(
        `B(${n}) = \\frac{${inputs.traffic} \\cdot ${prev.toFixed(
          4,
        )}}{${n} + ${inputs.traffic} \\cdot ${prev.toFixed(4)}} = ${B.toFixed(6)}`,
      );
    }

    return { result: B, steps };
  };

  return (
    <Layout>
      <div className="min-h-screen p-10 bg-slate-100">
        <ModelTemplate
          title="Erlang-B Model"
          description={<ErlangExplanation />}
          onRun={(inputs: Record<string, number>) =>
            erlangBWithSteps({
              capacity: inputs.capacity,
              traffic: inputs.traffic,
            })
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
