"use client";

import { BlockMath } from "react-katex";
import { useState } from "react";

type ModelTemplateProps = {
  title: string;
  description: React.ReactNode;
  onRun: (inputs: Record<string, number>) => {
    result: number;
    steps?: string[];
  };
  inputs: {
    name: string;
    label: string;
  }[];
};

export default function ModelTemplate({
  title,
  description,
  onRun,
  inputs,
}: ModelTemplateProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const runModel = () => {
    setLoading(true);
    setShowSteps(false);

    const numericInputs: Record<string, number> = {};
    Object.keys(values).forEach((key) => {
      numericInputs[key] = Number(values[key]);
    });

    const { result, steps } = onRun(numericInputs);

    setResult(result);
    setSteps(steps || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>

        {description}

        <div className="space-y-4">
          {inputs.map((input) => (
            <div key={input.name}>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {input.label}
              </label>
              <input
                type="number"
                min={0}
                value={values[input.name] || ""}
                onChange={(e) => handleChange(input.name, e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={runModel}
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Calculating..." : "Run Model"}
        </button>

        {result !== null && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2">
              Call Blocking Probability
            </h3>
            <pre className="text-sm text-slate-800 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            <p className="text-slate-600">
              {typeof result === "number" && result === 0
                ? "No calls will be blocked."
                : `Approximately ${typeof result === "number" ? (result * 100).toFixed(2) : 0}% of calls will be blocked due to limited system capacity.`}
            </p>
          </div>
        )}

        {result !== null && steps.length > 0 && (
          <>
            <button
              onClick={() => setShowSteps((prev) => !prev)}
              className="text-sky-600 font-medium"
            >
              {showSteps ? "Hide calculation" : "Show calculation"}
            </button>

            {showSteps && (
              <div className="mt-4 space-y-2">
                {steps.map((step, i) => (
                  <BlockMath key={i} math={step} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
