import { InlineMath } from "react-katex";

function SubgroupBox({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <div className="border border-slate-300 rounded-lg w-16 divide-y divide-dashed divide-slate-300 bg-slate-50">
        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="h-6 flex items-center justify-center text-xs text-slate-500"
          >
            {row}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">C = 4</p>
    </div>
  );
}

export default function Overview() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Overview</h2>
      <p className="text-slate-600 leading-relaxed">
        In the <strong>LAG model</strong> (also referred to as the{" "}
        <strong>Limited Availability Resources, LAR, model</strong>), the
        total capacity of the system is not a single shared pool. Instead, it
        is split into <InlineMath math="\ell" /> separate resources, called{" "}
        <strong>subgroups</strong>, each with its own capacity.
      </p>

      {/* subgroup diagram */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
          Subgroups
        </p>
        <div className="w-full overflow-x-auto">
          <div className="flex items-end justify-center gap-4 py-1 min-w-max mx-auto">
            <SubgroupBox label="1" />
            <SubgroupBox label="2" />
            <span className="text-slate-400 text-lg pb-6">&hellip;</span>
            <SubgroupBox label={"ℓ"} />
          </div>
        </div>
        <p className="text-center text-sm text-slate-600 whitespace-nowrap">
          Total system capacity&nbsp;
          <InlineMath math="V = \ell \cdot C" />
        </p>
      </div>
    </section>
  );
}
