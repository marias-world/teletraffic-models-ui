import { InlineMath } from "react-katex";
import Link from "next/link";
import { HoldingTimeDistributionsTable } from "@/components/HoldingTimeDistributions";

const LINK = "text-sky-600 hover:underline font-medium";

export default function InsensitivityPage() {
  return (
    <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
      <div className="max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-10">
        {/* Breadcrumb + title */}
        <div>
          <p className="text-sm text-slate-500 mb-2">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            {" / "}
            <span>Theory &amp; Formulas</span>
            {" / "}
            <span className="text-slate-700">Insensitivity Property</span>
          </p>
          <h1 className="text-3xl font-bold text-slate-800">
            The Insensitivity Property
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            DES Simulation: Erlang-B and EMLM. Blocking probability is
            unaffected by the variability in individual call durations, provided
            that the average call duration remains unchanged. Calls need to be
            independent and to arrive as a Poisson process.
          </p>
        </div>

        {/* What it says */}
        <section className="space-y-4">
          <h2 className="text-xl text-slate-700">What it says</h2>
          <p className="text-slate-600 leading-relaxed">
            In the{" "}
            <Link href="/simulation/erlang-b" className={LINK}>
              Erlang-B
            </Link>{" "}
            and{" "}
            <Link href="/simulation/emlm" className={LINK}>
              EMLM
            </Link>{" "}
            DES simulations, the blocking probability depends on the call
            holding time only through its mean <InlineMath math="h = 1/\mu" />,
            not through the <em>shape</em> of its distribution. Calls that all
            last exactly <InlineMath math="h" />, calls with an exponentially
            distributed length, and calls with a very skewed length give the
            same blocking, as long as the mean is the same.
          </p>
        </section>

        {/* The distributions */}
        <section className="space-y-4">
          <h2 className="text-xl text-slate-700">Same mean, different shape</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            The Erlang-B and EMLM simulations on this site let you swap the
            holding-time distribution while keeping its mean fixed. Below there
            are five options, how each one draws a call length, and how much its
            call lengths vary.
          </p>
          <HoldingTimeDistributionsTable reference="both" />
        </section>

        {/* Try it */}
        <section className="space-y-4">
          <h2 className="text-xl text-slate-700">See it for yourself</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Both simulation calculators have a holding-time distribution
            dropdown, with editable parameters. Run the same system with each
            distribution in turn and compare the simulated blocking probability
            with the analytical value. If the shape changes and the blocking
            does not, the property holds.
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>
              <Link href="/simulation/erlang-b" className={LINK}>
                Erlang-B simulation
              </Link>
              : one class of calls, one server per call.
            </li>
            <li>
              <Link href="/simulation/emlm" className={LINK}>
                EMLM simulation
              </Link>
              : several service classes sharing one link, one chart per class.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
