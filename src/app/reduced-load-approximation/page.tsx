import Link from "next/link";
import "katex/dist/katex.min.css";
import Overview from "./Overview";
import NetworkExample from "./NetworkExample";
import Formula from "./Formula";
import WorkedExample from "./WorkedExample";
import Assumptions from "./Assumptions";
import Calculator from "./Calculator";
import AnimationSection from "./AnimationSection";

export default function ReducedLoadApproximationPage() {
  return (
    <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-10">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span>Models</span>
              {" / "}
              <span className="text-slate-700">Reduced Load Approximation</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Reduced Load Approximation (RLA) Model
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              A model for calls that cross a network of links, where a call is
              accepted only if every link on its route has room.
            </p>
          </div>

          <Overview />
          <NetworkExample />
          <Formula />
          <Assumptions />

          <Calculator />
          <AnimationSection />
          <WorkedExample />
          {/* References */}
          <section className="border-t border-slate-200 pt-6 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              References
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dziong, Z. and Roberts, J. (1987, November).{" "}
              <em>
                Congestion probabilities in a circuit switched integrated
                services network
              </em>
              . Performance Evaluation, Vol. 7, Issue 4, pp. 267-284.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Moscholios, I. D., &amp; Logothetis, M. D. (2019).{" "}
              <em>Efficient multirate teletraffic loss models beyond Erlang</em>
              . John Wiley &amp; Sons Ltd.{" "}
              <a
                href="https://doi.org/10.1002/9781119426974"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                https://doi.org/10.1002/9781119426974
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
