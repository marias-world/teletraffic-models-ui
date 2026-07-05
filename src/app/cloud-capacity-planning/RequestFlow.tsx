import { InlineMath } from "react-katex";

function PMBox({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1 border border-slate-400 rounded-md bg-slate-50 px-1.5 py-1 sm:px-3 sm:py-2">
      <p className="text-[10px] sm:text-sm font-semibold text-slate-700">
        {label}
      </p>
      {["C_P", "C_R", "C_D", "C_{bps}"].map((c) => (
        <p
          key={c}
          className="text-[9px] sm:text-xs font-mono text-slate-600 leading-tight"
        >
          <InlineMath math={c} />
        </p>
      ))}
    </div>
  );
}

function GroupManagerBlock() {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2.5">
      <div className="border border-violet-400 bg-violet-50 rounded-lg px-2 py-1 sm:px-4 sm:py-2 text-[11px] sm:text-base font-semibold text-violet-800 whitespace-nowrap">
        Group Manager
      </div>
      <span className="text-slate-500 text-xs sm:text-lg font-bold">↓</span>
      <div className="flex items-end gap-1 sm:gap-2">
        <PMBox label="PM₁" />
        <span className="text-slate-500 text-xs sm:text-base pb-3 sm:pb-4">
          &hellip;
        </span>
        <PMBox label="PMₜ" />
      </div>
    </div>
  );
}

export default function RequestFlow() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Request Flow</h2>

      <p className="text-slate-600 leading-relaxed text-sm">
        When a VM request arrives, the{" "}
        <strong>Main Resource Manager (MRM)</strong> first picks a{" "}
        <strong>Group Manager (GM)</strong> to handle it. That Group Manager
        then looks through its own group of <InlineMath math="T" /> physical
        machines (PMs) for one with enough free processor, RAM, disk, and
        network capacity to fit the request. As soon as it finds a PM that
        fits, it starts the VM there.
      </p>

      {/* Diagram */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-8 overflow-x-auto">
        <div className="flex flex-col items-center gap-1.5 sm:gap-3 min-w-max mx-auto">
          {/* Request */}
          <div className="border border-dashed border-sky-400 bg-sky-50 rounded-lg px-3 py-1.5 sm:px-5 sm:py-3 text-center">
            <p className="text-xs sm:text-base font-semibold text-sky-900">
              New service-class <InlineMath math="k" /> VM request
            </p>
            <p className="text-[10px] sm:text-sm font-mono text-sky-700">
              <InlineMath math="(b_{k,P}, b_{k,R}, b_{k,D}, b_{k,bps})" />
            </p>
          </div>

          <span className="text-slate-500 text-xs sm:text-lg font-bold">
            ↓
          </span>

          {/* MRM */}
          <div className="border border-slate-400 bg-white rounded-lg px-4 py-1.5 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold text-slate-800">
            Main Resource Manager
          </div>

          <span className="text-slate-500 text-xs sm:text-lg font-bold">
            ↓
          </span>

          {/* Group managers */}
          <div className="flex items-start gap-6 sm:gap-12">
            <GroupManagerBlock />
            <span className="text-slate-500 text-xs sm:text-lg self-center">
              &hellip;
            </span>
            <GroupManagerBlock />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        A service-class <InlineMath math="k" /> VM request in the IaaS
        architecture. The path from request to an available PM (as shown
        above) is one possible route through the managers.
      </p>
    </section>
  );
}
