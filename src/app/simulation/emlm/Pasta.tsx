import { BlockMath, InlineMath } from "react-katex";

export default function Pasta() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        3. PASTA with Several Classes
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        In Erlang-B a call is blocked exactly when the system is in state{" "}
        <InlineMath math="j = c" />, so call blocking (counted over arrivals)
        and <InlineMath math="q(c)" /> (measured over time) should agree: that
        is PASTA, Poisson Arrivals See Time Averages. With several classes the
        blocking condition depends on the class. A class-
        <InlineMath math="k" /> call is blocked whenever fewer than{" "}
        <InlineMath math="b_k" /> b.u. are free, that is, when the link is in
        any of the states <InlineMath math="j = C - b_k + 1, \dots, C" />.
      </p>

      <div className="overflow-x-auto">
        <BlockMath math="B_k = \sum_{j = C - b_k + 1}^{C} q(j)" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        PASTA says the fraction of class-
        <InlineMath math="k" /> arrivals that find the link in one of those
        states (the call blocking measured from arrivals) should equal the
        fraction of time the link spends in them (the sum of{" "}
        <InlineMath math="q(j)" /> over that range, measured from the clock).
        The calculator reports both for every class, next to the analytical
        value. With one class and <InlineMath math="b = 1" /> the range
        collapses to the single state <InlineMath math="j = C" />, which is
        exactly the Erlang-B check.
      </p>
    </section>
  );
}
