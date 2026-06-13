"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function MultinomialCoefficients() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Multinomial Coefficients
      </h2>

      <p className="text-slate-600 leading-relaxed">
        Binomial coefficients generalize nicely to counting arrangements of
        things in a row when some of them are identical.
      </p>

      {/* Simple case: all distinct */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍌🍊🍓 Arranging distinct fruits
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          How many ways can you arrange 🍎, 🍌, 🍊 and 🍓 in a row? Since all
          4 fruits are different, this is just <InlineMath math="4!" />:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="4! = 24" />
        </div>
      </div>

      {/* Two identical types */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍊🍊🍌🍌🍌🍌 Arranging with repeats
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Now suppose we want to arrange 2 🍊 oranges and 4 🍌 bananas (6
          fruits total) in a row. All oranges look alike, and all bananas
          look alike, so we just need to decide which positions get an
          orange:
        </p>

        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-lg ${
                i < 2
                  ? "bg-rose-100 border-2 border-rose-400"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {i < 2 ? "🍊" : "🍌"}
            </div>
          ))}
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Choose 2 of the 6 positions for the oranges (order doesn&apos;t
          matter, they&apos;re identical), and the remaining 4 positions are
          automatically bananas:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{6}{2} \cdot \binom{4}{4} = \binom{6}{2}" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          Equally, we could have chosen where the 4 bananas go instead, and
          the rest would be oranges. Either way we get the same count:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{6}{2} = \binom{6}{4} = \frac{6!}{2!\,4!} = 15" />
        </div>

        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
            💡
          </span>
          <p className="text-sm text-emerald-900 leading-relaxed">
            Another way to see this: first arrange all 6 fruits as if they
            were distinct (<InlineMath math="6!" /> ways), then divide by{" "}
            <InlineMath math="2!" /> and <InlineMath math="4!" /> to undo the
            overcounting from the 2 identical oranges and 4 identical
            bananas.
          </p>
        </div>
      </div>

      {/* Three types */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍊🍌🍓 Three types of fruit
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          What if we have three types: 3 🍊 oranges, 2 🍌 bananas and 4 🍓
          strawberries (9 fruits total)? We can place each type one at a
          time:
        </p>

        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-lg border-2 ${
                i < 3
                  ? "bg-rose-100 border-rose-400"
                  : i < 5
                    ? "bg-sky-100 border-sky-400"
                    : "border-slate-200 bg-white"
              }`}
            >
              {i < 3 ? "🍊" : i < 5 ? "🍌" : "🍓"}
            </div>
          ))}
        </div>

        <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
          <li>
            Choose 3 of the 9 spots for the oranges:{" "}
            <InlineMath math="\binom{9}{3}" />
          </li>
          <li>
            Choose 2 of the remaining 6 spots for the bananas:{" "}
            <InlineMath math="\binom{6}{2}" />
          </li>
          <li>
            The last 4 spots must be strawberries:{" "}
            <InlineMath math="\binom{4}{4} = 1" />
          </li>
        </ul>
        <p className="text-slate-600 leading-relaxed text-sm">
          By the product rule:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{9}{3}\binom{6}{2}\binom{4}{4} = \frac{9!}{3!\,6!}\cdot\frac{6!}{2!\,4!}\cdot\frac{4!}{4!\,0!} = \frac{9!}{3!\,2!\,4!}" />
        </div>
      </div>

      {/* Definition callout */}
      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
          📖
        </span>
        <p className="text-sm text-violet-900 leading-relaxed">
          If we have <InlineMath math="k" /> types of fruit ({" "}
          <InlineMath math="n" /> total), with <InlineMath math="n_1" /> of
          the first type, <InlineMath math="n_2" /> of the second, ..., and{" "}
          <InlineMath math="n_k" /> of the <InlineMath math="k" />
          -th, the number of distinct arrangements is the{" "}
          <strong>multinomial coefficient</strong>:
        </p>
      </div>
      <div className="overflow-x-auto py-1">
        <BlockMath math="\binom{n}{n_1, n_2, \dots, n_k} = \frac{n!}{n_1!\,n_2!\,\cdots\,n_k!}" />
      </div>
      <p className="text-slate-600 leading-relaxed text-sm">
        The bottom numbers must add up to <InlineMath math="n" />, and their
        order doesn&apos;t matter.
      </p>

      {/* Final example */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🍎🍎🍎🍌🍌🍊🍓 Putting it together
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          How many ways can you arrange 3 🍎 apples, 2 🍌 bananas, 1 🍊 orange
          and 1 🍓 strawberry in a row (7 fruits total)?
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Here <InlineMath math="n=7" /> and <InlineMath math="k=4" /> types,
          with <InlineMath math="n_1=3" /> (🍎), <InlineMath math="n_2=2" />{" "}
          (🍌), <InlineMath math="n_3=1" /> (🍊) and{" "}
          <InlineMath math="n_4=1" /> (🍓):
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="\binom{7}{3,2,1,1} = \frac{7!}{3!\,2!\,1!\,1!} = 420" />
        </div>
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">
            ⚠️
          </span>
          <p className="text-sm text-amber-900 leading-relaxed">
            Even though <InlineMath math="1! = 1" /> doesn&apos;t change the
            answer, we still write every <InlineMath math="n_i" /> on the
            bottom, since they must add up to <InlineMath math="n" />.
          </p>
        </div>
      </div>
    </section>
  );
}
