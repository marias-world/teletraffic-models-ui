import { BlockMath, InlineMath } from "react-katex";

export default function ConvergenceNote() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        A Known Convergence Issue
      </h2>

      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-sm text-amber-900 leading-relaxed">
          Every link&apos;s blocking probability <InlineMath math="V_{lk}" />{" "}
          depends on every other link&apos;s, so there&apos;s no single-step
          formula to solve it. Instead, we guess, recompute, and feed each
          answer back in as the next guess, hoping the numbers settle down. This
          is a well-known weak spot of the reduced-load approximation model:
          sometimes the numbers never settle. They bounce back and forth between
          two values forever, and the calculation either loops endlessly or
          gives up without an answer.
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed">
        There&apos;s a simple fix: <strong>damping</strong>. Instead of jumping
        straight to each newly computed value, only move partway towards it.
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="V^{\text{new}}_{lk} = V^{\text{old}}_{lk} + \delta \cdot \bigl(V^{\text{computed}}_{lk} - V^{\text{old}}_{lk}\bigr)" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        <InlineMath math="\delta" /> (delta) is just how big a step to take,
        somewhere between 0 and 1. At <InlineMath math="\delta = 1" />,
        it&apos;s the original behaviour: jump straight to the new value. At{" "}
        <InlineMath math="\delta = 0.5" />, it only takes half a step each time,
        small moves that are much less likely to overshoot and bounce back. We
        can use the damping method programmatically when convergence issues are
        observed.
      </p>
    </section>
  );
}
