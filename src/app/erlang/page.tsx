"use client";

import ModelTemplate from "@/components/modelTemplate";
import ErlangExplanation from "./erlangExplanation";
import Layout from "@/components/layout";

export default function Page() {
  const recursiveErlangBWithSteps = (
    capacity: number,
    traffic: number,
    steps: string[] = [],
  ): { result: number; steps: string[] } => {
    // Base case
    if (capacity === 0) {
      steps.push(`B(0) = 1`);
      return { result: 1, steps };
    }

    const prevResult = recursiveErlangBWithSteps(
      capacity - 1,
      traffic,
      steps,
    ).result;

    const B = (traffic * prevResult) / (capacity + traffic * prevResult);
    steps.push(
      `B(${capacity}) = \\frac{${traffic} \\cdot ${prevResult.toFixed(6)}}{${capacity} + ${traffic} \\cdot ${prevResult.toFixed(
        6,
      )}} = ${B.toFixed(6)}`,
    );

    return { result: B, steps };
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 bg-slate-100">
        <ModelTemplate
          title="Erlang-B Model"
          description={<ErlangExplanation />}
          onRun={(inputs: Record<string, number>) =>
            recursiveErlangBWithSteps(inputs.capacity, inputs.traffic)
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
