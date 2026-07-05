import Image from "next/image";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";

const STEP1_RESULTS = [
  { dim: "P", label: "C_P = 18", values: ["0.01199", "0.02896", "0.05240"] },
  { dim: "R", label: "C_R = 17", values: ["0.01718", "0.04090", "0.07281"] },
  { dim: "D", label: "C_D = 19", values: ["0.11369", "0.17947", "0.25110"] },
  {
    dim: "bps",
    label: "C_{bps} = 20",
    values: ["0.09617", "0.15362", "0.21644"],
  },
];

const STEP2_RESULTS = [
  { dim: "P", label: "C_P = 18", values: ["0.00011", "0.00065", "0.00182"] },
  { dim: "R", label: "C_R = 17", values: ["0.00030", "0.00168", "0.00452"] },
  { dim: "D", label: "C_D = 19", values: ["0.03011", "0.06846", "0.11574"] },
  {
    dim: "bps",
    label: "C_{bps} = 20",
    values: ["0.02088", "0.04855", "0.08386"],
  },
];

const STEP3_RESULTS = [
  { dim: "P", label: "C_P = 18", values: ["0.00924", "0.02242", "0.03466"] },
  { dim: "R", label: "C_R = 17", values: ["0.01738", "0.04108", "0.06206"] },
  { dim: "D", label: "C_D = 19", values: ["0.26481", "0.38145", "0.46094"] },
  {
    dim: "bps",
    label: "C_{bps} = 20",
    values: ["0.21711", "0.31602", "0.38743"],
  },
];

const PM_CAPACITY = [
  { label: "C_P", value: 18 },
  { label: "C_R", value: 17 },
  { label: "C_D", value: 19 },
  { label: "C_{bps}", value: 20 },
];

const SERVICE_CLASSES = [
  {
    k: 1,
    instance: "m9g.medium",
    vcpu: 1,
    ram: 1,
    disk: 2,
    network: 2,
  },
  {
    k: 2,
    instance: "m9g.large",
    vcpu: 2,
    ram: 2,
    disk: 3,
    network: 3,
  },
  {
    k: 3,
    instance: "m9g.xlarge",
    vcpu: 3,
    ram: 3,
    disk: 4,
    network: 4,
  },
];

export default function WorkedExample() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Worked Example: AWS EC2 Instance Types as Service Classes
      </h2>

      <p className="text-slate-600 leading-relaxed text-sm">
        To make the model concrete, consider a{" "}
        <a
          href="https://aws.amazon.com/ec2/instance-types/m9g/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline font-medium"
        >
          general-purpose family of AWS EC2 instances (m9g)
        </a>
        . Each instance size becomes a service class <InlineMath math="k" />:
        the bigger the instance, the more processor, RAM, and disk it demands
        from the physical machine that hosts it.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs font-semibold text-slate-400 tracking-wider">
              <th className="text-left px-2">Class</th>
              <th className="text-left px-2">Instance type</th>
              <th className="text-left px-2">
                vCPU (<InlineMath math="b_{k,P}" />)
              </th>
              <th className="text-left px-2">
                RAM GiB (<InlineMath math="b_{k,R}" />)
              </th>
              <th className="text-left px-2">
                Disk GB (<InlineMath math="b_{k,D}" />)
              </th>
              <th className="text-left px-2">
                Network Gbps (<InlineMath math="b_{k,bps}" />)
              </th>
            </tr>
          </thead>
          <tbody>
            {SERVICE_CLASSES.map((row) => (
              <tr key={row.k} className="bg-slate-50">
                <td className="px-2 py-2 rounded-l-lg font-semibold text-slate-500">
                  k{row.k}
                </td>
                <td className="px-2 py-2 font-mono text-slate-700">
                  {row.instance}
                </td>
                <td className="px-2 py-2 text-slate-600">{row.vcpu}</td>
                <td className="px-2 py-2 text-slate-600">{row.ram}</td>
                <td className="px-2 py-2 text-slate-600">{row.disk}</td>
                <td className="px-2 py-2 rounded-r-lg text-slate-600">
                  {row.network}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          A class-1 request (m9g.medium) needs 1 vCPU, 1 GiB of RAM, 2 GB of
          disk, and 2 Gbps of network bandwidth. A class-3 request (m9g.xlarge)
          needs 3 vCPU, 3 GiB of RAM, 4 GB of disk, and 4 Gbps of network
          bandwidth, the largest demand on every resource. Once a PM has
          accepted a VM, that amount is reserved on all four resources until the
          VM finishes.
        </p>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        These figures are illustrative, chosen to show how instance sizes
        translate into resource-demand vectors{" "}
        <InlineMath math="(b_{k,P}, b_{k,R}, b_{k,D}, b_{k,bps})" />, and do not
        necessarily match the exact published specifications of the m9g family.
      </p>

      <p className="text-slate-600 leading-relaxed text-sm">
        Let's consider the case of <InlineMath math="K = 3" /> service classes
        and <InlineMath math="T = 3" /> PMs.
      </p>
      <p className="text-slate-600 leading-relaxed text-sm">
        Each subresource (CPU, RAM, DISK, Network) contains the following
        capacities <InlineMath math="C_P = 18" />,{" "}
        <InlineMath math="C_R = 17" />, <InlineMath math="C_D = 19" />, and{" "}
        <InlineMath math="C_{bps} = 20" />.
      </p>

      {/* PM group visual */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-start justify-center gap-4 sm:gap-8 min-w-max mx-auto">
          {[1, 2, 3].map((pm) => (
            <div key={pm} className="flex flex-col items-center gap-1.5">
              <Image
                src="/images/server.png"
                alt={`Physical machine ${pm}`}
                width={96}
                height={96}
                className="w-14 sm:w-24 h-auto"
              />
              <p className="text-sm sm:text-base font-semibold text-slate-700">
                PM{pm}
              </p>
              <div className="flex flex-col items-center gap-0.5">
                {PM_CAPACITY.map(({ label, value }) => (
                  <p
                    key={label}
                    className="text-xs sm:text-sm font-mono text-slate-500"
                  >
                    <InlineMath math={label} /> = {value}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        The <InlineMath math="T = 3" /> identical PMs of a Group Manager, each
        with the same capacity across all four resource dimensions.
      </p>

      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">📊</span>
        <p className="text-sm text-violet-900 leading-relaxed">
          Offered traffic-load of each service class (in erl):{" "}
          <InlineMath math="\alpha_1 = 3.0" />,{" "}
          <InlineMath math="\alpha_2 = 1.5" />,{" "}
          <InlineMath math="\alpha_3 = 1.0" />. See{" "}
          <Link
            href="/theory/traffic-load"
            className="text-violet-700 font-medium hover:underline"
          >
            Traffic Load
          </Link>{" "}
          for what this quantity means and how it is calculated.
        </p>
      </div>

      {/* Step 1: Kaufman-Roberts per subsystem */}
      <div className="border-t border-slate-200 pt-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Step 1 (Applying the Kaufman-Roberts (EMLM) in each subsystem)
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Each of the four resources, processor, RAM, disk, and network, is
          treated as its own single-resource system. We calculate the blocking
          probability of every service class in each subsystem separately, using
          the{" "}
          <Link
            href="/kaufman-roberts"
            className="text-sky-600 hover:underline font-medium"
          >
            Kaufman-Roberts formula (EMLM)
          </Link>
          , with capacity <InlineMath math="C_P, C_R, C_D, C_{bps}" /> and
          demands <InlineMath math="b_{k,P}, b_{k,R}, b_{k,D}, b_{k,bps}" />{" "}
          respectively.
        </p>

        <div className="overflow-x-auto">
          <BlockMath math="q(j) = \frac{1}{j}\sum_{k=1}^{K} \alpha_k \cdot b_k \cdot q(j-b_k), \qquad B_{k,\text{EMLM}} = \sum_{j=C-b_k+1}^{C} Q(j)" />
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Output
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left px-2">Subsystem</th>
                <th className="text-left px-2">Class 1</th>
                <th className="text-left px-2">Class 2</th>
                <th className="text-left px-2">Class 3</th>
              </tr>
            </thead>
            <tbody>
              {STEP1_RESULTS.map(({ dim, label, values }) => (
                <tr key={dim} className="bg-slate-50">
                  <td className="px-2 py-2 rounded-l-lg font-mono text-slate-700">
                    <InlineMath math={label} />
                  </td>
                  {values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 text-slate-600 font-mono ${
                        i === values.length - 1 ? "rounded-r-lg" : ""
                      }`}
                    >
                      <InlineMath
                        math={`B_{${i + 1},\\text{EMLM},${dim}} = ${v}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Each subsystem sees only the classes competing for that one resource,
          so blocking is worst on disk (the tightest capacity relative to
          demand) and lowest on processor.
        </p>
      </div>

      {/* Step 2: LAR across the T subsystems */}
      <div className="border-t border-slate-200 pt-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Step 2 (Applying the LAR model in the group of the{" "}
          <InlineMath math="T = 3" /> subsystems)
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Now we look at the group of <InlineMath math="T = 3" /> PMs together,
          rather than one at a time. Since the PMs are identical and each
          behaves as a separate resource of the same form (processor, RAM, disk,
          network), the group is modelled with the{" "}
          <Link
            href="/limited-availability-group"
            className="text-sky-600 hover:underline font-medium"
          >
            Limited Availability Resources (LAR) model
          </Link>
          , which determines the blocking probability of each class across all{" "}
          <InlineMath math="T" /> subsystems at once.
        </p>

        <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
          <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
            📊
          </span>
          <p className="text-sm text-violet-900 leading-relaxed">
            Because a request can now be placed in any of the{" "}
            <InlineMath math="T = 3" /> PMs, the group as a whole carries three
            times the traffic of a single PM: the offered traffic-load of each
            service class is three times higher than in Step 1, i.e.{" "}
            <InlineMath math="\alpha_1 = 9.0" />,{" "}
            <InlineMath math="\alpha_2 = 4.5" />, and{" "}
            <InlineMath math="\alpha_3 = 3.0" /> erl. See{" "}
            <Link
              href="/theory/traffic-load"
              className="text-violet-700 font-medium hover:underline"
            >
              Traffic Load
            </Link>{" "}
            for what this quantity means and how it is calculated.
          </p>
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Output
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left px-2">Subsystem</th>
                <th className="text-left px-2">Class 1</th>
                <th className="text-left px-2">Class 2</th>
                <th className="text-left px-2">Class 3</th>
              </tr>
            </thead>
            <tbody>
              {STEP2_RESULTS.map(({ dim, label, values }) => (
                <tr key={dim} className="bg-slate-50">
                  <td className="px-2 py-2 rounded-l-lg font-mono text-slate-700">
                    <InlineMath math={label} />
                  </td>
                  {values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 text-slate-600 font-mono ${
                        i === values.length - 1 ? "rounded-r-lg" : ""
                      }`}
                    >
                      <InlineMath
                        math={`B_{${i + 1},\\text{LAR},${dim}} = ${v}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Blocking is lower than the raw Step 1 numbers might suggest, even with
          triple the traffic, because a request now has{" "}
          <InlineMath math="T = 3" /> PMs to choose from instead of just one.
        </p>
      </div>

      {/* Step 3: ratio between LAR and EMLM */}
      <div className="border-t border-slate-200 pt-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Step 3 (Determining the ratio <InlineMath math="ρ" /> between the
          blocking probabilities obtained in Steps 1 &amp; 2)
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          For each service class <InlineMath math="k" /> and each resource{" "}
          <InlineMath math="y \in \{P, R, D, bps\}" />, the ratio{" "}
          <InlineMath math="ρ_{k,y}" /> is obtained by dividing the Step 2 (LAR)
          result by the Step 1 (EMLM) result:
        </p>

        <div className="overflow-x-auto">
          <BlockMath math="ρ_{k,y} = \frac{B_{k,\text{LAR},y}}{B_{k,\text{EMLM},y}}" />
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Output
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left px-2">Subsystem</th>
                <th className="text-left px-2">Class 1</th>
                <th className="text-left px-2">Class 2</th>
                <th className="text-left px-2">Class 3</th>
              </tr>
            </thead>
            <tbody>
              {STEP3_RESULTS.map(({ dim, label, values }) => (
                <tr key={dim} className="bg-slate-50">
                  <td className="px-2 py-2 rounded-l-lg font-mono text-slate-700">
                    <InlineMath math={label} />
                  </td>
                  {values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 text-slate-600 font-mono ${
                        i === values.length - 1 ? "rounded-r-lg" : ""
                      }`}
                    >
                      <InlineMath math={`ρ_{${i + 1},${dim}} = ${v}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          This ratio captures how much the group structure changes blocking
          compared to a single subsystem: a value close to 0 (as on processor
          and RAM) means the group of <InlineMath math="T = 3" /> PMs blocks far
          less than one PM would alone, while a value closer to 1 (as on disk
          and network) means the group offers less relief from a single PM's
          blocking.
        </p>
      </div>
    </section>
  );
}
