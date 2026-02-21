"use client";

import { useState } from "react";
import { BlockMath } from "react-katex";
import ErlangExplanation from "./erlangExplanation";

export default function Page() {
  const [capacity, setCapacity] = useState("");
  const [traffic, setTraffic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const erlangBWithSteps = (capacity: number, trafficLoad: number) => {
    let B = 1;
    const steps: string[] = [];

    steps.push(`B(0) = 1`);

    for (let n = 1; n <= capacity; n++) {
      const prev = B;
      B = (trafficLoad * prev) / (n + trafficLoad * prev);

      steps.push(
        `B(${n}) = \\frac{${trafficLoad} \\cdot ${prev.toFixed(4)}}{${n} + ${trafficLoad} \\cdot ${prev.toFixed(4)}} = ${B.toFixed(6)}`,
      );
    }

    return { result: B, steps };
  };

  const runModel = () => {
    setLoading(true);
    setShowSteps(false);

    // const res = await fetch("http://localhost:8080/api/emlm", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     cpu: Number(capacity),
    //     traffic: Number(traffic),
    //   }),
    // });

    // const recurrentErlangformula = (
    //   capacity: number,
    //   trafficLoad: number,
    // ): number => {
    //   if (capacity === 0) {
    //     return 1;
    //   }

    //   return (
    //     (trafficLoad * recurrentErlangformula(capacity - 1, trafficLoad)) /
    //     (capacity +
    //       trafficLoad * recurrentErlangformula(capacity - 1, trafficLoad))
    //   );
    // };

    // const data = recurrentErlangformula(Number(capacity), Number(traffic));
    // setResult(data);
    // setLoading(false);

    const { result, steps } = erlangBWithSteps(
      Number(capacity),
      Number(traffic),
    );

    setResult(result);
    setSteps(steps);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Erlang-B</h1>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-4">
          <p className="text-slate-700">
            The fundamentals of <strong>Erlang B</strong> were established by
            Danish mathematician
            <span className="font-semibold text-blue-600">
              {" "}
              Agner Krarup Erlang
            </span>
            . He developed these models while studying telephone networks,
            specifically analysing how many users could be served in a local
            area by a limited number of operators handling call connections.
          </p>
          <p className="text-slate-700">
            His work laid the foundation for modern traffic engineering and
            capacity planning in telecommunications and other service systems.
          </p>
        </div>
        <ErlangExplanation />

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              System Capacity (C)
            </label>
            <input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Offered Traffic (α)
            </label>
            <input
              type="number"
              min={0}
              value={traffic}
              onChange={(e) => setTraffic(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Button */}
        <button
          onClick={runModel}
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Run Model"}
        </button>
        {/* Results */}
        {result && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2">
              Call Blocking Probability
            </h3>
            <pre className="text-sm text-slate-800  overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            <p className="text-slate-600">
              {result.blockingProbability === 0
                ? "No calls will be blocked."
                : `Approximately ${(result * 100).toFixed(
                    2,
                  )}% of calls will be blocked due to limited system capacity.`}
            </p>
          </div>
        )}
        <button
          onClick={() => setShowSteps((prev) => !prev)}
          style={{
            color: showSteps ? "#1e40af" : "#2563eb",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {showSteps ? "Hide calculation" : "Show calculation"}
        </button>
        {showSteps && (
          <div style={{ marginTop: "12px" }}>
            {steps.map((step, index) => (
              <BlockMath key={index} math={step} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
