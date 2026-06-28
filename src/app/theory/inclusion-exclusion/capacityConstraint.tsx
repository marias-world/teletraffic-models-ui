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
              <InlineMath math="i" /> is the number of subgroups that exceed the
              capacity <InlineMath math="C" />.
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
            The total number of valid distributions of <InlineMath math="x" />{" "}
            free b.u. across <InlineMath math="k" /> separate resources is
            therefore:
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
            Conditional transition probability <InlineMath math="\sigma_i(n)" />
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm">
            Computing <InlineMath math="\sigma_i(n)" /> requires counting valid
            bandwidth allocations using <InlineMath math="F" />. It expresses
            the probability that, in occupancy state <InlineMath math="n" />, a
            call of class <InlineMath math="i" /> can be serviced.
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
                <InlineMath math="C" /> b.u.). This is the total count of valid
                states.
              </li>
              <li>
                <InlineMath math="F(k \cdot C - n,\; k,\; C_i - 1,\; 0)" />: the
                number of allocations where every subgroup holds at most{" "}
                <InlineMath math="C_i - 1" /> b.u.. These are the{" "}
                <strong>unfavourable</strong> allocations: states in which a
                class-
                <InlineMath math="i" /> call cannot be serviced because no
                subgroup has room for even one more b.u. of class{" "}
                <InlineMath math="i" />.
              </li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed">
              The numerator{" "}
              <InlineMath math="F(\cdots,C,0) - F(\cdots,C_i-1,0)" /> therefore
              counts the <strong>favourable</strong> allocations, i.e. those in
              which at least one subgroup can accommodate a class-
              <InlineMath math="i" /> call. Dividing by the total gives the
              probability <InlineMath math="\sigma_i(n)" />.
            </p>
          </div>
        </div>

        {/* ── Worked example ─────────────────────────────────────────── */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Step-by-step example: Determining{" "}
            <InlineMath math="F(12,\,3,\,5,\,0)" />
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm">
            Find the number of valid arrangements of{" "}
            <InlineMath math="x = 12" /> free b.u. across{" "}
            <InlineMath math="\ell = 3" /> subgroups each with capacity{" "}
            <InlineMath math="C = 5" /> b.u.
          </p>

          {/* Step 1 */}
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 space-y-2">
            <p className="text-sm font-semibold text-sky-800">
              Step 1: Unconstrained count (Stars and Bars)
            </p>
            <p className="text-sm text-sky-900 leading-relaxed">
              Ignore the capacity limit first. Any of the 3 subgroups can hold
              any amount:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="F(12,\,3,\,\infty,\,0) = \binom{12+3-1}{3-1} = \binom{14}{2} = 91 \text{ ways}" />
            </div>
          </div>

          {/* Step 2a */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-800">
              Step 2a: Subtract: one subgroup exceeds{" "}
              <InlineMath math="C = 5" />
            </p>
            <p className="text-sm text-red-900 leading-relaxed">
              If one resource includes at least 6 b.u., we need to distribute
              the remaining 12 − 6 = 6 b.u. into 3 resources.
            </p>

            {/* Substitution visualisation */}
            <div className="rounded-lg border border-red-200 bg-white p-4 space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Example arrangement: A=8, B=3, C=1 (total=12, A exceeds 5)
              </p>

              <div className="flex flex-wrap items-end justify-center gap-6">
                {/* Before */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-slate-600">
                    Before substitution
                  </p>
                  <div className="flex gap-3 items-end">
                    {[
                      { label: "A = 8", fill: 8, committed: 6 },
                      { label: "B = 3", fill: 3, committed: 0 },
                      { label: "C = 1", fill: 1, committed: 0 },
                    ].map(({ label, fill, committed }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="flex flex-col-reverse gap-0.5">
                          {Array.from({ length: 8 }).map((_, si) => {
                            const overCap = si >= 5;
                            const isFilled = si < fill;
                            const isCommitted = isFilled && si < committed;
                            return (
                              <div
                                key={si}
                                className={[
                                  "w-8 h-4 rounded-sm border",
                                  isCommitted
                                    ? "bg-orange-400 border-orange-500"
                                    : isFilled
                                      ? "bg-sky-400 border-sky-500"
                                      : overCap
                                        ? "bg-rose-50 border-rose-200"
                                        : "bg-slate-100 border-slate-300",
                                  si === 5
                                    ? "border-t-2 border-t-rose-500"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />{" "}
                      pre-assigned 6
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />{" "}
                      A extra
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-rose-50 border border-rose-200 inline-block" />{" "}
                      above C = 5 limit
                    </span>
                  </div>
                </div>

                <div className="text-2xl text-slate-400 pb-8">→</div>

                {/* After */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-slate-600">
                    After: pre-assign 6 to A, spread the rest freely
                  </p>
                  <div className="flex gap-3 items-end">
                    {[
                      { label: "A extra = 2", fill: 2 },
                      { label: "B = 3", fill: 3 },
                      { label: "C = 1", fill: 1 },
                    ].map(({ label, fill }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="flex flex-col-reverse gap-0.5">
                          {Array.from({ length: 6 }).map((_, si) => (
                            <div
                              key={si}
                              className={`w-8 h-4 rounded-sm border ${
                                si < fill
                                  ? "bg-sky-400 border-sky-500"
                                  : "bg-slate-100 border-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    2 + 3 + 1 = 6 ✓
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Subgroup A is still present as its excess above 6. All 3
                variables are now unconstrained (≥ 0), so Stars and Bars applies
                across all 3, not just the remaining 2.
              </p>
            </div>

            <p className="text-sm text-red-900 leading-relaxed">
              Distributing 6 b.u. across 3 resources gives{" "}
              <strong>28 ways</strong>:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="\binom{x - (C+1) + l-1}{l-1} = \binom{6+3-1}{3-1} = \binom{8}{2} = 28 \text{ ways}" />
            </div>
            <p className="text-sm text-red-900 leading-relaxed">
              Any of the <InlineMath math="\ell = 3" /> subgroups could be the
              offending one, so multiply by 3:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="3 \times 28 = 84 \text{ overcounted arrangements}" />
            </div>
          </div>

          {/* Step 2b */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800">
              Step 2b: Add back: two subgroups exceed{" "}
              <InlineMath math="C = 5" />
            </p>
            <p className="text-sm text-amber-900 leading-relaxed">
              In Step 2a we subtracted every arrangement where A ≥ 6, every
              arrangement where B ≥ 6, and every arrangement where C ≥ 6. But an
              arrangement where <em>both</em> A ≥ 6 and B ≥ 6 got subtracted{" "}
              <strong>twice</strong>: once in the "A over" group and once in the
              "B over" group. We need to add those back once.
            </p>

            {/* Visual: the 3 double-counted arrangements */}
            <div className="rounded-lg border border-amber-200 bg-white p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                The 3 arrangements that were subtracted twice
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {(
                  [
                    { arr: [6, 6, 0], label: "A and B both ≥ 6" },
                    { arr: [6, 0, 6], label: "A and C both ≥ 6" },
                    { arr: [0, 6, 6], label: "B and C both ≥ 6" },
                  ] as { arr: number[]; label: string }[]
                ).map(({ arr, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="flex gap-1 items-end">
                      {arr.map((fill, gi) => (
                        <div key={gi} className="flex flex-col-reverse gap-0.5">
                          {Array.from({ length: 8 }).map((_, si) => {
                            const overCap = si >= 5;
                            const isFilled = si < fill;
                            return (
                              <div
                                key={si}
                                className={[
                                  "w-6 h-3 rounded-sm border",
                                  isFilled
                                    ? "bg-orange-400 border-orange-500"
                                    : overCap
                                      ? "bg-rose-50 border-rose-200"
                                      : "bg-slate-100 border-slate-300",
                                  si === 5
                                    ? "border-t-2 border-t-rose-500"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">
                      ({arr.join(", ")})
                    </p>
                    <p className="text-[10px] text-amber-700 text-center">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center">
                Each was subtracted twice in Step 2a, so we add it back once.
              </p>
            </div>

            <p className="text-sm text-amber-900 leading-relaxed">
              If two resources include at least 6 b.u., we need to distribute 12
              − 2(C+1) = 12 − 12 = 0 b.u. into 3 resources, using the same
              formula as above:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="\binom{0+3-1}{3-1} = \binom{2}{2} = 1 \text{ way per pair}" />
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">
              Since there are{" "}
              <InlineMath math="\binom{\ell}{2} = \binom{3}{2} = 3" /> ways to
              select two resources from <InlineMath math="\ell = 3" /> that
              exceed <InlineMath math="C = 5" />, we multiply the previous value
              by 3. Therefore the number of overcounted arrangements where two
              resources exceed the capacity <InlineMath math="C = 5" /> is:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="3 \times 1 = 3" />
            </div>
          </div>

          {/* Step 2c */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-600">
              Step 2c: Three subgroups exceed <InlineMath math="C = 5" />:
              impossible
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              That would require at least <InlineMath math="3 \times 6 = 18" />{" "}
              b.u., but <InlineMath math="x = 12" />, so{" "}
              <InlineMath math="12 - 18 = -6 < 0" />. No such arrangement
              exists. The process stops here.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              This is expected: the number of resources that can exceed{" "}
              <InlineMath math="C = 5" /> cannot be larger than{" "}
              <InlineMath math="\left\lfloor \dfrac{x}{C+1} \right\rfloor = \left\lfloor \dfrac{12}{6} \right\rfloor = 2" />
              .
            </p>
          </div>

          {/* Result */}
          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="overflow-x-auto flex-1">
              <BlockMath math="F(12,\,3,\,5,\,0) = 91 - 84 + 3 = \mathbf{10} \text{ valid arrangements}" />
            </div>
          </div>

          {/* Verification with the general formula */}
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-violet-800">
              Verification using the general formula
            </p>
            <p className="text-sm text-violet-900 leading-relaxed">
              The steps above are exactly what the general formula computes.
              With <InlineMath math="x=12" />, <InlineMath math="k=3" />,{" "}
              <InlineMath math="C=5" /> and{" "}
              <InlineMath math="\lfloor 12/6 \rfloor = 2" />:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="F(x,k,C,0) = \sum_{i=0}^{\left\lfloor \frac{x}{C+1} \right\rfloor} (-1)^i \binom{k}{i} \binom{x+(k-1)-i(C+1)}{k-1}" />
            </div>
            <div className="overflow-x-auto">
              <table className="text-xs text-slate-700 border-collapse w-full">
                <thead>
                  <tr className="bg-violet-100">
                    <th className="border border-violet-200 px-2 py-1 text-left">
                      <InlineMath math="i" />
                    </th>
                    <th className="border border-violet-200 px-2 py-1 text-left">
                      <InlineMath math="(-1)^i" />
                    </th>
                    <th className="border border-violet-200 px-2 py-1 text-left">
                      <InlineMath math="\binom{3}{i}" />
                    </th>
                    <th className="border border-violet-200 px-2 py-1 text-left">
                      <InlineMath math="\binom{14-6i}{2}" />
                    </th>
                    <th className="border border-violet-200 px-2 py-1 text-left">
                      Term
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["0", "+1", "1", "C(14,2) = 91", "+91"],
                    ["1", "−1", "3", "C(8,2) = 28", "−84"],
                    ["2", "+1", "3", "C(2,2) = 1", "+3"],
                  ].map(([i, sign, k, binom, term]) => (
                    <tr key={i} className="even:bg-violet-50/50">
                      <td className="border border-violet-200 px-2 py-1 font-mono">
                        {i}
                      </td>
                      <td className="border border-violet-200 px-2 py-1 font-mono">
                        {sign}
                      </td>
                      <td className="border border-violet-200 px-2 py-1 font-mono">
                        {k}
                      </td>
                      <td className="border border-violet-200 px-2 py-1 font-mono">
                        {binom}
                      </td>
                      <td className="border border-violet-200 px-2 py-1 font-mono font-semibold">
                        {term}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto py-1">
              <BlockMath math="F(12,3,5,0) = 91 - 84 + 3 = \mathbf{10} \checkmark" />
            </div>
          </div>

          {/* Visualisation of the 10 arrangements */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              All 10 valid arrangements of 12 b.u. across 3 subgroups (C = 5)
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {(
                [
                  [5, 5, 2],
                  [5, 2, 5],
                  [2, 5, 5],
                  [5, 4, 3],
                  [5, 3, 4],
                  [4, 5, 3],
                  [3, 5, 4],
                  [4, 3, 5],
                  [3, 4, 5],
                  [4, 4, 4],
                ] as [number, number, number][]
              ).map((arr, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="flex gap-1 items-end">
                    {arr.map((fill, gi) => (
                      <div key={gi} className="flex flex-col-reverse gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div
                            key={si}
                            className={`w-6 h-4 rounded-sm border ${
                              si < fill
                                ? "bg-sky-400 border-sky-500"
                                : "bg-slate-100 border-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ({arr.join(",")})
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">
              Each column = one subgroup (capacity 5).
            </p>
          </div>

          {/* Connection to sigma */}
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-violet-800">
              How this connects to <InlineMath math="\sigma_k(n)" /> in the{" "}
              <Link
                href="/limited-availability-group"
                className="text-violet-700 underline hover:text-violet-900"
              >
                LAG model
              </Link>
            </p>
            <p className="text-sm text-violet-900 leading-relaxed">
              In a system with <InlineMath math="\ell = 3" />,{" "}
              <InlineMath math="C = 5" /> (total capacity{" "}
              <InlineMath math="V = 15" />
              ), these 10 arrangements are exactly the denominator of{" "}
              <InlineMath math="\sigma_k(n)" /> at state{" "}
              <InlineMath math="n = 3" />, since{" "}
              <InlineMath math="x = \ell C - n = 15 - 3 = 12" />:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="\sigma_k(3) = 1 - \frac{F(12,\;3,\;b_k-1,\;0)}{F(12,\;3,\;5,\;0)} = 1 - \frac{F(12,\;3,\;b_k-1,\;0)}{10}" />
            </div>
            <p className="text-sm text-violet-900 leading-relaxed">
              For a class requiring <InlineMath math="b_k = 5" /> b.u. (so{" "}
              <InlineMath math="b_k - 1 = 4" />
              ), unfavourable arrangements are those where every subgroup holds
              ≤ 4 free b.u. Only <strong>(4, 4, 4)</strong> qualifies, so{" "}
              <InlineMath math="F(12,3,4,0) = 1" />:
            </p>
            <div className="overflow-x-auto py-1">
              <BlockMath math="\sigma_k(3) = 1 - \frac{1}{10} = \frac{9}{10} = 0.9" />
            </div>
            <p className="text-xs text-violet-700 leading-relaxed">
              9 out of 10 system states have at least one subgroup with 5 free
              b.u., so a class-5 call can be placed with probability 0.9.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
