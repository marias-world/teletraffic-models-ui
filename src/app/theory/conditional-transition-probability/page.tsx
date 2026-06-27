"use client";

import Link from "next/link";
import CapacityConstraint from "../inclusion-exclusion/capacityConstraint";

export default function ConditionalTransitionProbabilityPage() {
  return (
    <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span className="text-slate-400">Theory</span>
              {" / "}
              <span className="text-slate-700">
                Conditional Transition Probability
              </span>
            </p>
            <h1 className="text-2xl font-bold text-slate-800">
              Conditional Transition Probability
            </h1>
          </div>

          <CapacityConstraint />
        </div>
      </div>
    </div>
  );
}
