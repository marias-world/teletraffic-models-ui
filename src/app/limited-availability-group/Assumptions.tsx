import Link from "next/link";
import { InlineMath } from "react-katex";

export default function Assumptions() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Model Assumptions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-sky-800">
            🗂️ <InlineMath math="\ell" /> identical subgroups
          </p>
          <p className="text-sm text-slate-600">
            The model assumes the existence of <InlineMath math="\ell" />{" "}
            identical separate resources (subgroups), each with a capacity of{" "}
            <InlineMath math="C" /> b.u.
          </p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-sky-800">
            📐 Total capacity
          </p>
          <p className="text-sm text-slate-600">
            The total capacity of all resources is{" "}
            <InlineMath math="\ell \cdot C" /> b.u., i.e.{" "}
            <InlineMath math="V = \ell \cdot C" />.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-amber-800">
            🚫 No splitting
          </p>
          <p className="text-sm text-slate-600">
            A request cannot be divided across more than one resource: it must
            be served entirely by a single subgroup.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-emerald-700">
            🔗 Special case <InlineMath math="\ell = 1" />
          </p>
          <p className="text-sm text-slate-600">
            If there&apos;s only one resource (<InlineMath math="\ell = 1" />
            ), the model is identical to the{" "}
            <Link
              href="/kaufman-roberts"
              className="text-emerald-700 font-medium hover:underline"
            >
              Kaufman-Roberts
            </Link>{" "}
            model.
          </p>
        </div>
      </div>
    </section>
  );
}
