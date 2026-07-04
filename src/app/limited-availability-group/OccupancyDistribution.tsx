import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";

export default function OccupancyDistribution() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Occupancy Distribution
      </h2>
      <p className="text-slate-600 leading-relaxed">
        As in the Kaufman-Roberts model, let <InlineMath math="q(j)" /> be the
        unnormalised probability that the system is in state{" "}
        <InlineMath math="j" /> (i.e. <InlineMath math="j" /> bandwidth units
        are occupied across all subgroups). For a system with{" "}
        <InlineMath math="K" /> service-classes, where each class{" "}
        <InlineMath math="k" /> has offered load <InlineMath math="a_k" /> and
        bandwidth requirement <InlineMath math="b_k" />, the occupancy
        distribution satisfies:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath
          math="q(j) =
          \begin{cases}
            1, & j = 0 \\[4pt]
            \dfrac{1}{j} \displaystyle\sum_{k=1}^{K} a_k \cdot b_k \cdot \sigma_k(j-b_k) \cdot q(j-b_k), & j = 1, 2, \dots, \ell \cdot C \\[8pt]
            0, & \text{otherwise}
          \end{cases}"
        />
      </div>

      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
          📖
        </span>
        <div className="space-y-2">
          <p className="text-sm text-violet-900 leading-relaxed">
            The term <InlineMath math="\sigma_k(j-b_k)" /> is the factor that
            distinguishes the LAG model from Kaufman-Roberts: it accounts for
            the existence of the <InlineMath math="\ell" /> identical
            subgroups, capturing how a class-
            <InlineMath math="k" /> request can be placed into one of them
            when the system is in state <InlineMath math="j-b_k" />.
          </p>
          <p className="text-sm text-violet-900 leading-relaxed">
            Computing <InlineMath math="\sigma_k(j)" /> requires counting
            valid bandwidth arrangements across subgroups with capacity
            constraints: a combinatorial problem solved with the{" "}
            <strong>Stars and Bars</strong> method combined with the{" "}
            <Link
              href="/theory/inclusion-exclusion#stars-and-bars-example"
              className="text-violet-700 font-medium hover:underline"
            >
              Inclusion-Exclusion Principle
            </Link>
            .{" "}
            <Link
              href="/theory/conditional-transition-probability"
              className="text-violet-700 font-medium hover:underline"
            >
              <strong>See full explanation and step-by-step example.</strong>
            </Link>
          </p>
        </div>
      </div>

      <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
          💡
        </span>
        <p className="text-sm text-emerald-900 leading-relaxed">
          When <InlineMath math="\ell = 1" />, there is only one subgroup, so{" "}
          <InlineMath math="\sigma_k(j-b_k) = 1" /> for every reachable state,
          and the recursion above reduces to the familiar
          <Link
            href="/kaufman-roberts"
            className="text-violet-700 font-medium hover:underline"
          >
            <strong> Kaufman-Roberts formula</strong>
          </Link>
        </p>
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="q(j) = \frac{1}{j} \sum_{k=1}^{K} a_k \cdot b_k \cdot q(j-b_k), \qquad j = 1, 2, \dots, C" />
      </div>
    </section>
  );
}
