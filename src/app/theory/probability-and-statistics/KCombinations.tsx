"use client";

import { BlockMath, InlineMath } from "react-katex";

const fruits = ["🍎", "🍌", "🍊", "🍓"];

export default function KCombinations() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        k-Combinations (the binomial coefficient)
      </h2>

      {/* (n,k) notation callout */}
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">📖</span>
        <p className="text-sm text-violet-900 leading-relaxed">
          <InlineMath math="\binom{n}{k}" /> (read &quot;n choose k&quot;)
          answers the question:
        </p>
      </div>

      {/* C(n,k) callout */}
      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          How many ways can I choose <InlineMath math="k" /> things out of{" "}
          <InlineMath math="n" /> things, when the order does{" "}
          <strong>not</strong> matter?
        </p>
      </div>

      <div className="overflow-x-auto py-1">
        <BlockMath math="\binom{n}{k} = C(n,k) = \frac{P(n,k)}{k!} = \frac{n!}{k!\,(n-k)!}" />
      </div>

      <p className="text-slate-600 leading-relaxed">
        This is almost the same as <InlineMath math="P(n,k)" />, but with an
        extra <InlineMath math="k!" /> on the bottom. That extra division is the
        whole idea: order no longer counts.
      </p>

      {/* Example: choosing fruits */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍓 Example: choosing fruits
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Suppose we have <InlineMath math="n=4" /> distinct fruits: 🍎, 🍌, 🍊
          and 🍓. If we want to choose only <InlineMath math="k=1" /> out of
          these 4 fruits, the number of ways to do so is:
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{4}{1} = \frac{4!}{1!\,(4-1)!} = \binom{4}{3} = 4" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          These are the 4 possible ways to choose 1 fruit out of 4:
        </p>

        <div className="space-y-1.5">
          {fruits.map((_, i) => (
            <div key={i} className="flex gap-1.5">
              {fruits.map((f, j) => (
                <div
                  key={j}
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-lg ${
                    i === j
                      ? "bg-rose-100 border-2 border-rose-400"
                      : "border border-slate-200 bg-white"
                  }`}
                >
                  {i === j ? f : ""}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Now compare with choosing <InlineMath math="k=3" /> out of the same 4
          fruits, i.e. <InlineMath math="\binom{4}{3}" />:
        </p>

        <div className="space-y-1.5">
          {fruits.map((_, i) => (
            <div key={i} className="flex gap-1.5">
              {fruits.map((f, j) => (
                <div
                  key={j}
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-lg ${
                    i !== j
                      ? "bg-rose-100 border-2 border-rose-400"
                      : "border border-slate-200 bg-white"
                  }`}
                >
                  {i !== j ? f : ""}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Looking at the two grids, the fruit choices in each row are{" "}
          <strong>complementary</strong>: the fruit left out in row{" "}
          <InlineMath math="i" /> of the second grid is exactly the fruit chosen
          in row <InlineMath math="i" /> of the first grid.
        </p>

        <p className="text-slate-600 leading-relaxed text-sm">
          For example, take row 1. In the first grid (choosing 1), row 1
          highlights only 🍎. In the second grid (choosing 3), row 1 highlights
          everything <em>except</em> 🍎, i.e. 🍌, 🍊 and 🍓. Picking 🍎 to be
          your &quot;1 chosen fruit&quot; gives the exact same split of the 4
          fruits into two groups as picking {"{"}🍌, 🍊, 🍓{"}"} to be your
          &quot;3 chosen fruits&quot;: 🍎 is on one side, the other three are on
          the other side, just labeled differently. The same pairing holds row
          by row, for every choice of fruit.
        </p>

        <p className="text-slate-600 leading-relaxed text-sm">
          That&apos;s why there are exactly as many ways to choose 1 fruit as
          there are to choose 3 fruits: every &quot;choose 1&quot; outcome
          corresponds to exactly one &quot;choose 3&quot; outcome (its
          complement), and vice versa. Intuitively, choosing 1 fruit to keep is
          the same as choosing <InlineMath math="4-1=3" /> fruits to leave out.
        </p>

        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-sm text-sky-900 leading-relaxed">
            This explains the symmetry in binomial coefficients:{" "}
            <InlineMath math="\binom{n}{k} = \frac{n!}{k!\,(n-k)!} = \frac{n!}{(n-k)!\,k!} = \binom{n}{n-k}" />
            . Here <InlineMath math="\binom{4}{1} = \binom{4}{3} = 4" />.
          </p>
        </div>
      </div>

      {/* Example: pairing oranges and bananas */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍊🍌 Example: pairing oranges and bananas
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          We have 6 🍊 oranges and 7 🍌 bananas. If 4 oranges and 4 bananas are
          to be chosen and divided into 4 pairs (one 🍊 orange with one 🍌
          banana per pair), how many pairings are possible?
        </p>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Step 1: choose 4 out of the 6 oranges
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Order doesn&apos;t matter, they&apos;re all oranges:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-lg ${
                i < 4
                  ? "bg-rose-100 border-2 border-rose-400"
                  : "border border-slate-200 bg-white"
              }`}
            >
              🍊
            </div>
          ))}
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{6}{4}" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Step 2: choose 4 out of the 7 bananas
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Order doesn&apos;t matter, bananas are bananas:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-lg ${
                i < 4
                  ? "bg-rose-100 border-2 border-rose-400"
                  : "border border-slate-200 bg-white"
              }`}
            >
              🍌
            </div>
          ))}
        </div>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{7}{4}" />
        </div>
        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-sm text-sky-900 leading-relaxed">
            By the product rule, there are{" "}
            <InlineMath math="\binom{6}{4} \cdot \binom{7}{4}" /> ways to pick
            which 4 oranges and which 4 bananas to use.
          </p>
        </div>
        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Step 3: pair them up
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          For the first banana, we have 4 choices of orange to match with. For
          the second banana, we only have 3 choices, and so on.
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-md border-2 border-rose-400 bg-rose-50 px-2 py-1.5"
            >
              <span className="text-lg">🍊</span>
              <span className="text-slate-400 text-xs">+</span>
              <span className="text-lg">🍌</span>
            </div>
          ))}
        </div>
        <p className="text-slate-500 leading-relaxed text-xs">
          One of the <InlineMath math="4!" /> possible ways to pair up the 4
          chosen oranges with the 4 chosen bananas.
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="4 \times 3 \times 2 \times 1 = 4!" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          So we multiply by <InlineMath math="4!" /> to pair them off, and the
          total number of pairings is:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{6}{4} \cdot \binom{7}{4} \cdot 4!" />
        </div>
      </div>
    </section>
  );
}
