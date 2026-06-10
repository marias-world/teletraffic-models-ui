import Layout from "@/components/layout";
import { BlockMath, InlineMath } from "react-katex";
import Link from "next/link";

export default function GradeOfServicePage() {
  return (
    <Layout>
      <div className="min-h-screen p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-10">

          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              {" / "}
              <span>Theory &amp; Formulas</span>
              {" / "}
              <span className="text-slate-700">Grade of Service</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Blocking and Grade of Service (GoS)
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              How network quality is measured from the perspective of the subscriber.
            </p>
          </div>

          {/* What is GoS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">What is Grade of Service?</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Grade of Service (GoS)</strong> is the percentage of calls or users
              being blocked or delayed (for more than a specified interval), measured with
              reference to the <strong>busy hour</strong>, the period of the day when
              traffic intensity is at its maximum.
            </p>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sky-600 text-lg">💡</span>
                <h3 className="font-semibold text-sky-800">Why the busy hour?</h3>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                A network must be dimensioned for its worst case. Designing for the average
                load would leave too many calls blocked during peak times. GoS is therefore
                always defined with reference to the busy hour: if a system meets its GoS
                target at peak load, it will comfortably meet it at all other times.
              </p>
            </div>
          </section>

          {/* The formula */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">The Formula</h2>
            <p className="text-slate-600">
              GoS can be expressed in two equivalent ways, depending on whether you count
              calls or traffic:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <p className="text-sm font-semibold text-slate-600">In terms of calls</p>
                <div className="overflow-x-auto">
                  <BlockMath math="\text{GoS} = \frac{\text{total calls lost}}{\text{total calls offered}}" />
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <p className="text-sm font-semibold text-slate-600">In terms of traffic</p>
                <div className="overflow-x-auto">
                  <BlockMath math="\text{GoS} = \frac{\text{traffic lost}}{\text{traffic offered}}" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-amber-800">Key property: GoS ≤ 1</p>
              <p className="text-sm text-slate-700">
                Because lost traffic can never exceed offered traffic, GoS is always between
                0 and 1. A GoS of 0 means no calls are lost; a GoS of 1 means every call
                is blocked.
              </p>
              <p className="text-sm font-semibold text-slate-700 pt-1">
                The higher the GoS of a system, the worse the system performs.
              </p>
            </div>
          </section>

          {/* Setting GoS: trade-offs */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Choosing a GoS Target</h2>
            <p className="text-slate-600 leading-relaxed">
              Setting the GoS target is a balance between user experience and infrastructure
              cost. Both extremes cause problems:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-2">
                <p className="text-sm font-semibold text-red-700">GoS too high (e.g. 25%)</p>
                <p className="text-sm text-slate-600">
                  Users will complain about a large number of unsuccessful calls. The
                  network feels unreliable and unresponsive.
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-2">
                <p className="text-sm font-semibold text-orange-700">GoS too low (e.g. 0.001%)</p>
                <p className="text-sm text-slate-600">
                  The system will be under-loaded most of the time. Capacity is over-provisioned
                  and expensive resources sit idle.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-2">
              <p className="text-sm font-semibold text-emerald-700">Industry standard: GoS = 1%</p>
              <p className="text-sm text-slate-700">
                The widely accepted limit for GoS in telecommunication systems is{" "}
                <strong>1%</strong>, meaning at most 1 call out of every 100 may be lost
                during the busy hour. This is the benchmark used in erlang-B calculations.
              </p>
            </div>
          </section>

          {/* Carried, blocked and lost traffic */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Carried Traffic, Blocked Traffic and Lost Traffic
            </h2>
            <p className="text-slate-600 leading-relaxed">
              When a system has offered traffic <InlineMath math="a" /> (in erlangs) and a
              blocking probability <InlineMath math="B" />, the total traffic splits into
              two parts:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-600">Lost (blocked) traffic</p>
                <div className="overflow-x-auto">
                  <BlockMath math="\text{Lost traffic} = a \cdot B" />
                </div>
                <p className="text-sm text-slate-600">
                  The amount of traffic that cannot be serviced because no resources are
                  available. It is directly proportional to both the offered traffic and the
                  blocking probability.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-600">Carried traffic</p>
                <div className="overflow-x-auto">
                  <BlockMath math="\text{Carried traffic} = a - a \cdot B = a(1 - B)" />
                </div>
                <p className="text-sm text-slate-600">
                  The traffic that is successfully served by the system: the offered traffic
                  minus what is lost.
                </p>
              </div>

              <div className="bg-slate-100 rounded-lg p-3 text-sm text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Summary</p>
                <p>Offered traffic = Carried traffic + Lost traffic</p>
                <p><InlineMath math="a = a(1-B) + a \cdot B" /></p>
              </div>
            </div>

            {/* Worked example */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-700">Worked example</h3>
              <p className="text-slate-700 text-sm">
                A system has offered traffic <InlineMath math="a = 10" /> erlangs and a
                blocking probability of <InlineMath math="B = 0.1" /> (10% of calls are
                blocked).
              </p>
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <BlockMath math="\text{Lost traffic} = 10 \times 0.1 = 1 \text{ erl}" />
                </div>
                <div className="overflow-x-auto">
                  <BlockMath math="\text{Carried traffic} = 10 \times (1 - 0.1) = 10 \times 0.9 = 9 \text{ erl}" />
                </div>
              </div>
              <div className="bg-white border border-blue-100 rounded-lg p-3 text-sm text-slate-700">
                Of the 10 erlangs offered to the system, <strong>9 erlangs</strong> are
                successfully carried and <strong>1 erlang</strong> is lost to blocking.
              </div>
            </div>
          </section>

          {/* GoS vs Time Congestion */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              GoS vs Time Congestion
            </h2>
            <p className="text-slate-600 leading-relaxed">
              GoS and time congestion both describe blocking, but from different
              perspectives:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-2">
                <p className="text-sm font-semibold text-sky-700">Grade of Service (GoS)</p>
                <p className="text-sm text-slate-600">
                  A measure from the <strong>user's point of view</strong>. It
                  captures the proportion of calls that a user finds blocked when trying
                  to access the network.
                </p>
              </div>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 space-y-2">
                <p className="text-sm font-semibold text-violet-700">Time Congestion</p>
                <p className="text-sm text-slate-600">
                  A measure from the <strong>network or switching point of view</strong>.
                  It captures the proportion of time during which the system is fully
                  occupied and unable to accept new calls.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Delay systems (queueing systems)</p>
              <p className="text-sm text-slate-600">
                In delay systems, calls are not lost but placed in a queue. The
                inconvenience is measured not as a blocking probability but as a{" "}
                <strong>waiting time</strong>: how long a call must wait before being
                served.
              </p>
            </div>
          </section>

          {/* Reference */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">Reference</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Michael Logothetis, Ioannis D. Moscholios.{" "}
                <em>Efficient Multirate Teletraffic Loss Models Beyond Erlang</em>.
                Wiley-IEEE Press, 2019.{" "}
                <a
                  href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  onlinelibrary.wiley.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
