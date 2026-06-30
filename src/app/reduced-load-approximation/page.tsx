import Link from "next/link";
import "katex/dist/katex.min.css";
import Overview from "./Overview";
import NetworkExample from "./NetworkExample";
import Formula from "./Formula";
import WorkedExample from "./WorkedExample";
import Assumptions from "./Assumptions";

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
          <WorkedExample />
          <Assumptions />

          {/* Reference */}
          <section className="border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-400 leading-relaxed">
              Dziong, Z. and Roberts, J. (1987, November).{" "}
              <em>
                Congestion probabilities in a circuit switched integrated
                services network
              </em>
              . Performance Evaluation, Vol. 7, Issue 4, pp. 267-284.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
