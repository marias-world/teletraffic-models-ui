import { BlockMath, InlineMath } from "react-katex";
import NetworkDiagram from "./NetworkDiagram";

const REP1_Q = [
  "q(0) = 1",
  "q(1) = 0",
  "q(2) = 1",
  "q(3) = 0",
  "q(4) = 0.5",
  "q(5) = 0",
];

const REP2_R1_Q = [
  "q(0) = 1",
  "q(1) = 1",
  "q(2) = 0.5",
  "q(3) = 0.1666",
  "q(4) = 0.041664",
];

const REP2_R2_Q = [
  "q(0) = 1",
  "q(1) = 1",
  "q(2) = 1.5",
  "q(3) = 1.16666",
  "q(4) = 1.041666",
  "q(5) = 0.675",
];

export default function WorkedExample() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Step-by-Step Example
      </h2>

      <p className="text-slate-600 leading-relaxed">
        Consider a small network with two resources and two service classes:
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <NetworkDiagram
          links={[
            { id: 1, capacity: 4 },
            { id: 2, capacity: 5 },
          ]}
          routes={[
            { label: "k1", load: 1, demands: { 1: 1, 2: 1 } },
            { label: "k2", load: 1, demands: { 2: 2 } },
          ]}
        />
      </div>

      <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed text-sm">
        <li>
          Resource 1 has capacity <InlineMath math="C_1 = 4" /> b.u. and
          resource 2 has capacity <InlineMath math="C_2 = 5" /> b.u.
        </li>
        <li>
          Service class 1 traverses both resources, needing{" "}
          <InlineMath math="b_{11} = 1" /> b.u. on resource 1 and{" "}
          <InlineMath math="b_{21} = 1" /> b.u. on resource 2.
        </li>
        <li>
          Service class 2 traverses only resource 2, needing{" "}
          <InlineMath math="b_{22} = 2" /> b.u.
        </li>
        <li>
          Both classes have an offered load of{" "}
          <InlineMath math="\alpha_1 = \alpha_2 = 1" /> erl.
        </li>
      </ul>

      {/* Per-resource blocking */}
      <h3 className="text-base font-semibold text-slate-700 pt-2">
        1. Blocking on each resource
      </h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        Only class 1 uses resource 1, while both classes share resource 2. Each
        per-resource CBP follows the formula above:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_{11} = [\,C_1;\, \alpha_x,\ x \in I_1\,] = \sum_{j=C_1-b_{11}+1}^{C_1} G^{-1} q(j)" />
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_{21} = [\,C_2;\, \alpha_x,\ x \in I_2\,] = \sum_{j=C_2-b_{21}+1}^{C_2} G^{-1} q(j)" />
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_{22} = [\,C_2;\, \alpha_x,\ x \in I_2\,] = \sum_{j=C_2-b_{22}+1}^{C_2} G^{-1} q(j)" />
      </div>

      {/* Reduced load */}
      <h3 className="text-base font-semibold text-slate-700 pt-2">
        2. Reduced traffic load
      </h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        On each resource, the offered load of a class is reduced by the blocking
        it meets on the other resources of its route. The general product form
        is:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\alpha_x = \alpha_x \cdot \prod_{i \in R_x - \{l\}} (1 - V_{ix})" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        The reduced traffic load of service class 1 on the first resource is (
        <InlineMath math="x = 1" />, <InlineMath math="l = 1" />
        ):
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\alpha_1 = \alpha_1 \cdot \prod_{i \in R_1 - \{1\}} (1 - V_{i1}) = \alpha_1 (1 - V_{21})" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        The reduced traffic load of service class 1 on the second resource is (
        <InlineMath math="x = 1" />, <InlineMath math="l = 2" />
        ):
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\alpha_1 = \alpha_1 \cdot \prod_{i \in R_1 - \{2\}} (1 - V_{i1}) = \alpha_1 (1 - V_{11})" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        Lastly, the reduced traffic load of service class 2 on the second
        resource is (<InlineMath math="x = 2" />, <InlineMath math="l = 2" />
        ), and since calls of class 2 traverse only resource 2, the product is
        empty and the load is unreduced:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\alpha_2 = \alpha_2 \cdot \prod_{i \in R_2 - \{2\}} (1 - V_{i2}) = \alpha_2" />
      </div>

      {/* Fixed point */}
      <h3 className="text-base font-semibold text-slate-700 pt-2">
        3. The fixed-point system
      </h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        Substituting the reduced loads gives three coupled equations for the
        improved CBPs <InlineMath math="V_{11}" />, <InlineMath math="V_{21}" />{" "}
        and <InlineMath math="V_{22}" />:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="V_{11} = B_{11} = \bigl[\,C_1;\, \alpha_1 \cdot (1-V_{21})\,\bigr]" />
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="V_{21} = B_{21} = \bigl[\,C_2;\, \alpha_1 \cdot (1-V_{11}),\ \alpha_2\,\bigr]" />
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="V_{22} = B_{22} = \bigl[\,C_2;\, \alpha_1 \cdot (1-V_{11}),\ \alpha_2\,\bigr]" />
      </div>

      {/* Iteration */}
      <h3 className="text-base font-semibold text-slate-700 pt-2">
        4. Iterating to a solution
      </h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        We start by assuming the CBP is 100% for both classes, so{" "}
        <InlineMath math="V_{11} = V_{21} = V_{22} = 1" />, and stop once the
        values change by less than a threshold of 0.000001.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Repetition 1 (using <InlineMath math="V_{11} = V_{21} = V_{22} = 1" />
          )
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          With <InlineMath math="V_{21} = 1" />, the reduced load on resource 1
          is <InlineMath math="\alpha_1(1 - V_{21}) = 0" />, so resource 1 has
          no traffic:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = B_{11}[\,C_1;\, 0\,] = 0" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          The reduced load of class 1 on resource 2 is also{" "}
          <InlineMath math="\alpha_1(1 - V_{11}) = 0" />, so resource 2 only
          carries class 2 in this step. We compute its occupancy distribution{" "}
          <InlineMath math="q(j)" /> with the Kaufman-Roberts recursion (
          <InlineMath math="C = 5" /> b.u., <InlineMath math="\alpha_1 = 0" />{" "}
          in this step, <InlineMath math="\alpha_2 = 1" />,{" "}
          <InlineMath math="b_{21} = 1" />, <InlineMath math="b_{22} = 2" />
          ):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-slate-600">
          {REP1_Q.map((q) => (
            <span key={q}>
              <InlineMath math={q} />
            </span>
          ))}
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          So <InlineMath math="G = \sum_j q(j) = 2.5" />. Since{" "}
          <InlineMath math="b_{21} = 1" />, <InlineMath math="V_{21}" /> sums
          from <InlineMath math="j = 5" /> only, while{" "}
          <InlineMath math="V_{22}" /> sums from <InlineMath math="j = 4" />{" "}
          (since <InlineMath math="b_{22} = 2" />
          ):
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{21} = B_{21}[\,C_2;\, 0,\ \alpha_2\,] = \frac{q(5)}{G} = \frac{0}{2.5} = 0" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{22} = B_{22}[\,C_2;\, 0,\ \alpha_2\,] = \sum_{j=C_2-b_{22}+1}^{C_2} G^{-1} q(j) = \frac{q(4) + q(5)}{G} = \frac{0.5}{2.5} = 0.2" />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Repetition 2 (values used in this step{" "}
          <InlineMath math="V_{11} = 0,\ V_{21} = 0,\ V_{22} = 0.2" />)
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = B_{11}[\,C_1;\, \alpha_1\,]" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          To calculate <InlineMath math="V_{11}" /> we consider a system of{" "}
          <InlineMath math="C = 4" /> b.u., first resource, and{" "}
          <InlineMath math="K = 1" /> service class with{" "}
          <InlineMath math="\alpha_1 = 1" />, <InlineMath math="b_{11} = 1" />:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-slate-600">
          {REP2_R1_Q.map((q) => (
            <span key={q}>
              <InlineMath math={q} />
            </span>
          ))}
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="G = \sum_{j=0}^{4} q(j) = 2.708333" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = \sum_{j=C_1-b_{11}+1}^{C_1} G^{-1} q(j) = \frac{q(4)}{G} = \frac{0.041665}{2.708333}" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = 0.0153846" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm pt-2">
          Similarly,{" "}
          <InlineMath math="V_{21} = B_{21}[\,C_2;\, \alpha_1,\ \alpha_2\,]" />{" "}
          and{" "}
          <InlineMath math="V_{22} = B_{22}[\,C_2;\, \alpha_1,\ \alpha_2\,]" />.
        </p>
        <p className="text-slate-600 leading-relaxed text-sm pt-2">
          To calculate <InlineMath math="V_{21}" /> and{" "}
          <InlineMath math="V_{22}" /> we consider a system of{" "}
          <InlineMath math="C = 5" /> b.u., second resource, and{" "}
          <InlineMath math="K = 2" /> service classes with{" "}
          <InlineMath math="\alpha_1 = 1" />, <InlineMath math="\alpha_2 = 1" />
          , <InlineMath math="b_{21} = 1" /> and{" "}
          <InlineMath math="b_{22} = 2" />:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-slate-600">
          {REP2_R2_Q.map((q) => (
            <span key={q}>
              <InlineMath math={q} />
            </span>
          ))}
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="G = \sum_{j=0}^{5} q(j) = 6.38333" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Therefore we have:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{21} = \sum_{j=C_2-b_{21}+1}^{C_2} G^{-1} q(j) = \frac{q(5)}{G} = \frac{0.675}{6.38333}" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{21} = 0.1057441" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          And for <InlineMath math="V_{22}" /> we have:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{22} = \sum_{j=C_2-b_{22}+1}^{C_2} G^{-1} q(j) = \frac{q(4) + q(5)}{G} = 0.2689295" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{22} = 0.2689295" />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Repetition 3 (values used in this step{" "}
          <InlineMath math="V_{11} = 0.0153846,\ V_{21} = 0.1057441,\ V_{22} = 0.2689295" />)
        </p>

        <p className="text-slate-600 leading-relaxed text-sm">
          The reduced load of class 1 on resource 1 is now{" "}
          <InlineMath math="\alpha_1(1-V_{21}) = 1 \times (1 - 0.1057441) = 0.8942559" />:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = B_{11}\bigl[C_1;\, \alpha_1(1 - 0.1057441)\bigr] = \sum_{j=C_1-b_{11}+1}^{C_1} G^{-1} q(j) = \frac{q(4)}{G} = \frac{0.026646}{2.439937}" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = 0.108208" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          The reduced load of class 1 on resource 2 is{" "}
          <InlineMath math="\alpha_1(1-V_{11}) = 1 \times (1 - 0.0153846) = 0.9846154" />. Similarly:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{21} = B_{21}\bigl[C_2;\, \alpha_1(1-0.0153846),\ \alpha_2\bigr] = \sum_{j=C_2-b_{21}+1}^{C_2} G^{-1} q(j) = \frac{q(5)}{G} = \frac{0.65911}{6.296063}" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{21} = 0.1046863" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{22} = B_{22}\bigl[C_2;\, \alpha_1(1-0.0153846),\ \alpha_2\bigr] = \sum_{j=C_2-b_{22}+1}^{C_2} G^{-1} q(j) = \frac{q(4)+q(5)}{G} = \frac{1.023895 + 0.65911}{6.296063}" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{22} = 0.2677767" />
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        Following a similar manner we carry on until the values change by less
        than the threshold of 0.000001. The converged values are:
      </p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-800">Converged CBPs</p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{11} = 0.109495" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{21} = 0.1049917" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="V_{22} = 0.2677767" />
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        To calculate the CBP for each service class over its entire route we use:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_k \approx 1 - \prod_{l \in R_k}(1 - V_{lk}), \quad k = 1, \dots, K" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        For service class 1 the CBP is:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_1 \approx 1 - (1 - V_{11})(1 - V_{21}) = 1 - (1 - 0.109495)(1 - 0.1049917)" />
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_1 \approx 0.1147916" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        For service class 2 the CBP is:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_2 \approx 1 - (1 - V_{22}) = V_{22} = 0.2677767" />
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="B_2 \approx 0.2677767" />
      </div>
    </section>
  );
}
