"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function Factorials() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Factorials</h2>

      {/* 0! = 1 callout */}
      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          Factorials count the number of ways to arrange things.
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed">
        A factorial is written as <InlineMath math="n!" /> and means
        multiplying <InlineMath math="n" /> by every positive whole number
        smaller than it, all the way down to 1:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="n! = n \times (n-1) \times (n-2) \times \cdots \times 1" />
      </div>

      <p className="text-slate-600 leading-relaxed">
        For example, a very simple case:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="4! = 4 \times 3 \times 2 \times 1 = 24" />
      </div>

      {/* 0! = 1 callout */}
      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          By definition, <InlineMath math="0! = 1" />. There is exactly one
          way to arrange zero things: do nothing.
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed">
        Factorials count the number of ways to{" "}
        <strong>arrange (order) a set of distinct things</strong>. For
        example, say you have 3 books, A, B and C, and you want to line them
        up on a shelf. There are{" "}
        <InlineMath math="3! = 3 \times 2 \times 1 = 6" /> different
        orderings:
      </p>

      {/* Visual: all 6 permutations of books A, B, C */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {["A", "B", "C"]
          .flatMap((a) =>
            ["A", "B", "C"]
              .filter((b) => b !== a)
              .flatMap((b) =>
                ["A", "B", "C"]
                  .filter((c) => c !== a && c !== b)
                  .map((c) => [a, b, c]),
              ),
          )
          .map((order, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex gap-1.5">
                {order.map((letter, j) => {
                  const colors: Record<string, string> = {
                    A: "bg-sky-500",
                    B: "bg-emerald-500",
                    C: "bg-amber-500",
                  };
                  return (
                    <div
                      key={j}
                      className={`w-9 h-11 rounded-md text-white flex items-center justify-center text-sm font-bold shadow-sm ${colors[letter]}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs text-slate-400">
                {i + 1}. {order.join("")}
              </span>
            </div>
          ))}
      </div>

      <p className="text-slate-600 leading-relaxed">
        That&apos;s the same idea behind terms like <InlineMath math="i!" />{" "}
        and <InlineMath math="C!" /> that show up in the Erlang-B and
        Kaufman-Roberts formulas: they count how many ways things can be
        arranged.
      </p>
    </section>
  );
}
