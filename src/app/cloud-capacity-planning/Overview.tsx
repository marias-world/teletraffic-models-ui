import Image from "next/image";
import { InlineMath } from "react-katex";

export default function Overview() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Overview</h2>

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

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          Hanczewski, Stasiak, and Weissenberg (2021) introduced an analytical
          model that treats each physical resource dimension (processors, RAM,
          storage, networking) as a separate capacity constraint. A VM call of
          class <InlineMath math="k" /> is accepted only when the system has
          enough free units of <em>every</em> resource it requires
          simultaneously. If any single dimension is full, the call is blocked,
          even if the remaining resources have spare capacity.
        </p>
      </div>

      {/* Four resource dimensions */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
          Four resources, checked at once
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              src: "/images/cpu.png",
              label: "Processor",
              symbol: "P",
              classes: "bg-sky-50 border-sky-200",
            },
            {
              src: "/images/ram.png",
              label: "RAM",
              symbol: "R",
              classes: "bg-violet-50 border-violet-200",
            },
            {
              src: "/images/ssd.png",
              label: "Disk",
              symbol: "D",
              classes: "bg-amber-50 border-amber-200",
            },
            {
              src: "/images/rate.png",
              label: "Network",
              symbol: "bps",
              classes: "bg-emerald-50 border-emerald-200",
            },
          ].map(({ src, label, symbol, classes }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${classes}`}
            >
              <Image src={src} alt={label} width={32} height={32} />
              <p className="text-xs font-semibold text-slate-700">{label}</p>
              <p className="text-[11px] font-mono text-slate-400">{symbol}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-violet-900 leading-relaxed">
          Requests for a given VM type (class <InlineMath math="k" />) arrive at
          random, at some average rate <InlineMath math="\lambda_k" />. Each
          request needs a fixed amount of the four resources above, all at once.
          If there is enough free room in <em>all four</em> right now, the VM is
          created and stays running for some random amount of time (on average{" "}
          <InlineMath math="1/\mu_k" />) before it finishes and releases its
          resources. If even one of the four resources does not have enough
          room, the request is rejected outright, it is not queued or retried,
          it is simply lost.
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed">
        The model combines the strengths of three models: the{" "}
        <a
          href="/kaufman-roberts"
          className="text-sky-600 hover:underline font-medium"
        >
          Kaufman-Roberts model
        </a>
        , which handles multiple service classes sharing a single resource; the{" "}
        <a
          href="/limited-availability-group"
          className="text-sky-600 hover:underline font-medium"
        >
          Limited Availability Group (LAG) model
        </a>
        , which introduces structured access restrictions across resource
        groups; and the{" "}
        <a
          href="/reduced-load-approximation"
          className="text-sky-600 hover:underline font-medium"
        >
          Reduced Load Approximation (RLA)
        </a>
        , which extends the analysis to multi-link networks by iteratively
        accounting for blocking across routes.
      </p>
    </section>
  );
}
