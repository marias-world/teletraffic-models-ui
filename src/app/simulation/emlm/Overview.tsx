import Link from "next/link";
import { InlineMath } from "react-katex";

export default function Overview() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        1. From Erlang-B to EMLM
      </h2>

      <p className="text-slate-600 leading-relaxed">
        The{" "}
        <Link
          href="/simulation/erlang-b"
          className="text-sky-600 hover:underline font-medium"
        >
          Erlang-B simulation
        </Link>{" "}
        models one link with a limited capacity available where every call
        requires the same amount of resources. The{" "}
        <strong>Erlang Multirate Loss Model (EMLM)</strong> lifts that
        restriction: a single link of capacity <InlineMath math="C" /> bandwidth
        units (b.u.) is shared by several <strong>service classes</strong>, and
        a call of class <InlineMath math="k" /> occupies{" "}
        <InlineMath math="b_k" /> b.u. for as long as it lasts, for example
        voice calls needing 1 b.u. next to video calls needing 4.
      </p>
      <p className="text-slate-600 leading-relaxed text-sm">
        This page doesn&apos;t repeat the discrete-event machinery (clock, event
        list, seeds, warm-up) explained in the{" "}
        <Link
          href="/simulation/erlang-b"
          className="text-sky-600 hover:underline font-medium"
        >
          Erlang-B simulation
        </Link>{" "}
        page. It covers what changes for several classes, and then lets you run
        the simulation.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
          <li>
            <span className="font-mono font-semibold text-slate-700">
              Arrivals
            </span>
            : class-
            <InlineMath math="k" /> calls arrive as a Poisson process with rate{" "}
            <InlineMath math="\lambda_k" />.
          </li>
          <li>
            <span className="font-mono font-semibold text-slate-700">
              Holding time
            </span>
            : each class-
            <InlineMath math="k" /> call keeps its <InlineMath math="b_k" />{" "}
            b.u. for an exponentially distributed time with rate{" "}
            <InlineMath math="\mu_k" />, so its offered load is{" "}
            <InlineMath math="a_k = \lambda_k / \mu_k" /> erlangs.
          </li>
          <li>
            <span className="font-mono font-semibold text-slate-700">
              Admission
            </span>
            : complete sharing. A class-
            <InlineMath math="k" /> arrival is accepted if{" "}
            <InlineMath math="n + b_k \le C" />, where <InlineMath math="n" />{" "}
            is the number of b.u. currently occupied; otherwise it is blocked
            and lost. There is no queue.
          </li>
        </ul>
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        The analytical benchmark is the{" "}
        <Link
          href="/kaufman-roberts"
          className="text-sky-600 hover:underline font-medium"
        >
          Kaufman-Roberts recursion
        </Link>
        , which gives the occupancy distribution <InlineMath math="q(j)" /> and
        each class&apos;s call blocking probability from only{" "}
        <InlineMath math="a_k" /> and <InlineMath math="b_k" />. The simulation
        is checked against it.
      </p>
    </section>
  );
}
