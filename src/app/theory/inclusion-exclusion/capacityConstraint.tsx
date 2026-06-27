"use client";

import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
const OVER_A: [number, number, number][] = [
  [3, 0, 2],
  [3, 1, 1],
  [3, 2, 0],
  [4, 0, 1],
  [4, 1, 0],
  [5, 0, 0],
];
const OVER_B: [number, number, number][] = [
  [0, 3, 2],
  [1, 3, 1],
  [2, 3, 0],
  [0, 4, 1],
  [1, 4, 0],
  [0, 5, 0],
];
const OVER_C: [number, number, number][] = [
  [0, 0, 5],
  [0, 1, 4],
  [0, 2, 3],
  [1, 0, 4],
  [1, 1, 3],
  [2, 0, 3],
];
const VALID_ARRS: [number, number, number][] = [
  [1, 2, 2],
  [2, 1, 2],
  [2, 2, 1],
];

function ArrangementChip({
  a,
  b,
  c,
  highlightIndex,
  variant,
}: {
  a: number;
  b: number;
  c: number;
  highlightIndex: number; // which position (0,1,2) is the offending one
  variant: "invalid" | "valid";
}) {
  const vals = [a, b, c];
  const chipBg =
    variant === "valid"
      ? "bg-emerald-50 border-emerald-300"
      : "bg-red-50 border-red-200";
  return (
    <span
      className={`inline-flex items-center gap-0.5 border rounded px-1.5 py-0.5 ${chipBg}`}
    >
      {vals.map((v, i) => {
        const isOffending = variant === "invalid" && i === highlightIndex;
        const box =
          variant === "valid"
            ? "bg-emerald-200 text-emerald-800"
            : isOffending
              ? "bg-red-200 text-red-800"
              : "bg-slate-100 text-slate-600";
        return (
          <span key={i} className="inline-flex items-center gap-0.5">
            {i > 0 && <span className="text-slate-300 text-xs">·</span>}
            <span
              className={`text-xs rounded px-1 font-mono font-semibold ${box}`}
            >
              {v}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function InclusionExclusion() {
  return (
    <section className="space-y-4">
      <div id="stars-and-bars-example" className="space-y-4 pt-2">
        <h2 className="text-xl font-semibold text-slate-700">
          Counting arrangements in subgroups
        </h2>

        <p className="text-slate-600 leading-relaxed text-sm">
          To determine the total number of possible arrangements of{" "}
          <InlineMath math="x" /> b.u. into <InlineMath math="k" /> labeled
          subgroups, where the order of units within each subgroup does not
          matter and subgroup capacities can vary between 0 and{" "}
          <InlineMath math="\infty" />, we can apply the{" "}
          <strong>Stars and Bars</strong> method from combinatorial theory.
        </p>

        <p className="text-slate-600 leading-relaxed text-sm">
          The Stars and Bars method provides a way to count the number of ways
          to distribute <InlineMath math="x" /> identical objects into{" "}
          <InlineMath math="k" /> distinct bins. The formula for this
          distribution is given by (see{" "}
          <Link
            href="/theory/probability-and-statistics#stars-and-bars"
            className="text-sky-600 hover:underline"
          >
            Stars and Bars
          </Link>
          ):
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="F(x,\,k,\,\infty,\,0) = \binom{x+k-1}{k-1}" />
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-sky-800">
            Parameter notation
          </p>
          <ul className="text-sm text-sky-900 space-y-1 leading-relaxed">
            <li>
              <InlineMath math="x" />: free (unoccupied) bandwidth units to
              distribute. If <InlineMath math="n" /> b.u. are busy and the total
              capacity is <InlineMath math="k \cdot C" />, then{" "}
              <InlineMath math="x = k \cdot C - n" />.
            </li>
            <li>
              <InlineMath math="k" />: number of separate resources (subgroups).
            </li>
            <li>
              <InlineMath math="C" /> or <InlineMath math="\infty" />
              : upper capacity limit per subgroup: <InlineMath math="C" /> when
              a finite limit applies, <InlineMath math="\infty" /> when
              unconstrained.
            </li>
            <li>
              <InlineMath math="0" />: lower limit per subgroup (each subgroup
              holds at least 0 b.u.).
            </li>
          </ul>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          This method assumes no restrictions on how many units each subgroup
          can hold, meaning each subgroup can receive anywhere from 0 to{" "}
          <InlineMath math="\infty" /> b.u. However, in real-world scenarios,
          resource distribution often comes with constraints, such as capacity
          limits, minimum requirements, or other restrictions. When there are no
          upper limits on subgroup capacities, the standard Stars and Bars
          approach applies directly.
        </p>

        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <p className="text-sm text-emerald-900 leading-relaxed">
            We need <InlineMath math="k - 1" /> | bars to separate{" "}
            <InlineMath math="x" /> ⭐ stars into subgroups.
          </p>
        </div>
        <p>
          For example, consider the case where <InlineMath math="x = 4" /> b.u.
          (⭐ stars) must be distributed into <InlineMath math="k = 2" />{" "}
          subgroups with unlimited capacity. Using the formula above, we find
          that there are:
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="F(4,\,2,\,\infty,\,0) = \binom{4+2-1}{2-1} = \binom{5}{1} = \frac{5!}{1!(5-1)!} = 5 \text{ ways}" />
        </div>

        {/* Figure A.1:5 ways to split 4 b.u. into 2 groups */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
            5 Possible arrangements of 4 b.u. into two groups of unlimited
            capacity (
            <InlineMath math="C = \infty" />)
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Way 1", left: 4, right: 0 },
              { label: "Way 2", left: 3, right: 1 },
              { label: "Way 3", left: 2, right: 2 },
              { label: "Way 4", left: 1, right: 3 },
              { label: "Way 5", left: 0, right: 4 },
            ].map(({ label, left, right }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="flex gap-2 items-end">
                  {[left, right].map((fill, gi) => (
                    <div key={gi} className="flex flex-col-reverse gap-0.5">
                      {Array.from({ length: 4 }).map((_, si) => (
                        <div
                          key={si}
                          className={`w-8 h-5 rounded-sm border ${
                            si < fill
                              ? "bg-slate-500 border-slate-600"
                              : "bg-slate-100 border-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center">
            Each column represents a subgroup. Filled cells = occupied b.u.
          </p>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          However, if real-world constraints impose upper limits on subgroup
          capacities, additional methods must be used to account for these
          restrictions.
        </p>
        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <div className="text-sm text-emerald-900 leading-relaxed">
            <p>
              If <InlineMath math="F(4,\,2,\,0,\,0)=0" />, we cannot allocate{" "}
              <InlineMath math="x" /> b.u. when the capacity of each subgroup is
              zero.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-600">
            Example: <InlineMath math="F(4,\,2,\,C,\,0)" />
          </p>
          <p className="text-slate-600 leading-relaxed text-sm">
            Distribute <InlineMath math="x = 5" /> b.u. across{" "}
            <InlineMath math="k = 3" /> subgroups, where each subgroup can hold
            at most <InlineMath math="C = 2" /> b.u.
          </p>

          <p className="text-slate-600 leading-relaxed text-sm">
            In such cases, we can use the Inclusion-Exclusion Principle to
            systematically subtract arrangements that violate capacity
            constraints. This principle allows us to count all unrestricted
            distributions first and then adjust for overcounting by excluding
            cases where one or more subgroups exceed their allowed capacity.
          </p>
          <h5 className="text-m font-semibold text-slate-700">
            Step 1: Calculate the total number of ways to disctribute{" "}
            <InlineMath math="x" /> b.u. into <InlineMath math="k" /> subgroups
            without the limitations in the capacity <InlineMath math=" C" />
          </h5>

          <p className="text-slate-600 leading-relaxed text-sm">
            If there were no capacity restrictions, we could apply the Stars and
            Bars theorem directly:
          </p>

          <div className="overflow-x-auto py-1">
            <BlockMath math="\binom{5+3-1}{3-1} = \binom{7}{2} = 21 \text{ ways}" />
          </div>

          <p className="text-slate-600 leading-relaxed text-sm">
            However, this count includes cases where one or more subgroups
            receive more than 2 b.u., which violates our constraint. To adjust
            for this, we use the Inclusion-Exclusion Principle to subtract the
            invalid cases.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 tracking-wider">
              Visual breakdown: each box shows [C₁ · C₂ · C₃] b.u.
            </p>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-600">
                Subgroup 1 exceeds C = 2 → 6 invalid arrangements:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OVER_A.map(([a, b, c], i) => (
                  <ArrangementChip
                    key={i}
                    a={a}
                    b={b}
                    c={c}
                    highlightIndex={0}
                    variant="invalid"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-600">
                Subgroup 2 exceeds C = 2 → 6 invalid arrangements:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OVER_B.map(([a, b, c], i) => (
                  <ArrangementChip
                    key={i}
                    a={a}
                    b={b}
                    c={c}
                    highlightIndex={1}
                    variant="invalid"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-600">
                Subgroup 3 exceeds C = 2 → 6 invalid arrangements:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OVER_C.map(([a, b, c], i) => (
                  <ArrangementChip
                    key={i}
                    a={a}
                    b={b}
                    c={c}
                    highlightIndex={2}
                    variant="invalid"
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-1.5">
              <p className="text-xs font-medium text-emerald-600">
                ✓ Valid arrangements (21 − 6 − 6 − 6 = 3):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VALID_ARRS.map(([a, b, c], i) => (
                  <ArrangementChip
                    key={i}
                    a={a}
                    b={b}
                    c={c}
                    highlightIndex={-1}
                    variant="valid"
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Red box = subgroup exceeds C = 2. No arrangement can violate two
              constraints at once (that would require ≥ 6 b.u., but x = 5).
            </p>
          </div>
          <h5 className="text-m font-semibold text-slate-700">
            Step 1: Calculate the total number of ways to disctribute{" "}
            <InlineMath math="x" /> b.u. into <InlineMath math="k" /> subgroups
            without the limitations in the capacity <InlineMath math=" C" />
          </h5>
          <p className="text-slate-600 leading-relaxed text-sm">
            In this step we need to exclude the overcounts of step 1 (i.e. we
            should take into account the limitation <InlineMath math=" C" />)
          </p>
          <h6 className="text-m font-semibold text-slate-600">
            a) Substract those cases where one subgroup exceeds{" "}
            <InlineMath math=" C" />
          </h6>

          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
              💡
            </span>
            <p className="text-sm text-emerald-900 leading-relaxed">
              If one group includes <InlineMath math="C + 1" /> b.u., then we
              need to distribute <InlineMath math="x - (C + 1)" /> b.u. into{" "}
              <InlineMath math="k" /> subgroups.
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed text-sm">
            The number of arrangements where a specific subgroup exceeds
            capacity is:
          </p>
          <div className="overflow-x-auto py-1">
            <BlockMath math="\binom{x-(C+1)+k-1}{k-1} = \binom{5-(2+1)+3-1}{3-1} = \binom{4}{2} = 6 \text{ ways}" />
          </div>

          <p className="text-slate-600 leading-relaxed text-sm">
            Since there are <InlineMath math="k = 3" /> subgroups and any of
            them can exceed the capacity of <InlineMath math="C = 2" />, we
            multiply the previous value by <InlineMath math="k" />
          </p>

          <p className="text-slate-600 leading-relaxed text-sm">
            So the number of overcounted arrangements, where one subgroup
            exceeds the capacity is:
          </p>
          <div className="overflow-x-auto py-1">
            <BlockMath math=" k \binom{x-(C+1)+k-1}{k-1} = 3 \binom{5-(2+1)+3-1}{3-1} = 3 \binom{4}{2}" />
          </div>
          <div className="overflow-x-auto py-1">
            <BlockMath math="3 \times 6 = 18 \text{ invalid ways}" />
          </div>
          <h6 className="text-m font-semibold text-slate-600">
            b) Substract those cases where two subgroup exceed{" "}
            <InlineMath math="C" />
          </h6>
          <p className="text-slate-600 leading-relaxed text-sm">
            The number of arrangements where two subgroups exceed the capacity{" "}
            <InlineMath math="C" />
            is:
          </p>
          <div className="overflow-x-auto py-1">
            <BlockMath math="\binom{x-2(C+1)+k-1}{k-1} " />
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Since there are <InlineMath math="\binom{k}{2}" /> ways to select
            two subgroups from the <InlineMath math="k" /> subgroups that exceed
            <InlineMath math="C" />, we multiply by{" "}
            <InlineMath math="\binom{k}{2}" />
          </p>
          <p className="text-slate-600 leading-relaxed text-sm">
            So the number of overcounted arrangements, where two subgroup exceed
            the capacity is:
          </p>
          <div className="overflow-x-auto py-1">
            <BlockMath math=" \binom{k}{2}\binom{x - 2(C+1) + k-1}{k-1}" />
          </div>

          <p className="text-slate-600 leading-relaxed text-sm">
            In our example the <InlineMath math="x - 2(c + 1)" /> is:
          </p>
          <div>
            <BlockMath math="x - 2(c + 1) = 5 - 2(2 + 1) = 5 - 6 = - 1" />
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Which is impossible!
          </p>
          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
              💡
            </span>
            <p className="text-sm text-emerald-900 leading-relaxed">
              So the final results is:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math=" 21 - 18 = 3 \text { ways}" />
            </div>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            Which are the following:
            {""} <InlineMath math="(2, 2, 2), (2,1,2), (1,2,2)" />
          </p>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-sky-800">
            This inclusion-exclusion process continues for all possible number
            of subgroups that can exceed <InlineMath math="C" />.
          </p>
          <p className="text-sm text-emerald-900 leading-relaxed">
            This number cannot exceed:
          </p>
          <div className="overflow-x-auto py-1">
            <BlockMath math="\left\lfloor \dfrac{x}{C+1} \right\rfloor" />
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            The term that describes all the previous steps is:
          </p>
          <div className="gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-sm text-emerald-900 leading-relaxed"></p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="(-1)^i\binom{k}{i}\binom{x + (k-1) - i(c+1)}{k - 1}" />
            </div>
          </div>

          <ul className="list-disc list-inside space-y-1 text-sm text-sky-900 leading-relaxed">
            <li>
              <InlineMath math="i" /> is the number of subgroups that exceed
              the capacity <InlineMath math="C" />.
            </li>
            <li>
              <InlineMath math="(-1)^i" /> alternates between subtracting and
              adding arrangements for each <InlineMath math="i > 0" />.
            </li>
            <li>
              When <InlineMath math="i = 0" />, the term recovers the
              unconstrained Stars and Bars count{" "}
              <InlineMath math="\binom{x+k-1}{k-1}" /> (step 1).
            </li>
          </ul>

          <p className="text-base font-semibold text-slate-700 leading-relaxed">
            The total number of valid distributions of{" "}
            <InlineMath math="x" /> free b.u. across{" "}
            <InlineMath math="k" /> separate resources is therefore:
          </p>

          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="overflow-x-auto flex-1">
              <BlockMath math="F(x,k,C,0) = \sum_{i=0}^{\left\lfloor \frac{x}{C+1} \right\rfloor} (-1)^i \binom{k}{i} \binom{x + (k-1) - i(C+1)}{k-1}" />
            </div>
          </div>
        </div>

        {/* Conditional transition probability */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-semibold text-slate-700">
            Conditional transition probability{" "}
            <InlineMath math="\sigma_i(n)" />
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm">
            Computing <InlineMath math="\sigma_i(n)" /> requires counting valid
            bandwidth allocations using <InlineMath math="F" />. It expresses
            the probability that, in occupancy state{" "}
            <InlineMath math="n" />, a call of class{" "}
            <InlineMath math="i" /> can be serviced.
          </p>

          <p className="text-slate-600 leading-relaxed text-sm">
            Start by finding the number of <strong>favourable</strong>{" "}
            allocations (the numerator):
          </p>

          <div className="overflow-x-auto py-1">
            <BlockMath math="F(k \cdot C - n,\; k,\; C,\; 0) \;-\; F(k \cdot C - n,\; k,\; C_i - 1,\; 0)" />
          </div>

          <p className="text-slate-600 leading-relaxed text-sm">
            Dividing by the total number of allocations gives:
          </p>

          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="overflow-x-auto flex-1">
              <BlockMath math="\sigma_i(n) = 1 - \frac{F(k \cdot C - n,\; k,\; C_i - 1,\; 0)}{F(k \cdot C - n,\; k,\; C,\; 0)}" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              What each term means
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>
                <InlineMath math="F(k \cdot C - n,\; k,\; C,\; 0)" />: the
                number of possible allocations of{" "}
                <InlineMath math="x = k \cdot C - n" /> free b.u. across{" "}
                <InlineMath math="k" /> subgroups (each limited to{" "}
                <InlineMath math="C" /> b.u.). This is the total count of
                valid states.
              </li>
              <li>
                <InlineMath math="F(k \cdot C - n,\; k,\; C_i - 1,\; 0)" />:{" "}
                the number of allocations where every subgroup holds at most{" "}
                <InlineMath math="C_i - 1" /> b.u.. These are the{" "}
                <strong>unfavourable</strong> allocations: states in which a
                class-<InlineMath math="i" /> call cannot be serviced because
                no subgroup has room for even one more b.u. of class{" "}
                <InlineMath math="i" />.
              </li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed">
              The numerator <InlineMath math="F(\cdots,C,0) - F(\cdots,C_i-1,0)" />{" "}
              therefore counts the <strong>favourable</strong> allocations,
              i.e. those in which at least one subgroup can accommodate a
              class-<InlineMath math="i" /> call. Dividing by the total gives
              the probability <InlineMath math="\sigma_i(n)" />.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
