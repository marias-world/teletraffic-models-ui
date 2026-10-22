import { InlineMath } from "react-katex";
import {
  DEFAULT_SERVICE_DIST_PARAMS,
  holdingTimeSteps,
  hyperSlowMeanFactor,
  MAX_ERLANG_STAGES,
  MAX_LOGNORMAL_SIGMA,
  parseServiceDistParams,
  sampleSummary,
  SERVICE_DISTRIBUTIONS,
  ServiceDistribution,
  ServiceDistributionParamInputs,
  ServiceDistributionParams,
  WORKED_EXAMPLE_MEAN,
} from "@/lib/models/simulation/service-time-distributions";

export function HoldingTimeDistributionsTable({
  params,
  reference = "erlang",
}: {
  params?: ServiceDistributionParams;
  reference?: "erlang" | "multirate" | "both";
}) {
  const shown = params ?? DEFAULT_SERVICE_DIST_PARAMS;
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 leading-relaxed">
        All five keep the mean call duration at <InlineMath math="h = 1/\mu" />,
        so the offered load never changes. They differ only in how much call
        lengths vary, which the table scores with <InlineMath math="CV^2" />{" "}
        (the squared coefficient of variation, variance divided by mean
        squared).
      </p>
      <p className="text-xs text-slate-500 leading-relaxed">
        In simple terms: <InlineMath math="CV^2" /> tells you how unpredictable
        call lengths are compared with the average. 0 means every call lasts
        exactly the same time. The bigger it gets, the more calls stray from the
        average, a mix of very short and very long ones. 1 is the exponential,
        our reference point.
      </p>
      {!params && (
        <p className="text-xs text-slate-500 leading-relaxed">
          The table shows the default parameters. You can change them in the
          simulation calculators (Erlang-B and EMLM) and see the effect.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs text-slate-400 tracking-wider">
              <th className="text-left px-2">Distribution</th>
              <th className="text-left px-2">Rule</th>
              <th className="text-left px-2">
                <InlineMath math="CV^2" />
              </th>
              <th className="text-left px-2">Example</th>
            </tr>
          </thead>
          <tbody>
            {SERVICE_DISTRIBUTIONS.map(
              ({ value, label, rule, example, squaredCv }) => (
                <tr key={value} className="bg-white align-top">
                  <td className="px-2 py-1.5 text-slate-700">{label}</td>
                  <td className="px-2 py-1.5 text-slate-600 min-w-[16rem]">
                    {rule(shown)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-600">
                    {squaredCv(shown).toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-slate-500 min-w-[12rem]">
                    {example}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-500 leading-relaxed">
          Same mean, different shape. Say the mean call duration is{" "}
          <InlineMath math={`h = 1/\\mu = ${WORKED_EXAMPLE_MEAN}`} />, that is,
          the average call lasts {WORKED_EXAMPLE_MEAN}. Each distribution is a
          different recipe for producing call lengths, tuned so that the average
          comes out at exactly {WORKED_EXAMPLE_MEAN}. For each one, see below:
          the idea in plain words, the maths, and real calls drawn from it.
        </p>
        <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
          {SERVICE_DISTRIBUTIONS.map(
            ({
              value,
              label,
              plainWords,
              meanFormula,
              workedExample,
              squaredCv,
            }) => {
              const summary = sampleSummary(value, shown);
              const example = workedExample(shown);
              // Typical error of an average of n calls: h * sqrt(CV^2 / n).
              const typicalError =
                WORKED_EXAMPLE_MEAN *
                Math.sqrt(squaredCv(shown) / summary.count);
              return (
                <li
                  key={value}
                  className="bg-white border border-slate-200 rounded-lg p-3 space-y-1"
                >
                  <p>
                    {label.split(" (")[0]}. {plainWords(shown)}
                  </p>
                  <p>
                    <span>Maths:</span> <InlineMath math={meanFormula} />. With
                    h = {WORKED_EXAMPLE_MEAN},{" "}
                    {example.includes("\n") ? (
                      <span className="block whitespace-pre-line mt-1 pl-3 border-l-2 border-slate-200">
                        {example}
                      </span>
                    ) : (
                      example
                    )}
                  </p>
                  <p>
                    <span>Example of 8 calls:</span>{" "}
                    <span className="font-mono">
                      {summary.calls.map((x) => x.toFixed(1)).join(", ")}
                    </span>
                    <br />
                    <span>
                      Average of {summary.count.toLocaleString("en-US")} calls:
                    </span>{" "}
                    <span className="font-mono">{summary.mean.toFixed(2)}</span>{" "}
                    <span className="text-slate-400">
                      (typical error ±{typicalError.toFixed(3)})
                    </span>
                    {", "}
                    <span>median call:</span>{" "}
                    <span className="font-mono">
                      {summary.median.toFixed(2)}
                    </span>
                  </p>
                </li>
              );
            },
          )}
        </ul>
        <p className="text-xs text-slate-500 leading-relaxed">
          The &ldquo;typical error&rdquo; is how far an average of{" "}
          <InlineMath math="n" /> calls usually lands from the true mean, the
          more unequal the calls (higher <InlineMath math="CV^2" />
          ), the more calls it takes to settle. The median is the call length
          that half of all calls fall below. For skewed distributions it sits
          below the average, because a few long calls pull the average up.
        </p>
      </div>
      {reference !== "erlang" && <InsensitivityReference />}
    </div>
  );
}

const LINK = "text-sky-600 hover:underline";

function InsensitivityReference() {
  return (
    <p className="text-xs text-slate-500 leading-relaxed">
      Reference: Adrian E. Conway, &ldquo;Product-form and insensitivity in
      circuit-switched networks with failing links,&rdquo;{" "}
      <em>ScienceDirect: Performance Evaluation</em>, vol. 9, Issue 3, 1, pp.
      209&ndash;215, 1989,{" "}
      <a
        href="https://doi.org/10.1016/0166-5316(89)90027-8"
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
      >
        10.1016/0166-5316(89)90027-8
      </a>
    </p>
  );
}

export function SelectedDistributionNote({
  value,
  params,
}: {
  value: ServiceDistribution;
  params: ServiceDistributionParams;
}) {
  const info = SERVICE_DISTRIBUTIONS.find((d) => d.value === value);
  if (!info) return null;
  return (
    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
      {info.label}: {info.rule(params)} Variability <InlineMath math="CV^2" /> ={" "}
      {info.squaredCv(params).toFixed(2)} (exponential = 1). Example:{" "}
      {info.example}.
    </p>
  );
}

const INPUT = "w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm";
const LABEL = "block min-h-[18px] text-xs font-medium text-slate-600 mb-1";

export function ServiceDistributionParamControls({
  dist,
  inputs,
  onChange,
}: {
  dist: ServiceDistribution;
  inputs: ServiceDistributionParamInputs;
  onChange: (field: keyof ServiceDistributionParams, value: string) => void;
}) {
  if (dist === "exponential" || dist === "deterministic") return null;

  const { params, error } = parseServiceDistParams(inputs, dist);
  const slowFactor = hyperSlowMeanFactor(
    params.hyperFastProbability,
    params.hyperFastMeanFactor,
  );

  return (
    <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-xs font-medium text-slate-600">
        Parameters (the mean always stays <InlineMath math="h = 1/\mu" />)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {dist === "erlang" && (
          <div>
            <label className={LABEL}>
              Stages <InlineMath math="k" />
            </label>
            <input
              type="number"
              value={inputs.erlangStages}
              onChange={(e) => onChange("erlangStages", e.target.value)}
              min={1}
              max={MAX_ERLANG_STAGES}
              step={1}
              className={INPUT}
            />
          </div>
        )}
        {dist === "hyperexponential" && (
          <>
            <div>
              <label className={LABEL}>
                Quick-call probability <InlineMath math="p" />
              </label>
              <input
                type="number"
                value={inputs.hyperFastProbability}
                onChange={(e) =>
                  onChange("hyperFastProbability", e.target.value)
                }
                min={0}
                max={1}
                step={0.05}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>
                Quick-call mean (× <InlineMath math="h" />)
              </label>
              <input
                type="number"
                value={inputs.hyperFastMeanFactor}
                onChange={(e) =>
                  onChange("hyperFastMeanFactor", e.target.value)
                }
                min={0}
                max={1}
                step={0.05}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Slow-call mean (× h)</label>
              <div className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono text-slate-500">
                {error ? "…" : Number(slowFactor.toFixed(3))}
              </div>
            </div>
          </>
        )}
        {dist === "lognormal" && (
          <div>
            <label className={LABEL}>
              Spread <InlineMath math="\sigma" />
            </label>
            <input
              type="number"
              value={inputs.lognormalSigma}
              onChange={(e) => onChange("lognormalSigma", e.target.value)}
              min={0}
              max={MAX_LOGNORMAL_SIGMA}
              step={0.05}
              className={INPUT}
            />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function HoldingTimeSteps({
  value,
  params,
  multirate = false,
}: {
  value: ServiceDistribution;
  params: ServiceDistributionParams;
  multirate?: boolean;
}) {
  const info = SERVICE_DISTRIBUTIONS.find((d) => d.value === value);
  if (!info) return null;
  const steps = holdingTimeSteps(value, params, multirate);
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-slate-600">
        What happens when you pick {info.label.split(" (")[0]}
      </p>
      <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-500 leading-relaxed">
        {steps.map((step) => (
          <li key={step.title}>
            {step.title}. {step.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
