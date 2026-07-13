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

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Where else this shows up
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Taking a small step towards a new value instead of jumping straight to
          it is a common trick, used all over computing under different names:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 leading-relaxed">
          <li>
            <strong>Numerical methods</strong> call it <em>relaxation</em>, used
            to solve big systems of equations, like simulating heat flow or the
            stress on a bridge.
          </li>
          <li>
            <strong>Machine learning</strong> calls it a <em>soft update</em>,
            used so an AI model updates gradually during training instead of in
            jarring jumps.
          </li>
          <li>
            <strong>Networking</strong> calls it <em>exponential smoothing</em>,
            used by TCP to estimate network delay without one slow moment
            throwing the whole estimate off.
          </li>
          <li>
            <strong>Games and animation</strong> call it <em>lerping</em>, used
            to make a camera glide smoothly after a moving character instead of
            snapping straight to it.
          </li>
        </ul>
      </div>
    </section>
  );
}
