"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function InclusionExclusion() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Inclusion-Exclusion Principle
      </h2>

      <p className="text-slate-600 leading-relaxed">
        The inclusion-exclusion principle is a way to count how many things
        are in &quot;A or B&quot; (or &quot;A or B or C&quot;, ...) without
        double-counting the things that belong to more than one group.
      </p>

      {/* Two groups */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌 Example: apples or bananas
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Suppose 12 people like 🍎 apples, 9 people like 🍌 bananas, and 5 of
          those people like <strong>both</strong>. How many people like
          apples or bananas (at least one of the two)?
        </p>

        <svg viewBox="0 0 320 180" className="w-full max-w-xs mx-auto">
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
            7
          </text>
          <text
            x="160"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            5
          </text>
          <text
            x="235"
            y="95"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            4
          </text>
        </svg>

        <p className="text-slate-600 leading-relaxed text-sm">
          If we just add <InlineMath math="12 + 9 = 21" />, the 5 people in
          the middle (who like both fruits) get counted{" "}
          <strong>twice</strong>: once as apple-lovers and once as
          banana-lovers. To fix this, we subtract the overlap once:
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="|A \cup B| = |A| + |B| - |A \cap B| = 12 + 9 - 5 = 16" />
        </div>

        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">
            ℹ️
          </span>
          <p className="text-sm text-sky-900 leading-relaxed">
            &quot;Include&quot; both groups by adding{" "}
            <InlineMath math="|A|" /> and <InlineMath math="|B|" />, then{" "}
            &quot;exclude&quot; the overlap <InlineMath math="|A \cap B|" />{" "}
            once, since it was included twice.
          </p>
        </div>
      </div>

      {/* Three groups */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌🍊 Example: three fruits
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Now add a third group: people who like 🍊 oranges. The numbers
          below show how many times each region gets counted if we naively
          add <InlineMath math="|A| + |B| + |C|" />:
        </p>

        <svg viewBox="0 0 300 250" className="w-full max-w-xs mx-auto">
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
            className="fill-slate-700 text-sm font-bold"
          >
            1
          </text>
          <text
            x="225"
            y="75"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            1
          </text>
          <text
            x="155"
            y="210"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            1
          </text>
          <text
            x="155"
            y="65"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            2
          </text>
          <text
            x="100"
            y="155"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            2
          </text>
          <text
            x="210"
            y="155"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            2
          </text>
          <text
            x="155"
            y="135"
            textAnchor="middle"
            className="fill-slate-700 text-sm font-bold"
          >
            3
          </text>
        </svg>

        <p className="text-slate-600 leading-relaxed text-sm">
          The regions where two circles overlap get counted{" "}
          <strong>twice</strong>, and the region where all three overlap gets
          counted <strong>three times</strong>. Subtracting every pairwise
          overlap{" "}
          <InlineMath math="|A \cap B| + |A \cap C| + |B \cap C|" /> fixes the
          &quot;2&quot; regions, but it subtracts the middle region{" "}
          <strong>three times</strong> too (once for each pair it belongs
          to), taking it from 3 down to 0.
        </p>

        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <p className="text-sm text-emerald-900 leading-relaxed">
            So we add the triple overlap{" "}
            <InlineMath math="|A \cap B \cap C|" /> back once, bringing the
            middle region from 0 back up to the correct count of 1.
          </p>
        </div>

        <div className="overflow-x-auto py-1">
          <BlockMath math="|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Putting in numbers
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Say 15 people like 🍎 apples, 12 like 🍌 bananas and 10 like 🍊
          oranges. 5 like both apples and bananas, 4 like both apples and
          oranges, 3 like both bananas and oranges, and 2 like all three.
          Then:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="|A \cup B \cup C| = 15 + 12 + 10 - 5 - 4 - 3 + 2 = 27" />
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
          <strong>non-incompatible</strong> (every pair can happen together)
          and <strong>independent</strong> (one happening doesn&apos;t change
          the probability of another):
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P(E_i \cap E_j) > 0 \quad \text{and} \quad P(E_i \cap E_j) = P(E_i)P(E_j), \quad \forall\, i,j \in [1 \dots n],\ i \neq j" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Knowing the probability <InlineMath math="P(E_i)" /> of each event,
          we want to calculate the probability that at least one of them
          happens:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="P\left(\bigcup_{i=1}^{n} E_i\right) = \,?" />
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        A first guess might be to just add up{" "}
        <InlineMath math="P(E_1) + \dots + P(E_n)" />, but as we saw above
        this over-counts the overlaps. To fix it we follow an{" "}
        <strong>include, exclude</strong> chain: <strong>include</strong> all
        single events, <strong>exclude</strong> all pairwise intersections,{" "}
        <strong>include</strong> all triple intersections,{" "}
        <strong>exclude</strong> all quadruple intersections, and so on, until
        we reach the last intersection of all <InlineMath math="n" /> events
        together.
      </p>

      <p className="text-slate-600 leading-relaxed text-sm">
        These intersections are <strong>combinations without repetition</strong>{" "}
        of the <InlineMath math="n" /> events, taken{" "}
        <InlineMath math="k" /> at a time, for{" "}
        <InlineMath math="k = 1, 2, 3, \dots, n" />, exactly the{" "}
        <InlineMath math="\binom{n}{k}" /> combinations from earlier on this
        page.
      </p>

      {/* General formula */}
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
          📖
        </span>
        <p className="text-sm text-violet-900 leading-relaxed">
          In general, for any number <InlineMath math="n" /> of events, the
          pattern keeps alternating: add the probabilities of all single
          events, subtract all pairwise intersections, add back all triple
          intersections, subtract all quadruple intersections, and so on,
          until every overlap has been accounted for exactly once.
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        On the left-hand side, <InlineMath math="\bigcup_{i=1}^{n} E_i" />{" "}
        means &quot;event <InlineMath math="E_1" /> or event{" "}
        <InlineMath math="E_2" /> or ... or event <InlineMath math="E_n" />
&quot;, i.e. <strong>at least one</strong> of the{" "}
        <InlineMath math="n" /> events happens. So{" "}
        <InlineMath math="P\left(\bigcup_{i=1}^{n} E_i\right)" /> is just the
        probability that at least one of our <InlineMath math="n" /> events
        happens, which is exactly what we want to compute. The right-hand
        side is how we compute it:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="P\left(\bigcup_{i=1}^{n} E_i\right) = \sum_{k=1}^{n} (-1)^{k+1} \left(\sum_{i_1 < \dots < i_k} P(E_{i_1} \cap \dots \cap E_{i_k})\right)" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        For each <InlineMath math="k" />, how many terms do we add or
        subtract? Exactly <InlineMath math="\binom{n}{k}" />, the same
        k-combinations from earlier on this page. For example, with{" "}
        <InlineMath math="n=3" /> events 🍎, 🍌, 🍊:
      </p>
      <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
        <li>
          <InlineMath math="k=1" />: <InlineMath math="\binom{3}{1}=3" />{" "}
          single events
        </li>
        <li>
          <InlineMath math="k=2" />: <InlineMath math="\binom{3}{2}=3" />{" "}
          pairs
        </li>
        <li>
          <InlineMath math="k=3" />: <InlineMath math="\binom{3}{3}=1" />{" "}
          triple
        </li>
      </ul>

      <p className="text-slate-600 leading-relaxed text-sm">
        Since our <InlineMath math="n" /> events are{" "}
        <strong>independent</strong>, the probability of an intersection is
        just the product of the individual probabilities:{" "}
        <InlineMath math="P(E_{i_1} \cap \dots \cap E_{i_k}) = P(E_{i_1}) \cdots P(E_{i_k})" />
        . So for each <InlineMath math="k" />, we generate every subset{" "}
        <InlineMath math="S" /> of <InlineMath math="k" /> events from{" "}
        <InlineMath math="E" />, multiply the probabilities of the events in{" "}
        <InlineMath math="S" />, and sum over all such subsets:
      </p>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\sum_{S \in \binom{E}{k}} \prod_{E_j \in S} P(E_j)" />
      </div>

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          The sign <InlineMath math="(-1)^{k+1}" /> just alternates between{" "}
          <InlineMath math="+1" /> and <InlineMath math="-1" />: it&apos;s{" "}
          <InlineMath math="+1" /> when <InlineMath math="k" /> is odd (1, 3,
          5, ... &rarr; include), and <InlineMath math="-1" /> when{" "}
          <InlineMath math="k" /> is even (2, 4, 6, ... &rarr; exclude).
        </p>
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
