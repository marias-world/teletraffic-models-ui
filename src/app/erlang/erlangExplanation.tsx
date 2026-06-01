"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function ErlangExplanation() {
  return (
    <div className="pt-8 border-t border-slate-200 space-y-10">

      {/* ── What Does Blocking Mean ───────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-800">What Does Blocking Mean?</h3>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 space-y-2">
          <p className="text-slate-700">
            Blocking occurs when all channels are busy and a new call arrives. Because
            Erlang-B assumes no waiting queue, the call is immediately rejected.
          </p>
          <p className="text-slate-700">
            The blocking probability is the likelihood that an incoming call finds every
            channel occupied and gets lost. For example, if{" "}
            <InlineMath math="B = 0.02" />, then 2% of calls are lost.
          </p>
        </div>
      </section>

      {/* ── Closed Form ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800">The Closed Form</h3>
        <p className="text-slate-600">
          The original Erlang-B formula calculates blocking probability directly from
          the offered traffic <InlineMath math="\alpha" /> and the number of channels{" "}
          <InlineMath math="C" />:
        </p>

        <BlockMath math="B = E_C(\alpha) = \frac{\dfrac{\alpha^C}{C!}}{\displaystyle\sum_{i=0}^{C} \dfrac{\alpha^i}{i!}}" />

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-semibold text-slate-700">Where:</h4>
          <ul className="space-y-2 text-slate-600">
            <li><InlineMath math="B" /> — blocking probability</li>
            <li><InlineMath math="C" /> — number of available channels</li>
            <li><InlineMath math="\alpha" /> — offered traffic in Erlangs</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
          The closed form breaks down for systems with more than 170 channels because{" "}
          <InlineMath math="171!" /> exceeds the maximum value representable in
          floating-point arithmetic, overflowing to infinity. This is why the recursive
          form exists.
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Breaking down each part</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Numerator: <InlineMath math="\alpha^C / C!" />
              </p>
              <p className="text-sm text-slate-600">
                The unnormalized state weight for state <InlineMath math="C" /> — the
                state where all channels are occupied. It is proportional to the
                probability of being in state <InlineMath math="C" />, but becomes
                the actual probability only once divided by the denominator.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 mt-1">
                <li>
                  <InlineMath math="\alpha^C" /> — the offered traffic intensity
                  raised to the power <InlineMath math="C" />, from the Poisson
                  arrival assumption in the M/M/C/C birth-death chain
                </li>
                <li>
                  <InlineMath math="C!" /> — C factorial; the normalising term from
                  the Poisson distribution in the stationary solution of the
                  birth-death Markov chain
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Denominator: <InlineMath math="\sum_{i=0}^{C} \alpha^i / i!" />
              </p>
              <p className="text-sm text-slate-600">
                The normalization constant — the sum of unnormalized state weights
                across all possible states from 0 to <InlineMath math="C" />.
                Dividing by this sum converts each weight into a proper probability.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Each term <InlineMath math="\alpha^i / i!" /> is the unnormalized
                weight for state <InlineMath math="i" /> (i.e.{" "}
                <InlineMath math="i" /> calls in the system). Summing all terms
                ensures the state probabilities add up to 1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recursive Form ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800">The Recursive Form</h3>
        <p className="text-slate-600">
          For large values of <InlineMath math="C" />, computing factorials directly
          becomes numerically unstable. The recursive form avoids this by building on
          the previously computed value, one channel at a time:
        </p>

        <BlockMath math="B = E_C(\alpha) = \frac{\alpha \cdot E_{C-1}(\alpha)}{C + \alpha \cdot E_{C-1}(\alpha)}" />

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-slate-700">
          Unlike the closed form, the recursive formula has no factorial computation and
          stays numerically stable for any value of <InlineMath math="C" />. This is its
          key practical advantage.
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Breaking down each part</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                <InlineMath math="C - 1" /> (the previous step)
              </p>
              <p className="text-sm text-slate-600">
                The formula builds on the previous case, where the system had one
                fewer channel. It represents a system one step smaller, i.e. with
                one fewer channel available.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                <InlineMath math="E_{C-1}(\alpha)" /> (inherited result)
              </p>
              <p className="text-sm text-slate-600">
                The blocking probability for a system with{" "}
                <InlineMath math="C - 1" /> channels. Rather than recalculating from
                scratch, the recursive formula reuses this result.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Numerator: <InlineMath math="\alpha \cdot E_{C-1}(\alpha)" />
              </p>
              <p className="text-sm text-slate-600">
                The load offered to the <InlineMath math="C" />-th channel, based on
                the blocking probability of the system with{" "}
                <InlineMath math="C - 1" /> channels.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Denominator: <InlineMath math="C + \alpha \cdot E_{C-1}(\alpha)" />
              </p>
              <p className="text-sm text-slate-600">
                The normalization factor for the recursion: the number of channels{" "}
                <InlineMath math="C" /> plus the traffic load reaching the{" "}
                <InlineMath math="C" />-th channel. It ensures the result remains a
                valid probability between 0 and 1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Worked Example ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-800">
          Worked Example: <InlineMath math="C = 3" />, <InlineMath math="\alpha = 2\,\text{Erl}" />
        </h3>

        {/* Closed form worked example */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Method 1: Closed form</h4>
          <p className="text-slate-600 text-sm">
            Calculate each term of the denominator sum, then divide the top term by the total.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-600">Step 1: calculate each state</p>
            <BlockMath math="i=0:\quad \frac{2^0}{0!} = \frac{1}{1} = 1" />
            <BlockMath math="i=1:\quad \frac{2^1}{1!} = \frac{2}{1} = 2" />
            <BlockMath math="i=2:\quad \frac{2^2}{2!} = \frac{4}{2} = 2" />
            <BlockMath math="i=3:\quad \frac{2^3}{3!} = \frac{8}{6} \approx 1.333" />

            <p className="text-sm font-semibold text-slate-600 pt-2">Step 2: sum all states</p>
            <BlockMath math="\sum_{i=0}^{3} \frac{2^i}{i!} = 1 + 2 + 2 + 1.333 \approx 6.333" />

            <p className="text-sm font-semibold text-slate-600 pt-2">Step 3: divide</p>
            <BlockMath math="B = E_3(2) = \frac{1.333}{6.333} \approx 0.2105" />

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sm text-slate-700">
              The call blocking probability is approximately <strong>21%</strong>. Given a
              system capacity of 3 channels and an offered traffic load of 2 Erlangs, about
              21% of incoming calls will be blocked because the system is fully occupied.
            </div>
          </div>
        </div>

        {/* Recursive worked example */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Method 2: Recursive form</h4>
          <p className="text-slate-600 text-sm">
            Start from the base case and build up one channel at a time.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-600">
                Base case: <InlineMath math="E_0(\alpha) = 1" />
              </p>
              <p className="text-sm text-slate-500">
                If there are no available channels, every call is blocked. The channel is
                fully occupied, which means the blocking probability is 1.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <p className="text-sm font-semibold text-slate-600">
                Step 1: <InlineMath math="C = 1" /> (one channel)
              </p>
              <BlockMath math="E_1(2) = \frac{2 \cdot E_0(2)}{1 + 2 \cdot E_0(2)} = \frac{2 \times 1}{1 + 2} = \frac{2}{3} \approx 0.6667" />
              <p className="text-xs text-slate-500">
                This gives the baseline blocking probability when there is just one channel.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <p className="text-sm font-semibold text-slate-600">
                Step 2: <InlineMath math="C = 2" /> (two channels)
              </p>
              <BlockMath math="E_2(2) = \frac{2 \cdot E_1(2)}{2 + 2 \cdot E_1(2)} = \frac{2 \times 0.6667}{2 + 2 \times 0.6667} = \frac{1.3334}{3.3334} \approx 0.4" />
              <p className="text-xs text-slate-500">
                <InlineMath math="E_2" /> is the blocking probability for a 2-channel
                system, computed by plugging <InlineMath math="E_1" /> from the previous
                step into the recursive formula. Each step builds directly on the last.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <p className="text-sm font-semibold text-slate-600">
                Step 3: <InlineMath math="C = 3" /> (three channels)
              </p>
              <BlockMath math="E_3(2) = \frac{2 \cdot E_2(2)}{3 + 2 \cdot E_2(2)} = \frac{2 \times 0.4}{3 + 2 \times 0.4} = \frac{0.8}{3.8} \approx 0.2105" />
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sm text-slate-700">
              Both methods give the same result: <strong>B ≈ 21%</strong>.
            </div>
          </div>
        </div>

        {/* Why recursive */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
          <h4 className="font-semibold text-green-800">Why use the recursive method?</h4>
          <p className="text-sm text-slate-700">
            The recursive method is particularly useful for systems with a large number of
            channels. Rather than computing large factorials from scratch each time, it builds
            upon the previously computed values, making it significantly more efficient and
            numerically stable.
          </p>
        </div>
      </section>

    </div>
  );
}
