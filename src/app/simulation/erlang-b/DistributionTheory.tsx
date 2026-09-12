import { InlineMath } from "react-katex";

export default function DistributionTheory() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        2. Continuous vs. Discrete
      </h2>

      <p className="text-slate-600 leading-relaxed">
        <strong>Discrete vs. continuous</strong>: discrete outcomes are
        countable and separate (the number of busy servers: 0, 1, 2, 3…).
        Continuous outcomes can be any real number in a range (a duration of
        time: 1.2, 1.23, 1.234871 minutes…).
      </p>

      <p className="text-slate-600 leading-relaxed">
        <strong>Exponential distribution</strong>: a continuous distribution
        representing &ldquo;time until something happens&rdquo; (the next
        arrival, or a call completing). Short gaps are more common than long
        ones, but long ones are not impossible.
      </p>

      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
          💡
        </span>
        <p className="text-sm text-violet-900 leading-relaxed">
          <strong>Exponential vs. Poisson</strong>: two views of the same
          underlying process. Exponential describes the <em>gap</em> between
          arrivals (continuous). Poisson describes the <em>count</em> of
          arrivals in a fixed window (discrete). If gaps are exponential with
          rate <InlineMath math="\lambda" />, the count in any fixed window is
          automatically Poisson. The simulation only needs the exponential
          (gap-between-calls) side.
        </p>
      </div>
    </section>
  );
}
