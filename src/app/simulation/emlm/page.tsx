import Link from "next/link";
import "katex/dist/katex.min.css";
import Overview from "./Overview";
import Orchestration from "./Orchestration";
import Pasta from "./Pasta";
import Calculator from "./Calculator";

export default function EmlmSimulationPage() {
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
              <span>Simulation</span>
              {" / "}
              <span className="text-slate-700">EMLM</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Discrete-Event Simulation: Erlang Multirate Loss Model (EMLM)
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              EMLM simulation of several service classes sharing one link.
            </p>
          </div>

          <Overview />
          <Orchestration />
          <Pasta />
          <Calculator />
        </div>
      </div>
    </div>
  );
}
