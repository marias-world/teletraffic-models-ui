import { InlineMath } from "react-katex";

const Q_TABLE = [
  { j: 0, simulated: "0.0109131", analytical: "0.0109389" },
  { j: 1, simulated: "0.0547696", analytical: "0.0546946" },
  { j: 2, simulated: "0.1367795", analytical: "0.1367366" },
  { j: 3, simulated: "0.2279568", analytical: "0.2278943" },
  { j: 4, simulated: "0.2847981", analytical: "0.2848678" },
  { j: 5, simulated: "0.2847830", analytical: "0.2848678" },
];

export default function WorkedExample() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        5. State Distribution, Utilization, and the PASTA Property
      </h2>
      <p className="text-slate-600 leading-relaxed">
        Beyond a single blocking number, the simulation tracks how much{" "}
        <em>time </em> is spent in each state (0 busy, 1 busy, … up to capacity
        busy). Every time an event fires, the time elapsed since the previous
        event is credited to whichever state the system was in; dividing each
        state&apos;s accumulated time by the total time gives{" "}
        <InlineMath math="q(j)" />, the fraction of time the system spends with
        exactly <InlineMath math="j" /> servers busy. From that, the{" "}
        <strong>utilization</strong> (average fraction of servers busy) is a
        weighted average of the state counts, weighted by how much time was
        spent in each.
      </p>

      <p className="text-slate-600 leading-relaxed text-sm">
        The table below shows a real output: 10 independent seeds, 2,000,000
        calls simulated per seed, with <InlineMath math="\lambda = 5" />,{" "}
        <InlineMath math="\mu = 1" />, and <InlineMath math="c = 5" /> servers
        (offered load <InlineMath math="A = \lambda/\mu = 5" /> erl).
      </p>

      {/* q(j) table */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          q(j): fraction of time with j servers busy
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left px-2">State j</th>
                <th className="text-left px-2">Simulated</th>
                <th className="text-left px-2">Analytical</th>
              </tr>
            </thead>
            <tbody>
              {Q_TABLE.map(({ j, simulated, analytical }) => (
                <tr key={j} className="bg-slate-50">
                  <td className="px-2 py-1.5 rounded-l-lg font-semibold text-slate-500">
                    {j}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-700">
                    {simulated}
                  </td>
                  <td className="px-2 py-1.5 rounded-r-lg font-mono text-slate-500">
                    {analytical}
                  </td>
                </tr>
              ))}
              <tr className="bg-white border-t border-slate-200">
                <td className="px-2 py-1.5 font-semibold text-slate-500">
                  sum
                </td>
                <td className="px-2 py-1.5 font-mono text-slate-700">
                  1.0000000
                </td>
                <td className="px-2 py-1.5 font-mono text-slate-500">
                  1.0000000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          Utilization (average fraction of servers busy) for this run:{" "}
          <span className="font-mono font-semibold text-slate-500">
            0.7150612
          </span>
          .
        </p>
      </div>

      {/* PASTA */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          PASTA: why two ways of counting blocking agree
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Blocking probability <InlineMath math="B" /> can be estimated two
          different ways, corresponding to two different observation points.
          PASTA is precisely the reason both observation points land on the same
          answer:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              Inside observer: time congestion
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sits inside the system and watches the clock:{" "}
              <InlineMath math="B" /> is the <em>percentage of time</em> the
              system is fully occupied (all <InlineMath math="c" /> servers
              busy), i.e. <InlineMath math="q(c)" />.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              Outside observer: call congestion
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Stands outside and counts arrivals: <InlineMath math="B" /> is the{" "}
              <em>fraction of calls</em> that were lost because they found the
              system full.
            </p>
          </div>
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          In general these two do not agree: an inside observer tracking elapsed
          time and an outside observer tallying lost calls are measuring
          genuinely different things, and for an arbitrary arrival process they
          can land on different values of <InlineMath math="B" />. Poisson
          arrivals are the special case where they don&apos;t diverge: because
          arrivals occur independently of the system&apos;s current state, an
          arriving call is exactly as likely to see the system full as a random
          point in time is to fall while the system is full. So for Poisson
          arrivals, the inside observer and the outside observer measure the{" "}
          <em>same</em> <InlineMath math="B" />. This is the{" "}
          <strong>PASTA property</strong> (Poisson Arrivals See Time Averages).
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          For Erlang-B specifically, PASTA means <strong>call blocking</strong>{" "}
          (the outside observer&apos;s measurement, from counting arrivals) and{" "}
          <InlineMath math="q(c)" /> (the inside observer&apos;s measurement,
          from tracking elapsed time) should come out equal, even though the
          simulation computes them from completely independent bookkeeping.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <tbody>
              <tr className="bg-emerald-50">
                <td className="px-2 py-1.5 rounded-l-lg text-slate-600">
                  Call blocking (fraction of arrivals)
                </td>
                <td className="px-2 py-1.5 rounded-r-lg font-mono font-semibold text-emerald-700 text-right">
                  0.2847075
                </td>
              </tr>
              <tr className="bg-emerald-50">
                <td className="px-2 py-1.5 rounded-l-lg text-slate-600">
                  q(5) (fraction of time system is full)
                </td>
                <td className="px-2 py-1.5 rounded-r-lg font-mono font-semibold text-emerald-700 text-right">
                  0.2847830
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="px-2 py-1.5 rounded-l-lg text-slate-600">
                  Analytical Erlang-B B(5, 5)
                </td>
                <td className="px-2 py-1.5 rounded-r-lg font-mono text-slate-500 text-right">
                  0.2848678
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The simulation measures both independently, from entirely different
          bookkeeping (counting blocked arrivals vs. accumulating
          time-in-state), and they land within 0.00008 of each other, both close
          to the closed-form Erlang-B value. That equality <em>is</em> PASTA,
          demonstrated empirically. It holds specifically because the arrivals
          were built as a genuine Poisson process (exponential interarrival
          times); with non-random arrivals, the two numbers could diverge.
        </p>
      </div>
    </section>
  );
}
