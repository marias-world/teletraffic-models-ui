"use client";

import { BlockMath, InlineMath } from "react-katex";

type Symbol = "star" | "bar";

function SymbolRow({ sequence }: { sequence: Symbol[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sequence.map((s, i) => (
        <div
          key={i}
          className={`w-10 h-10 rounded-md flex items-center justify-center text-lg font-bold ${
            s === "bar"
              ? "bg-slate-200 text-slate-500 border border-slate-300"
              : "border border-slate-200 bg-white"
          }`}
        >
          {s === "bar" ? "|" : "⭐"}
        </div>
      ))}
    </div>
  );
}

export default function StarsAndBars() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Stars and Bars (the divider method)
      </h2>

      <p className="text-slate-600 leading-relaxed">
        Stars and bars is a trick for counting how many ways to split a pile
        of <strong>identical</strong> items among several{" "}
        <strong>different</strong> people, and it turns out to be just
        another binomial coefficient in disguise.
      </p>

      {/* Example: sharing stars */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          ⭐ Example: sharing stars
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Suppose we have 5 identical ⭐ stars to give out to 3 friends:
          Alice, Bob and Carol. Each friend can end up with 0, 1, 2, ... or
          even all 5, as long as the total is 5. Here is one possible way to
          split them up:
        </p>

        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Alice
            </span>
            <div className="flex gap-0.5 text-lg">⭐⭐</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">Bob</span>
            <div className="flex gap-0.5 text-lg">⭐</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Carol
            </span>
            <div className="flex gap-0.5 text-lg">⭐⭐</div>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          We can write this same distribution as a row of 5{" "}
          <strong>stars</strong> (⭐) split by 2 <strong>bars</strong> (|, one
          fewer than the number of friends). Everything before the first bar
          goes to Alice, everything between the bars goes to Bob, and
          everything after the last bar goes to Carol:
        </p>

        <SymbolRow
          sequence={["star", "star", "bar", "star", "bar", "star", "star"]}
        />

        <p className="text-slate-600 leading-relaxed text-sm">
          A friend can also get 0 stars. For example, this arrangement has
          nothing before the first bar, so Alice gets 0, Bob gets 3 and Carol
          gets 2:
        </p>

        <SymbolRow
          sequence={["bar", "star", "star", "star", "bar", "star", "star"]}
        />

        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <p className="text-sm text-emerald-900 leading-relaxed">
            Every way of sharing the 5 stars corresponds to exactly one
            arrangement of 5 ⭐ stars and 2 | bars in a row, and every such
            arrangement corresponds to exactly one way of sharing the stars.
          </p>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          So the question &quot;how many ways can we split 5 stars among 3
          friends?&quot; becomes &quot;how many ways can we arrange 5 stars
          and 2 bars in a row (7 symbols total)?&quot; That is just choosing
          which 2 of the 7 positions are bars (or equivalently, which 5 are
          stars):
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{7}{2} = \binom{7}{5} = \frac{7!}{2!\,5!} = 21" />
        </div>
      </div>

      {/* Definition callout */}
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
          📖
        </span>
        <p className="text-sm text-violet-900 leading-relaxed">
          In general, the number of ways to give out{" "}
          <InlineMath math="n" /> identical items to <InlineMath math="k" />{" "}
          different people (some may get 0) is:
        </p>
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\binom{n + (k-1)}{k-1} = \binom{n + (k-1)}{n}" />
      </div>
      <p className="text-slate-600 leading-relaxed text-sm">
        We need <InlineMath math="n" /> stars for the <InlineMath math="n" />{" "}
        items and <InlineMath math="k-1" /> bars to split them into{" "}
        <InlineMath math="k" /> groups, for{" "}
        <InlineMath math="n + (k-1)" /> symbols total.
      </p>

      {/* Final example */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          ⚽ Example: balls into baskets
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          How many ways can we put 4 identical ⚽ balls into 3 distinguishable
          🧺 baskets?
        </p>

        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">
              🧺 Basket 1
            </span>
            <div className="flex gap-0.5 text-lg">⚽⚽</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">
              🧺 Basket 2
            </span>
            <div className="flex gap-0.5 text-lg">⚽</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">
              🧺 Basket 3
            </span>
            <div className="flex gap-0.5 text-lg">⚽</div>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Here <InlineMath math="n=4" /> balls (stars) and{" "}
          <InlineMath math="k=3" /> baskets, so we need{" "}
          <InlineMath math="k-1=2" /> bars, for{" "}
          <InlineMath math="4+2=6" /> symbols total:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{4+(3-1)}{3-1} = \binom{6}{2} = \frac{6!}{2!\,4!} = 15" />
        </div>
      </div>
    </section>
  );
}
