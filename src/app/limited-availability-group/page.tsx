import Link from "next/link";
import "katex/dist/katex.min.css";
import Overview from "./Overview";
import Assumptions from "./Assumptions";
import OccupancyDistribution from "./OccupancyDistribution";
import BlockingProbability from "./BlockingProbability";
import ModelApproximations from "./ModelApproximations";
import Calculator from "./Calculator";
import AnimationSection from "./AnimationSection";
import References from "./References";

export default function LimitedAvailabilityGroupPage() {
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
              <span>Theory &amp; Formulas</span>
              {" / "}
              <span className="text-slate-700">
                Limited Availability Group Model
              </span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Limited Availability Group (LAG) Model
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              A network model where multiple separate resources, called
              subgroups, each handle their own share of the traffic.
            </p>
          </div>

          <Overview />
          <Assumptions />
          <OccupancyDistribution />
          <BlockingProbability />
          <ModelApproximations />
          <Calculator />
        </div>

        <AnimationSection />
        <References />
      </div>
    </div>
  );
}
