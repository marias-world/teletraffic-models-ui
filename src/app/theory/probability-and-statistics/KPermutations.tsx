"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function KPermutations() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        k-Permutations
      </h2>

      <p className="text-slate-600 leading-relaxed">
        <InlineMath math="P(n,k)" /> answers the question:
      </p>

      {/* P(n,k) callout */}
      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          How many ways can I choose <InlineMath math="k" /> things out of{" "}
          <InlineMath math="n" /> things, when the order matters?
        </p>
      </div>

      <div className="overflow-x-auto py-1">
        <BlockMath math="P(n,k) = \frac{n!}{(n-k)!}" />
      </div>

      {/* Example 1: medals */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          🏅 Example: awarding medals
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Suppose you have 5 people: 🧑 Alice, 🧔 Bob, 👩 Carol, 🧑‍🦱 Dave and
          👱‍♀️ Emma. You want to award a 🥇 gold, a 🥈 silver and a 🥉 bronze
          medal. You are choosing 3 people out of 5, and the order matters
          because gold, silver and bronze are different positions.
        </p>

        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">
            ⚠️
          </span>
          <p className="text-sm text-amber-900 leading-relaxed">
            Order matters here. Picking 🧑 Alice 🥇 then 🧔 Bob 🥈 is a
            different outcome from picking 🧔 Bob 🥇 then 🧑 Alice 🥈, because
            they end up in different positions (e.g. gold vs silver).
          </p>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Counting it step by step:
        </p>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
          <li>🥇 Gold: 5 choices</li>
          <li>🥈 Silver: 4 choices (one person already has gold)</li>
          <li>🥉 Bronze: 3 choices (two people already have medals)</li>
        </ul>

        <div className="overflow-x-auto py-1">
          <BlockMath math="5 \times 4 \times 3 = 60" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          This is <InlineMath math="P(5,3) = 60" />. Using the formula:
        </p>

        <div className="overflow-x-auto py-1">
          <BlockMath math="P(5,3) = \frac{5!}{(5-3)!} = \frac{5!}{2!} = \frac{120}{2} = 60" />
        </div>
      </div>

      {/* Example 2: TA / professor seating */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          Example: a seating puzzle (combining the product rule)
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          You have 13 chairs in a row, with 9 TAs and 4 professors to be
          seated. How many seatings are there where{" "}
          <strong>
            every professor has a TA immediately to their left and right
          </strong>
          ?
        </p>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Step 1: sit all the TAs together
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center w-10 h-12 rounded-md bg-sky-100 shadow-sm"
            >
              <span className="text-xl leading-none">🪑</span>
              <span className="text-[10px] font-bold text-sky-700">TA</span>
            </div>
          ))}
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          There are <InlineMath math="9!" /> ways to arrange the 9 different
          TAs: 9 choices for the first chair, 8 for the second, and so on
          down to 1.
        </p>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Step 2: find safe places for the professors
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          A professor can only sit in a gap that already has a TA on both
          sides, i.e. one of the 8 gaps strictly between two TAs (the two
          outer ends don&apos;t count, since a professor there would have an
          empty seat on one side):
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex flex-col items-center justify-center w-10 h-12 rounded-md bg-sky-100 shadow-sm">
                <span className="text-xl leading-none">🪑</span>
                <span className="text-[10px] font-bold text-sky-700">
                  TA
                </span>
              </div>
              {i < 8 && (
                <div className="flex flex-col items-center justify-center w-8 h-12 rounded-md border-2 border-dashed border-amber-400 bg-amber-50">
                  <span className="text-xl leading-none">🪑</span>
                  <span className="text-[10px] font-bold text-amber-500">
                    ?
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          That gives <strong>8 possible gaps</strong>, and we need to fill 4
          of them, one professor at a time, where order matters (which
          professor sits in which gap is a different seating).
        </p>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Step 3: place the 4 professors into the 8 gaps
        </p>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
          <li>1st professor: 8 choices</li>
          <li>2nd professor: 7 choices</li>
          <li>3rd professor: 6 choices</li>
          <li>4th professor: 5 choices</li>
        </ul>
        <div className="overflow-x-auto py-1">
          <BlockMath math="8 \times 7 \times 6 \times 5 = P(8,4)" />
        </div>

        <p className="text-slate-600 leading-relaxed text-sm font-semibold">
          Putting it together: the product rule
        </p>

        <ol className="text-sm text-slate-600 list-decimal list-inside space-y-0.5">
          <li>
            Arrange the TAs: <InlineMath math="9!" /> ways
          </li>
          <li>
            Place the professors: <InlineMath math="P(8,4)" /> ways
          </li>
          <li>
            Multiply them: <InlineMath math="9! \cdot P(8,4)" /> ways
          </li>
        </ol>
        <p className="text-slate-600 leading-relaxed text-sm">
          We multiply rather than add because every arrangement of the TAs
          can be combined with every placement of the professors to form a
          distinct, complete seating. For each of the <InlineMath math="9!" />{" "}
          TA arrangements, there are <InlineMath math="P(8,4)" /> ways to
          place the professors, so the total count is the product of the two:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="9! \cdot P(8,4)" />
        </div>

        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">
            ℹ️
          </span>
          <p className="text-sm text-sky-900 leading-relaxed">
            If a task A can be done in <InlineMath math="a" /> ways and a task
            B can be done in <InlineMath math="b" /> ways, then doing both can
            be done in <InlineMath math="a \times b" /> ways.
          </p>
        </div>
      </div>
    </section>
  );
}
