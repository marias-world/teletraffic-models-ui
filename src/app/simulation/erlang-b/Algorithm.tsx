import { BlockMath, InlineMath } from "react-katex";

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Step 1: Model the system as state + events",
    body: (
      <>
        The whole system is reduced to one number, <InlineMath math="n" />, the
        number of servers currently busy (<InlineMath math="0 \le n \le c" />
        ), and two kinds of events that change it: a call <em>arrives</em>, or a
        call <em>departs</em> (finishes and frees its server).
      </>
    ),
  },
  {
    title: "Step 2: Draw random times from exponential distributions",
    body: (
      <>
        Interarrival times are exponential with rate{" "}
        <InlineMath math="\lambda" /> (a Poisson arrival process), and each
        call&apos;s service time is exponential with rate{" "}
        <InlineMath math="\mu" />. Both are just random numbers with a
        &ldquo;short gaps common, long gaps rare&rdquo; shape: draw a random
        number, run it through a simple, standard trick that reshapes it into
        that pattern, then divide by the rate to make it match how busy the
        system is.
      </>
    ),
  },
  {
    title: "Step 3: Hold pending events in an ordered list",
    body: (
      <>
        <p>
          At any moment the simulation may have dozens of events waiting: every
          accepted call schedules a future departure, and every arrival
          schedules the next arrival. All of them sit in one event list as
          (time, type) pairs, and the simulation always needs whichever one
          happens soonest.
        </p>
        <p>
          Scanning the whole list every time to find the earliest event gets
          slow as it grows, which is why a real implementation keeps it in a{" "}
          <strong>heap</strong> (a data structure built to always hand back the
          smallest item quickly, without a full re-sort each time). Since the
          pairs are compared by time first, the heap doesn&apos;t need to know
          or care whether an event is an arrival or a departure, retrieving
          &ldquo;whichever happens next&rdquo; already resolves that question.
        </p>
      </>
    ),
  },
  {
    title: "Step 4: Jump the clock to the next event",
    body: (
      <>
        The clock jumps straight to whichever is sooner: the next scheduled
        arrival, or the earliest scheduled departure among the currently busy
        servers. Nothing of interest happens in between, so nothing is computed
        for it either.
      </>
    ),
  },
  {
    title: "Step 5: Handle an arrival",
    body: (
      <>
        If <InlineMath math="n < c" />, the call is accepted: a server becomes
        busy and a departure time is drawn and scheduled for it. If{" "}
        <InlineMath math="n = c" />, every server is busy, so the call is{" "}
        <strong>blocked</strong>, lost immediately, never queued or retried.
        Either way, the next arrival is drawn and scheduled right away.
      </>
    ),
  },
  {
    title: "Step 6: Handle a departure",
    body: (
      <>
        <p>
          A busy server finishes its call and becomes free again, decrementing{" "}
          <InlineMath math="n" /> by one. No new event needs to be drawn here,
          the freed server just waits for its next arrival to claim it.
        </p>
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <span className="text-amber-500 flex-shrink-0">💡</span>
          <p className="text-amber-900">
            A departure carries no identity: the model never tracks{" "}
            <em>which</em> call is occupying which server, only{" "}
            <em>how many </em> are occupied. Since every active call is
            statistically identical, it genuinely doesn&apos;t matter which one
            this departure conceptually belongs to, decrementing{" "}
            <InlineMath math="n" /> by one has the same effect regardless.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Step 7: Track time spent in each state",
    body: (
      <>
        <p>
          Before processing an event, the simulation adds the time that just
          elapsed to a running total for whatever state <InlineMath math="n" />{" "}
          the system was in. After the run, dividing each state&apos;s total by
          the total elapsed time gives the time-stationary distribution:
        </p>
        <div className="overflow-x-auto py-1">
          <BlockMath math="q(j) = \frac{\text{total time spent with } j \text{ busy servers}}{\text{total simulated time}}" />
        </div>
      </>
    ),
  },
  {
    title: "Step 8: Discard a warm-up period",
    body: (
      <>
        The system starts empty, which is not a typical state for it to be in,
        so the first slice of arrivals (e.g. 5%) gets an unfair advantage of
        extra free servers. The loop runs extra arrivals up front, changing the
        system state but excluded from every statistic, and only starts counting
        once the system reaches its normal behaviour, still ending up with the
        full intended number of counted calls.
      </>
    ),
  },
];

export default function Algorithm() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        3. Building the Simulation, Step by Step
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        This is exactly what the simulation does on every run, in order.
      </p>

      <div className="space-y-4">
        {STEPS.map(({ title, body }) => (
          <div
            key={title}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
          >
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <div className="text-slate-600 leading-relaxed text-sm space-y-2">
              {body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
