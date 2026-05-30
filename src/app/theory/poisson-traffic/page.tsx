import Layout from "@/components/layout";
import { BlockMath, InlineMath } from "react-katex";
import Link from "next/link";

export default function PoissonTrafficPage() {
  return (
    <Layout>
      <div className="min-h-screen p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">

          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              {" / "}
              <span>Theory & Formulas</span>
              {" / "}
              <span className="text-slate-700">Poisson Traffic</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">Poisson Traffic</h1>
          </div>

          {/* What is it */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">What is Poisson Traffic?</h2>
            <p className="text-slate-600 leading-relaxed">
              In teletraffic theory, <strong>Poisson traffic</strong> is a model for call (or request)
              arrivals where events occur randomly and independently of one another at a constant
              average rate. It is the standard assumption underlying classical models such as Erlang-B.
            </p>
            <p className="text-slate-600 leading-relaxed">
              A traffic source is said to be Poisson if the number of arrivals in any time interval of
              length <InlineMath math="t" /> follows a Poisson distribution, and the time between
              successive arrivals follows an exponential distribution.
            </p>
          </section>

          {/* The formula */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">The Poisson Distribution</h2>
            <p className="text-slate-600">
              The probability that exactly <InlineMath math="n" /> calls arrive during a time
              interval of length <InlineMath math="t" /> is:
            </p>
            <BlockMath math="P_n(t) = \frac{(\lambda t)^n}{n!}\,e^{-\lambda t} \qquad \text{for } n = 0, 1, 2, \ldots" />

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-semibold text-slate-700">Where:</h3>
              <ul className="space-y-2 text-slate-600">
                <li><InlineMath math="\lambda" /> — average call arrival rate (calls per unit time)</li>
                <li><InlineMath math="t" /> — length of the observation interval</li>
                <li><InlineMath math="n" /> — number of arrivals (<InlineMath math="n = 0, 1, 2, \ldots" />)</li>
                <li><InlineMath math="e" /> — Euler's number (<InlineMath math="\approx 2.718" />)</li>
                <li><InlineMath math="n!" /> — factorial of <InlineMath math="n" /></li>
              </ul>
            </div>
            <p className="text-slate-500 text-sm">
              Named after Siméon Denis Poisson, French mathematician and physicist (1781–1840).
            </p>
          </section>

          {/* Poisson <-> Exponential duality */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Poisson Arrivals and Exponential Interarrival Times
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Saying that <em>arrivals are Poisson distributed</em> and saying that{" "}
              <em>interarrival times are exponentially distributed</em> are two ways of
              describing the same process. They are equivalent — one implies the other.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-semibold text-slate-700">Poisson view — counting arrivals</h3>
                <p className="text-slate-600">
                  You pick a fixed time window and ask:{" "}
                  <em>"how many calls arrived in that window?"</em>
                </p>
                <p className="text-slate-600">
                  <strong>Example:</strong> a call centre receives on average{" "}
                  <InlineMath math="\lambda = 2" /> calls per minute. In any given
                  minute, the number of calls is random — sometimes 0, sometimes 1,
                  sometimes 4. The Poisson formula gives the probability of each count:
                </p>
                <BlockMath math="P_0 = e^{-2} \approx 13.5\% \quad P_1 = 2e^{-2} \approx 27\% \quad P_2 = \tfrac{4}{2}e^{-2} \approx 27\%" />
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-semibold text-slate-700">Exponential view — time between arrivals</h3>
                <p className="text-slate-600">
                  Instead of counting, you watch the clock and ask:{" "}
                  <em>"how long until the next call arrives?"</em>
                </p>
                <p className="text-slate-600">
                  <strong>Example:</strong> with <InlineMath math="\lambda = 2" /> calls
                  per minute, the average wait for the next call is{" "}
                  <InlineMath math="1/\lambda = 0.5" /> minutes (30 seconds).
                  But the wait is random — sometimes 5 seconds, sometimes 90 seconds.
                  Short gaps are more likely than long ones:
                </p>
                <BlockMath math="f(t) = 2\,e^{-2t}" />
                <p className="text-slate-600 text-sm">
                  The probability the next call takes <strong>more than 1 minute</strong>{" "}
                  is <InlineMath math="e^{-2} \approx 13.5\%" /> — the same value as{" "}
                  <InlineMath math="P_0" /> above. That is not a coincidence.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 space-y-3">
              <h3 className="font-semibold text-amber-800">Why they are the same thing</h3>
              <p className="text-slate-700">
                "No call arrives in the next minute" and "the next call takes longer than
                one minute" are the same event, just described differently. So their
                probabilities must be equal:
              </p>
              <BlockMath math="P_0(t) = e^{-\lambda t} = P(T > t)" />
              <p className="text-slate-700">
                This is why the two descriptions are equivalent — if arrivals are Poisson,
                the gaps between them must be exponential, and vice versa.
              </p>
            </div>
          </section>

          {/* Key properties */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">Key Properties</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>
                <strong>Memoryless:</strong> the time since the last arrival tells you nothing about
                when the next one will come.
              </li>
              <li>
                <strong>Mean = Variance:</strong> both equal <InlineMath math="\lambda" />, which is
                a distinguishing property of the Poisson distribution.
              </li>
              <li>
                <strong>Superposition:</strong> the sum of independent Poisson streams is also Poisson,
                making it easy to model traffic from many independent sources.
              </li>
              <li>
                <strong>PASTA (Poisson Arrivals See Time Averages):</strong> arriving calls observe
                the system in its steady-state distribution — a key result used in queueing theory.
              </li>
            </ul>
          </section>

          {/* Worked example */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Worked Example</h2>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
              <p className="text-slate-700">
                A telephone exchange receives on average <strong>3 calls per minute</strong>{" "}
                (<InlineMath math="\lambda = 3" />). What is the probability that exactly 5 calls
                arrive in the next minute (<InlineMath math="t = 1" />)?
              </p>
              <BlockMath math="P_5(1) = \frac{(3 \cdot 1)^5}{5!}\,e^{-3 \cdot 1} = \frac{243}{120} \cdot e^{-3} \approx 2.025 \cdot 0.04979 \approx 0.1008" />
              <p className="text-slate-700">
                There is approximately a <strong>10.1%</strong> chance of exactly 5 calls arriving
                in that minute.
              </p>
            </div>
          </section>

          {/* Connection to Erlang */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">Connection to Erlang-B</h2>
            <p className="text-slate-600 leading-relaxed">
              The Erlang-B formula assumes Poisson arrivals with rate <InlineMath math="\lambda" />{" "}
              and exponentially distributed call holding times with mean{" "}
              <InlineMath math="1/\mu" />. The offered traffic intensity is then:
            </p>
            <BlockMath math="\alpha = \frac{\lambda}{\mu}" />
            <p className="text-slate-600 leading-relaxed">
              This dimensionless quantity <InlineMath math="\alpha" />, measured in <strong>Erlangs</strong>,
              is the single parameter you supply to the Erlang-B model alongside the system capacity{" "}
              <InlineMath math="C" />.
            </p>
            <div className="pt-2">
              <Link
                href="/erlang"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Try the Erlang-B Model →
              </Link>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
