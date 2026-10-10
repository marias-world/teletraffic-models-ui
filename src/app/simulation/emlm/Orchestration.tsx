import { InlineMath } from "react-katex";

const POINTS: { title: string; body: React.ReactNode }[] = [
  {
    title: "State is occupied bandwidth",
    body: (
      <>
        The state is <InlineMath math="n" />, the number of b.u. occupied (
        <InlineMath math="0 \le n \le C" />
        ). Calls occupy different bandwidth.
      </>
    ),
  },
  {
    title: "One arrival stream per class, derived from offered load",
    body: (
      <>
        You specify each class&apos;s offered load <InlineMath math="a_k" />{" "}
        (the quantity Kaufman-Roberts works with) and its service rate.
      </>
    ),
  },
  {
    title: "Event list: one pending arrival per class, one departure per call",
    body: (
      <>
        The earliest pending event is always processed next. Every call holds at
        least 1 b.u., so at most <InlineMath math="C" /> calls can be in
        progress at once.
      </>
    ),
  },
  {
    title: "Complete-sharing admission",
    body: (
      <>
        When a class-
        <InlineMath math="k" /> call arrives, it is accepted if{" "}
        <InlineMath math="n + b_k \le C" />. Otherwise it is blocked. Admission
        depends on how much room is left, a call needing 4 b.u. can be blocked
        at a moment when a call needing 1 b.u. would still fit, which is why
        blocking differs by class.
      </>
    ),
  },
  {
    title: "Counting: warm-up, per-class counters, time in each state",
    body: (
      <>
        As in Erlang-B, the first slice of arrivals (5%) warms the system up and
        is excluded from every statistic. After that each class keeps its own
        offered, accepted and blocked counts, and the time spent at each
        occupancy <InlineMath math="n" /> is accumulated to get{" "}
        <InlineMath math="q(j)" />.
      </>
    ),
  },
  {
    title: "Insensitivity property",
    body: (
      <>
        Blocking depends on the holding time only through its mean{" "}
        <InlineMath math="1/\mu_k" />, not its shape. If we swap the exponential
        for a deterministic, Erlang-2, hyperexponential or lognormal
        distribution with the same mean, then the results should barely change.
      </>
    ),
  },
  {
    title: "Replications run in parallel, one per seed",
    body: <>Each seed is an independent run. They are executed in parallel.</>,
  },
];

export default function Orchestration() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        2. How the Simulation Is Orchestrated
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        The loop is the same as in Erlang-B: pop the earliest event, advance the
        clock, update the state. These are the parts that change, or were added,
        for several classes.
      </p>

      <div className="space-y-4">
        {POINTS.map(({ title, body }) => (
          <div
            key={title}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
          >
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <div className="text-slate-600 leading-relaxed text-sm">{body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
