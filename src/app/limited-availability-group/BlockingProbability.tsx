import { BlockMath, InlineMath } from "react-katex";

export default function BlockingProbability() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Blocking Probability
      </h2>
      <p className="text-slate-600 leading-relaxed">
        Once the occupancy distribution is known, the unnormalised values{" "}
        <InlineMath math="q(j)" /> are normalised so they sum to 1:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="Q(j) = \frac{q(j)}{G}, \qquad G = \sum_{j} q(j)" />
      </div>

      <p className="text-slate-600 leading-relaxed">
        After finding all the probabilities <InlineMath math="q(j)" /> and{" "}
        <InlineMath math="\sigma_k(j)" />, we can calculate the CBP for the
        class <InlineMath math="k" /> calls via the formula:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="B_k = \sum_{j = \ell C - \ell b_k + \ell}^{\ell C} Q(j)\,\bigl(1 - \sigma_k(j)\bigr)" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        where <InlineMath math="j = \ell C - \ell b_k + \ell" /> indicates the
        threshold beyond which a new class <InlineMath math="k" /> call cannot
        be accepted, leading the system to block it. This mechanism ensures
        that all states where the system reaches or exceeds this point are
        accurately included in the CBP calculation.
      </p>
    </section>
  );
}
