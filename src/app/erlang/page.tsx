"use client";

import { useState } from "react";
import { BlockMath } from "react-katex";
import ErlangVisualization from "./erlangVisuals";

export default function Page() {
  const [capacity, setCapacity] = useState("");
  const [traffic, setTraffic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runModel = async () => {
    setLoading(true);

    const res = await fetch("http://localhost:8080/api/emlm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpu: Number(capacity),
        traffic: Number(traffic),
      }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8 space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800">Erlang B</h1>
        {/* Formulas */}
        <div className="pt-6 border-t border-slate-200 space-y-3">
          <h3 className="font-semibold text-slate-700">Analytical Model</h3>
          <BlockMath math={"U = \\frac{A}{C}"} />
          <BlockMath math={"N = \\frac{A}{C \\cdot T}"} />
        </div>
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
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              System Capacity (C)
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Offered Traffic (A)
            </label>
            <input
              type="number"
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
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Run Model"}
        </button>

        {/* Results */}
        {result && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2">Results</h3>
            <pre className="text-sm text-slate-800 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        {/* <ErlangVisualization /> */}
      </div>
    </div>
  );
}
