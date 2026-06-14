"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function InclusionExclusion() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Inclusion-Exclusion Principle
      </h2>
      <p className="text-slate-600 leading-relaxed">
        The inclusion-exclusion principle is a way to count how many things are
        in &quot;A or B&quot; (or &quot;A or B or C&quot;, ...) without
        double-counting the things that belong to more than one group.
      </p>
      {/* Two groups */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌 Example: apples or bananas
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Knowing the <InlineMath math="P(A)" /> probability that a person likes
          🍎 apples and the <InlineMath math="P(B)" /> probability that they
          like 🍌 bananas, we want to calculate the probability that they like
          apples or bananas (at least one of the two):
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B) = \,?" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          These two events can happen together, so they are{" "}
          <strong>not incompatible</strong>: a person could like apples but not
          bananas, bananas but not apples, or both. We also assume they are{" "}
          <strong>independent</strong>: liking apples does not make a person
          more or less likely to like bananas. Graphically, we want to calculate
          the area outlined in bold below, the region covered by{" "}
          <InlineMath math="A" /> or <InlineMath math="B" /> (or both):
        </p>

        <svg viewBox="0 0 320 180" className="w-full max-w-xs mx-auto">
          <defs>
            <clipPath id="ie2-union-outer">
              <circle cx="120" cy="90" r="79" />
              <circle cx="200" cy="90" r="79" />
            </clipPath>
            <clipPath id="ie2-union-inner">
              <circle cx="120" cy="90" r="75" />
              <circle cx="200" cy="90" r="75" />
            </clipPath>
          </defs>
          {/* Bold outline tracing the union A ∪ B */}
          <rect
            x="0"
            y="0"
            width="320"
            height="180"
            className="fill-black-500"
            clipPath="url(#ie2-union-outer)"
          />
          <rect
            x="0"
            y="0"
            width="320"
            height="180"
            className="fill-slate-50"
            clipPath="url(#ie2-union-inner)"
          />
          <circle
            cx="120"
            cy="90"
            r="75"
            className="fill-rose-300 mix-blend-multiply"
          />
          <circle
            cx="200"
            cy="90"
            r="75"
            className="fill-amber-300 mix-blend-multiply"
          />
          <text
            x="90"
            y="30"
            textAnchor="middle"
            className="fill-rose-700 text-xs font-semibold"
          >
            🍎 apples
          </text>
          <text
            x="230"
            y="30"
            textAnchor="middle"
            className="fill-amber-700 text-xs font-semibold"
          >
            🍌 bananas
          </text>
          <text
            x="85"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            0.3
          </text>
          <text
            x="160"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            0.2
          </text>
          <text
            x="235"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            0.2
          </text>
        </svg>

        <p className="text-slate-600 leading-relaxed text-sm">
          Say <InlineMath math="P(A) = 0.5" /> and{" "}
          <InlineMath math="P(B) = 0.4" />. If we just add{" "}
          <InlineMath math="0.5 + 0.4 = 0.9" />, the 0.2 probability in the
          middle (people who like both fruits) gets counted{" "}
          <strong>twice</strong>: once as part of <InlineMath math="P(A)" /> and
          once as part of <InlineMath math="P(B)" />. To fix this, we subtract
          the overlap once:
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B) = P(A) + P(B) - P(A \cap B) = 0.5 + 0.4 - 0.2 = 0.7" />
        </div>

        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <p className="text-sm text-emerald-900 leading-relaxed">
            Why <InlineMath math="P(A \cap B) = P(A) \cdot P(B)" />? Because{" "}
            <InlineMath math="A" /> and <InlineMath math="B" /> are{" "}
            <strong>independent</strong>: liking apples doesn&apos;t change the
            chance of also liking bananas, so the overlap is just the product{" "}
            <InlineMath math="0.5 \times 0.4 = 0.2" />, matching the middle area
            above.
          </p>
        </div>

        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-sm text-sky-900 leading-relaxed">
            &quot;Include&quot; both groups by adding <InlineMath math="P(A)" />{" "}
            and <InlineMath math="P(B)" />, then &quot;exclude&quot; the overlap{" "}
            <InlineMath math="P(A \cap B)" /> once, since it was included twice.
          </p>
        </div>
      </div>
      {/* Three groups */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌🍊 Example: three fruits
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Now add a third event: <InlineMath math="C" />, the probability that a
          person likes 🍊 oranges, alongside <InlineMath math="A" /> (🍎 apples)
          and <InlineMath math="B" /> (🍌 bananas). As before, these events are{" "}
          <strong>not incompatible</strong> and we assume they are{" "}
          <strong>independent</strong>: they can happen alone or together, and
          none of them conditions the others.
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Knowing <InlineMath math="P(A)" />, <InlineMath math="P(B)" /> and{" "}
          <InlineMath math="P(C)" />, we want to calculate the probability of
          their union:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B \cup C) = \,?" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Graphically, we want to calculate the area outlined in bold below, the
          area covered by <InlineMath math="A" />, <InlineMath math="B" /> or{" "}
          <InlineMath math="C" /> (or any combination of them). The numbers
          inside show the probability of each region:
        </p>

        <svg viewBox="0 0 300 250" className="w-full max-w-xs mx-auto">
          <defs>
            <clipPath id="ie3-union-outer">
              <circle cx="120" cy="100" r="74" />
              <circle cx="190" cy="100" r="74" />
              <circle cx="155" cy="165" r="74" />
            </clipPath>
            <clipPath id="ie3-union-inner">
              <circle cx="120" cy="100" r="70" />
              <circle cx="190" cy="100" r="70" />
              <circle cx="155" cy="165" r="70" />
            </clipPath>
          </defs>
          {/* Bold outline tracing the union A ∪ B ∪ C */}
          <rect
            x="0"
            y="0"
            width="300"
            height="250"
            className="fill-black-500"
            clipPath="url(#ie3-union-outer)"
          />
          <rect
            x="0"
            y="0"
            width="300"
            height="250"
            className="fill-slate-50"
            clipPath="url(#ie3-union-inner)"
          />
          <circle
            cx="120"
            cy="100"
            r="70"
            className="fill-rose-300 mix-blend-multiply"
          />
          <circle
            cx="190"
            cy="100"
            r="70"
            className="fill-amber-300 mix-blend-multiply"
          />
          <circle
            cx="155"
            cy="165"
            r="70"
            className="fill-orange-300 mix-blend-multiply"
          />
          <text
            x="75"
            y="55"
            textAnchor="middle"
            className="fill-rose-700 text-xs font-semibold"
          >
            🍎
          </text>
          <text
            x="235"
            y="55"
            textAnchor="middle"
            className="fill-amber-700 text-xs font-semibold"
          >
            🍌
          </text>
          <text
            x="155"
            y="240"
            textAnchor="middle"
            className="fill-orange-700 text-xs font-semibold"
          >
            🍊
          </text>
          <text
            x="85"
            y="75"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.24
          </text>
          <text
            x="225"
            y="75"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.16
          </text>
          <text
            x="155"
            y="210"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.06
          </text>
          <text
            x="155"
            y="65"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.16
          </text>
          <text
            x="100"
            y="155"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.06
          </text>
          <text
            x="210"
            y="155"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.04
          </text>
          <text
            x="155"
            y="135"
            textAnchor="middle"
            className="fill-slate-700 text-xs font-bold"
          >
            0.04
          </text>
        </svg>

        <p className="text-slate-600 leading-relaxed text-sm">
          When we naively add <InlineMath math="P(A) + P(B) + P(C)" />, the
          areas where two circles overlap get counted <strong>twice</strong>,
          and the area where all three overlap gets counted{" "}
          <strong>three times</strong>. Subtracting every pairwise overlap{" "}
          <InlineMath math="P(A \cap B) + P(A \cap C) + P(B \cap C)" /> fixes
          the pairwise areas, but it subtracts the middle area{" "}
          <strong>three times</strong> too (once for each pair it belongs to),
          removing it entirely.
        </p>

        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <p className="text-sm text-emerald-900 leading-relaxed">
            So we add the triple overlap{" "}
            <InlineMath math="P(A \cap B \cap C)" /> back once, restoring it to
            being counted exactly once.
          </p>
        </div>

        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B \cup C) = P(A) + P(B) + P(C) - P(A \cap B) - P(A \cap C) - P(B \cap C) + P(A \cap B \cap C)" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Putting in numbers
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Say <InlineMath math="P(A) = 0.5" />, <InlineMath math="P(B) = 0.4" />{" "}
          and <InlineMath math="P(C) = 0.2" />. Since the events are
          independent, every intersection is just a product of the individual
          probabilities:{" "}
          <InlineMath math="P(A \cap B) = 0.5 \times 0.4 = 0.2" />,{" "}
          <InlineMath math="P(A \cap C) = 0.5 \times 0.2 = 0.1" />,{" "}
          <InlineMath math="P(B \cap C) = 0.4 \times 0.2 = 0.08" />, and{" "}
          <InlineMath math="P(A \cap B \cap C) = 0.5 \times 0.4 \times 0.2 = 0.04" />
          . Then:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B \cup C) = 0.5 + 0.4 + 0.2 - 0.2 - 0.1 - 0.08 + 0.04 = 0.76" />
        </div>
      </div>
      {/* Setup for general formula */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🎯 The general case: n events
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Now suppose we have <InlineMath math="n" /> events{" "}
          <InlineMath math="E_1, \dots, E_n" /> that are{" "}
          <strong>non-incompatible</strong> (every pair can happen together) and{" "}
          <strong>independent</strong> (one happening doesn&apos;t change the
          probability of another):
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P(E_i \cap E_j) > 0 \quad \text{and} \quad P(E_i \cap E_j) = P(E_i)P(E_j), \quad \forall\, i,j \in [1 \dots n],\ i \neq j" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Knowing the probability <InlineMath math="P(E_i)" /> of each event, we
          want to calculate the probability that at least one of them happens:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P\left(\bigcup_{i=1}^{n} E_i\right) = \,?" />
        </div>
      </div>
      <p className="text-slate-600 leading-relaxed text-sm">
        A first guess might be to just add up{" "}
        <InlineMath math="P(E_1) + \dots + P(E_n)" />, but as we saw above this
        over-counts the overlaps. To fix it we follow an{" "}
        <strong>include, exclude</strong> chain: <strong>include</strong> all
        single events, <strong>exclude</strong> all pairwise intersections,{" "}
        <strong>include</strong> all triple intersections,{" "}
        <strong>exclude</strong> all quadruple intersections, and so on, until
        we reach the last intersection of all <InlineMath math="n" /> events
        together.
      </p>
      <p className="text-slate-600 leading-relaxed text-sm">
        These intersections are <strong>combinations without repetition</strong>{" "}
        of the <InlineMath math="n" /> events, taken <InlineMath math="k" /> at
        a time, for <InlineMath math="k = 1, 2, 3, \dots, n" />, exactly the{" "}
        <InlineMath math="\binom{n}{k}" /> combinations from earlier on this
        page.
      </p>
      {/* General formula */}
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">📖</span>
        <p className="text-sm text-violet-900 leading-relaxed">
          In general, for any number <InlineMath math="n" /> of events, the
          pattern keeps alternating: add the probabilities of all single events,
          subtract all pairwise intersections, add back all triple
          intersections, subtract all quadruple intersections, and so on, until
          every overlap has been accounted for exactly once.
        </p>
      </div>
      <p className="text-slate-600 leading-relaxed text-sm">
        On the left-hand side, <InlineMath math="\bigcup_{i=1}^{n} E_i" /> means
        &quot;event <InlineMath math="E_1" /> or event <InlineMath math="E_2" />{" "}
        or ... or event <InlineMath math="E_n" />
        &quot;, i.e. <strong>at least one</strong> of the{" "}
        <InlineMath math="n" /> events happens. So{" "}
        <InlineMath math="P\left(\bigcup_{i=1}^{n} E_i\right)" /> is just the
        probability that at least one of our <InlineMath math="n" /> events
        happens, which is exactly what we want to compute. The right-hand side
        is how we compute it:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="P\left(\bigcup_{i=1}^{n} E_i\right) = \sum_{k=1}^{n} (-1)^{k+1} \left(\sum_{i_1 < \dots < i_k} P(E_{i_1} \cap \dots \cap E_{i_k})\right)" />
      </div>
      <p className="text-slate-600 leading-relaxed text-sm">
        For each <InlineMath math="k" />, how many terms do we add or subtract?
        Exactly <InlineMath math="\binom{n}{k}" />, the same k-combinations from
        earlier on this page. For example, with <InlineMath math="n=3" /> events
        🍎, 🍌, 🍊:
      </p>
      <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
        <li>
          <InlineMath math="k=1" />: <InlineMath math="\binom{3}{1}=3" /> single
          events
        </li>
        <li>
          <InlineMath math="k=2" />: <InlineMath math="\binom{3}{2}=3" /> pairs
        </li>
        <li>
          <InlineMath math="k=3" />: <InlineMath math="\binom{3}{3}=1" /> triple
        </li>
      </ul>
      <p className="text-slate-600 leading-relaxed text-sm">
        Since our <InlineMath math="n" /> events are{" "}
        <strong>independent</strong>, the probability of an intersection is just
        the product of the individual probabilities:{" "}
        <InlineMath math="P(E_{i_1} \cap \dots \cap E_{i_k}) = P(E_{i_1}) \cdots P(E_{i_k})" />
        . So for each <InlineMath math="k" />, we generate every subset{" "}
        <InlineMath math="S" /> of <InlineMath math="k" /> events from{" "}
        <InlineMath math="E" />, multiply the probabilities of the events in{" "}
        <InlineMath math="S" />, and sum over all such subsets:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\left(\sum_{i_1 < \dots < i_k} P(E_{i_1} \cap \dots \cap E_{i_k})\right) = \sum_{S \in \binom{E}{k}} \prod_{E_j \in S} P(E_j)" />
      </div>{" "}
      <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
          💡
        </span>
        <p className="text-sm text-emerald-900 leading-relaxed">
          These two sums are actually <strong>the same sum</strong>, just
          written two ways. A choice of indices{" "}
          <InlineMath math="i_1 < \dots < i_k" /> is exactly a choice of a{" "}
          <InlineMath math="k" />
          -element subset{" "}
          <InlineMath math="S = \{E_{i_1}, \dots, E_{i_k}\} \in \binom{E}{k}" />
          , so the two sums run over the same set of terms, one term per subset.
          Within each term, independence turns the intersection into a product:{" "}
          <InlineMath math="P(E_{i_1} \cap \dots \cap E_{i_k}) = \prod_{E_j \in S} P(E_j)" />
          . So{" "}
          <InlineMath math="\sum_{i_1 < \dots < i_k} P(E_{i_1} \cap \dots \cap E_{i_k}) = \sum_{S \in \binom{E}{k}} \prod_{E_j \in S} P(E_j)" />
          .
        </p>
      </div>
      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          The sign <InlineMath math="(-1)^{k+1}" /> just alternates between{" "}
          <InlineMath math="+1" /> and <InlineMath math="-1" />: it&apos;s{" "}
          <InlineMath math="+1" /> when <InlineMath math="k" /> is odd (1, 3, 5,
          ... &rarr; include), and <InlineMath math="-1" /> when{" "}
          <InlineMath math="k" /> is even (2, 4, 6, ... &rarr; exclude).
        </p>
      </div>
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">🎉</span>
        <p className="text-sm text-violet-900 leading-relaxed">
          Putting it all together, we finally get the general formula of the
          Inclusion-Exclusion Principle for <InlineMath math="n" />{" "}
          non-incompatible and independent events:
        </p>
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="P\left(\bigcup_{i=1}^{n} E_i\right) = \sum_{i=1}^{n} (-1)^{i-1} \left(\sum_{S \in \binom{E}{i}} \prod_{E_j \in S} P(E_j)\right)" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌 Checking the formula for n = 2
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Take <InlineMath math="E = \{A, B\}" /> with{" "}
          <InlineMath math="P(A) = 0.5" /> and <InlineMath math="P(B) = 0.4" />,
          independent:
        </p>

        <svg viewBox="0 0 320 180" className="w-full max-w-[180px] mx-auto">
          <defs>
            <clipPath id="ie2check-union-outer">
              <circle cx="120" cy="90" r="79" />
              <circle cx="200" cy="90" r="79" />
            </clipPath>
            <clipPath id="ie2check-union-inner">
              <circle cx="120" cy="90" r="75" />
              <circle cx="200" cy="90" r="75" />
            </clipPath>
          </defs>
          <rect
            x="0"
            y="0"
            width="320"
            height="180"
            className="fill-black-500"
            clipPath="url(#ie2check-union-outer)"
          />
          <rect
            x="0"
            y="0"
            width="320"
            height="180"
            className="fill-slate-50"
            clipPath="url(#ie2check-union-inner)"
          />
          <circle
            cx="120"
            cy="90"
            r="75"
            className="fill-rose-300 mix-blend-multiply"
          />
          <circle
            cx="200"
            cy="90"
            r="75"
            className="fill-amber-300 mix-blend-multiply"
          />
          <text
            x="90"
            y="30"
            textAnchor="middle"
            className="fill-rose-700 text-xs font-semibold"
          >
            A
          </text>
          <text
            x="230"
            y="30"
            textAnchor="middle"
            className="fill-amber-700 text-xs font-semibold"
          >
            B
          </text>
          <text
            x="85"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            0.3
          </text>
          <text
            x="160"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            0.2
          </text>
          <text
            x="235"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            0.2
          </text>
        </svg>

        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-sm text-sky-900 leading-relaxed">
            In plain words, for each <InlineMath math="i" /> we: (1) list every
            subset <InlineMath math="S" /> of <InlineMath math="E" /> with{" "}
            <InlineMath math="i" /> elements, (2) for each subset, multiply
            together the probabilities of its members, (3) add up these products
            across all subsets, and (4) flip the sign depending on whether{" "}
            <InlineMath math="i" /> is odd (<InlineMath math="+" />) or even (
            <InlineMath math="-" />
            ). Finally, we add the results for every <InlineMath math="i" />{" "}
            from 1 to <InlineMath math="n" />. With{" "}
            <InlineMath math="E = \{A, B\}" />, there are only two values of{" "}
            <InlineMath math="i" /> to consider, so the sum{" "}
            <InlineMath math="\sum_{i=1}^{n}" /> has just two terms,{" "}
            <InlineMath math="i = 1" /> and <InlineMath math="i = 2" />:
          </p>
        </div>

        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B) = \underbrace{(-1)^{1-1}\!\left(\sum_{S \in \binom{E}{1}} \prod_{E_j \in S} P(E_j)\right)}_{i=1} + \underbrace{(-1)^{2-1}\!\left(\sum_{S \in \binom{E}{2}} \prod_{E_j \in S} P(E_j)\right)}_{i=2}" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          For <InlineMath math="i = 1" />, the only subsets of size 1 are{" "}
          <InlineMath math="\{A\}" /> and <InlineMath math="\{B\}" />, and{" "}
          <InlineMath math="(-1)^{1-1} = +1" />:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="(-1)^{1-1}\!\left(\sum_{S \in \binom{E}{1}} \prod_{E_j \in S} P(E_j)\right) = (-1)^{0}\big(P(A) + P(B)\big) = 0.5 + 0.4 = 0.9" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          For <InlineMath math="i = 2" />, the only subset of size 2 is{" "}
          <InlineMath math="\{A, B\}" />, and{" "}
          <InlineMath math="(-1)^{2-1} = -1" />:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="(-1)^{2-1}\!\left(\sum_{S \in \binom{E}{2}} \prod_{E_j \in S} P(E_j)\right) = (-1)^{1}\big(P(A) \cdot P(B)\big) = -(0.5 \times 0.4) = -0.2" />
        </div>

        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-sm text-sky-900 leading-relaxed">
            Unlike <InlineMath math="i = 1" />, where{" "}
            <InlineMath math="\binom{E}{1}" /> has <strong>two</strong> subsets{" "}
            <InlineMath math="\{A\}" /> and <InlineMath math="\{B\}" /> (so that
            sum has two terms, <InlineMath math="P(A) + P(B)" />
            ), here <InlineMath math="\binom{E}{2}" /> has only{" "}
            <strong>one</strong> subset, <InlineMath math="\{A, B\}" />. So the
            inner sum <InlineMath math="\sum_{S \in \binom{E}{2}}" /> has just
            this single term,{" "}
            <InlineMath math="\prod_{E_j \in \{A,B\}} P(E_j) = P(A) \cdot P(B)" />
            , and <InlineMath math="(-1)^{2-1} = -1" /> simply multiplies that
            one term, giving <InlineMath math="-P(A) \cdot P(B)" />, not an
            extra term to add.
          </p>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Summing over <InlineMath math="i = 1, 2" /> recovers the two-event
          formula from the first example:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B) = 0.9 + (-0.2) = 0.7 = P(A) + P(B) - P(A) P(B)" />
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌🍊 Checking the formula for n = 3
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Take <InlineMath math="E = \{A, B, C\}" /> with{" "}
          <InlineMath math="P(A) = 0.5" />, <InlineMath math="P(B) = 0.4" /> and{" "}
          <InlineMath math="P(C) = 0.2" />, all independent. For{" "}
          <InlineMath math="i = 1" />, the subsets of size 1 are{" "}
          <InlineMath math="\{A\}" />, <InlineMath math="\{B\}" /> and{" "}
          <InlineMath math="\{C\}" />, and <InlineMath math="(-1)^{1-1} = +1" />
          :
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="(-1)^{0}\big(P(A) + P(B) + P(C)\big) = 0.5 + 0.4 + 0.2 = 1.1" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          For <InlineMath math="i = 2" />, the subsets of size 2 are{" "}
          <InlineMath math="\{A, B\}" />, <InlineMath math="\{A, C\}" /> and{" "}
          <InlineMath math="\{B, C\}" />, and{" "}
          <InlineMath math="(-1)^{2-1} = -1" />:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="(-1)^{1}\big(P(A)P(B) + P(A)P(C) + P(B)P(C)\big) = -(0.2 + 0.1 + 0.08) = -0.38" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          For <InlineMath math="i = 3" />, the only subset of size 3 is{" "}
          <InlineMath math="\{A, B, C\}" />, and{" "}
          <InlineMath math="(-1)^{3-1} = +1" />:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="(-1)^{2}\big(P(A)P(B)P(C)\big) = 0.5 \times 0.4 \times 0.2 = 0.04" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Summing over <InlineMath math="i = 1, 2, 3" /> recovers the
          three-event formula from the second example:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P(A \cup B \cup C) = 1.1 + (-0.38) + 0.04 = 0.76" />
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="= P(A) + P(B) + P(C) - P(A \cap B) - P(A \cap C) - P(B \cap C) + P(A \cap B \cap C)" />
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        The graphical explanation above is adapted from Marco Pierini&apos;s{" "}
        <a
          href="https://medium.com/@m.pierini/graphically-understanding-the-inclusion-exclusion-principle-de7e54ebb8bb"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-500 hover:underline"
        >
          &quot;Graphically Understanding the Inclusion-Exclusion
          Principle&quot;
        </a>
        .
      </p>
    </section>
  );
}
