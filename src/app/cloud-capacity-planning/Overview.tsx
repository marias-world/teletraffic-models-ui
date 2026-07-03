import { InlineMath } from "react-katex";

export default function Overview() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Overview</h2>

      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">🚧</span>
        <p className="text-sm text-amber-900 leading-relaxed">
          This page is under construction. More content, formulas, and examples
          will be added shortly.
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed">
        <a
          href="https://aws.amazon.com/what-is/iaas/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-700 hover:underline"
        >
          Infrastructure as a Service (IaaS)
        </a>{" "}
        is a cloud model where providers rent out computing resources such as
        processing power, memory, and storage over the internet, typically
        charged by usage. Customers request virtual machines (VMs) on demand,
        each specifying the exact amount of CPU, RAM, Networking, and disk it
        requires. The provider runs those VMs on a finite pool of physical
        servers, so every request must fit within the available capacity across
        all resource types at once.
      </p>

      <p className="text-slate-600 leading-relaxed">
        Hanczewski, Stasiak, and Weissenberg (2021) introduced an analytical
        model that treats each physical resource dimension (processors, RAM,
        storage, networking) as a separate capacity constraint. A VM call of
        class <InlineMath math="k" /> is accepted only when the system has
        enough free units of <em>every</em> resource it requires simultaneously.
        If any single dimension is full, the call is blocked, even if the
        remaining resources have spare capacity.
      </p>
    </section>
  );
}
