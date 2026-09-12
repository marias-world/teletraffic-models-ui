import Link from "next/link";
import { InlineMath } from "react-katex";

export default function Overview() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        1. What Discrete-Event Simulation Is
      </h2>

      <p className="text-slate-600 leading-relaxed">
        The{" "}
        <Link
          href="/erlang"
          className="text-sky-600 hover:underline font-medium"
        >
          Erlang-B formula
        </Link>{" "}
        gives the blocking probability of a loss system in closed form, but a
        closed-form answer is still just an answer someone derived on paper. A{" "}
        <strong>discrete-event simulation (DES)</strong> builds the same system
        from scratch, call by call, and lets the blocking probability{" "}
        <em>emerge</em> from that behaviour instead of from an equation, so it
        can be used to check whether the formula (and the assumptions behind it)
        actually holds.
      </p>

      <p className="text-slate-600 leading-relaxed">
        A DES has three ingredients:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-sky-800">🕒 Clock</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            A single number, the current simulation time. It jumps directly to
            the next thing that happens, it doesn&apos;t tick at fixed
            intervals.
          </p>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-violet-800">📋 Event list</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            A sorted list of (time, event type) pairs: things scheduled to
            happen in the future. The earliest one is always processed next.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-emerald-700">📊 State</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whatever variables describe the system right now, here, just the
            number of busy servers.
          </p>
        </div>
      </div>

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">🔁</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          The whole simulation loop is: pop the earliest event off the event
          list, advance the clock to its time, update the state based on the
          event type (arrival or departure), and repeat, until enough calls have
          been simulated.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-slate-700">
        The system being simulated
      </h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        This system is called <InlineMath math="M/M/c/c" />
      </p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
          <li>
            <span className="font-mono font-semibold text-slate-700">
              First M
            </span>
            : the arrival process is Markovian (Poisson), calls arrive at a
            random rate <InlineMath math="\lambda" /> with no memory of what
            came before.
          </li>
          <li>
            <span className="font-mono font-semibold text-slate-700">
              Second M
            </span>
            : service times are exponentially distributed, each call keeps its
            server for a random duration with rate <InlineMath math="\mu" /> per
            server.
          </li>
          <li>
            <span className="font-mono font-semibold text-slate-700">
              First c
            </span>
            : the number of identical parallel servers.
          </li>
          <li>
            <span className="font-mono font-semibold text-slate-700">
              Second c
            </span>
            : the system&apos;s maximum capacity is also <InlineMath math="c" />
            , no queue is allowed. If all <InlineMath math="c" /> servers are
            busy, an arriving call is blocked and lost rather than waiting.
          </li>
        </ul>
      </div>
      <p className="text-slate-600 leading-relaxed">
        Example: Total capacity <InlineMath math="c = 5" /> servers. Calls
        arrive at a mean rate of <InlineMath math="\lambda = 5" /> per minute,
        with exponentially distributed interarrival times, and each call stays
        in the system for a mean of <InlineMath math="1/\mu = 1" /> minute
        (service time). There is no queue: a call is either served immediately
        or blocked and gone.
      </p>
      <p className="text-slate-600 leading-relaxed text-sm">
        Two event types drive everything:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed text-sm">
        <li>
          <strong>Arrival</strong>: a request shows up. If a server is free,
          it&apos;s accepted, a server becomes busy, and a departure is
          scheduled for it. If every server is busy, the request is blocked; the
          state doesn&apos;t change.
        </li>
        <li>
          <strong>Departure</strong>: a served request finishes. One server
          becomes free again. Nothing else happens, no new event is scheduled.
        </li>
      </ul>
    </section>
  );
}
