"use client";

import { BlockMath } from "react-katex";

export default function ErlangExplanation() {
  return (
    <div className="pt-8 border-t border-slate-200 space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">
        {" "}
        Recursive form of the Erlang-B formula
      </h3>

      <BlockMath
        math={
          "B = E_C(\\alpha) = \\frac{\\frac{\\alpha^C}{C!}}{\\sum_{i=0}^{C} \\frac{\\alpha^i}{i!}}"
        }
      />

      {/* Symbol Explanation */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-semibold text-slate-700">Where:</h4>

        <ul className="space-y-2 text-slate-700">
          <li>
            <strong>B</strong> = Blocking probability
          </li>
          <li>
            <strong>C</strong> = Number of available servers
            (channels/operators)
          </li>
          <li>
            <strong>α </strong> = Offered traffic in Erlangs (erl)
          </li>
        </ul>
      </div>

      {/* Blocking Explanation */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-3">
        <h4 className="font-semibold text-blue-800">
          What Does “Blocking” Mean?
        </h4>

        <p className="text-slate-700">
          Blocking occurs when all servers are busy and a new incoming call
          arrives. Since Erlang B assumes no waiting queue, the call is
          immediately rejected.
        </p>

        <p className="text-slate-700">
          The blocking probability represents the likelihood that a user is
          denied service due to insufficient capacity.
        </p>

        <p className="text-slate-700">
          For example, if <strong>B = 0.02</strong>, then approximately 2% of
          incoming calls are lost.
        </p>
      </div>
    </div>
  );
}
