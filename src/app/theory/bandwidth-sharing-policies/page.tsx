import Link from "next/link";

// ─── SVG capacity bar diagram ─────────────────────────────────────────────────
const BAR_W = 420;
const BAR_H = 36;
const CAPACITY = 10; // bandwidth units shown in diagrams

function toX(units: number) {
  return (units / CAPACITY) * BAR_W;
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function BandwidthSharingPoliciesPage() {
  return (
      <div className="min-h-screen p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-10">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span>Theory &amp; Formulas</span>
              {" / "}
              <span className="text-slate-700">Bandwidth Sharing Policies</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Bandwidth Sharing Policies
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              How a system decides which calls to accept when multiple service
              classes compete for a shared pool of bandwidth.
            </p>
          </div>

          {/* Service class callout */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sky-600 text-lg">💡</span>
              <h2 className="text-base font-semibold text-sky-800">
                What is a service class?
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              A <strong>service class</strong> is a group of calls that all
              share the same characteristics, most importantly they each require
              the same number of <strong>bandwidth units (b.u.s)</strong> from
              the system.
            </p>
            <p className="text-slate-700 leading-relaxed">
              For example, in a network with capacity{" "}
              <strong>C = 10 b.u.</strong>:
            </p>
            <ul className="text-slate-700 space-y-1 text-sm pl-2">
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-sky-400 mr-2 align-middle" />
                <strong>Class 1:</strong> voice calls, each requiring{" "}
                <strong>1 b.u.</strong>
              </li>
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 mr-2 align-middle" />
                <strong>Class 2:</strong> video calls, each requiring{" "}
                <strong>2 b.u.</strong>
              </li>
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-violet-400 mr-2 align-middle" />
                <strong>Class 3:</strong> data transfers, each requiring{" "}
                <strong>4 b.u.</strong>
              </li>
            </ul>
            <p className="text-slate-600 text-sm">
              A <strong>bandwidth sharing policy</strong> determines the rules
              by which these classes compete for the available capacity: which
              calls are accepted, which are blocked, and whether any bandwidth
              is reserved or guaranteed per class.
            </p>
          </div>

          {/* Overview */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              When multiple service classes share a link with finite capacity{" "}
              <strong>C</strong>, the system must apply a policy that decides
              whether an incoming call is accepted or blocked. The choice of
              policy directly affects the{" "}
              <Link
                href="/theory/grade-of-service"
                className="text-sky-600 hover:underline font-medium"
              >
                Grade of Service (GoS)
              </Link>{" "}
              experienced by each class and the overall utilisation of the
              system.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Four fundamental policies are used in teletraffic engineering,
              ranging from fully open sharing to strict per-class partitioning.
            </p>

            {/* Policy summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                {
                  label: "Complete Sharing",
                  tag: "CS",
                  color: "bg-sky-100 text-sky-700 border-sky-200",
                },
                {
                  label: "Complete Partitioning",
                  tag: "CP",
                  color: "bg-violet-100 text-violet-700 border-violet-200",
                },
                {
                  label: "Threshold Policy",
                  tag: "TP",
                  color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                },
                {
                  label: "Bandwidth Reservation",
                  tag: "BR",
                  color: "bg-amber-100 text-amber-700 border-amber-200",
                },
              ].map(({ label, tag, color }) => (
                <div
                  key={tag}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${color}`}
                >
                  <span className="font-bold text-lg">{tag}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── (a) Complete Sharing ─────────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-700">
                Complete Sharing (CS)
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              In a system where multiple service classes (such as voice calls,
              video streaming, or data transfers) share a single communication
              link with total capacity <em>C</em> bandwidth units, Complete
              Sharing allows any incoming call, regardless of its service class,
              to use the available bandwidth as long as there is enough capacity
              to accommodate it.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Formally, a call of class <em>i</em> requiring{" "}
              <em>
                b<sub>i</sub>
              </em>{" "}
              bandwidth units is accepted if and only if the currently occupied
              bandwidth plus{" "}
              <em>
                b<sub>i</sub>
              </em>{" "}
              does not exceed <em>C</em>. No bandwidth is reserved or
              ring-fenced for any class.
            </p>

            {/* Key characteristics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: "🚫",
                  title: "No reservation",
                  desc: "No portion of the capacity is set aside for any particular service class. Every class competes equally for the available bandwidth.",
                },
                {
                  icon: "🕐",
                  title: "First come, first served",
                  desc: "Calls are accepted in the order they arrive. If there is enough capacity when a call arrives, it is accepted, regardless of its class.",
                },
                {
                  icon: "📈",
                  title: "Efficient use of resources",
                  desc: "Because no bandwidth is reserved and sits idle, the system can serve more calls overall compared to partitioned approaches.",
                },
                {
                  icon: "⬇️",
                  title: "Minimises unused capacity",
                  desc: "Bandwidth is only blocked when the system is truly full. There are no artificial limits that prevent a class from using available capacity.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-1"
                >
                  <p className="text-sm font-semibold text-sky-800">
                    {icon} {title}
                  </p>
                  <p className="text-sm text-slate-600">{desc}</p>
                </div>
              ))}
            </div>

            {/* CS diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Capacity diagram: C = 10 b.u., fully shared
              </p>
              <svg
                viewBox={`-15 0 ${BAR_W + 75} ${BAR_H + 30}`}
                className="w-full"
              >
                {/* Full shared bar */}
                <rect
                  x={0}
                  y={0}
                  width={BAR_W}
                  height={BAR_H}
                  rx={6}
                  fill="#e0f2fe"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                />
                <text
                  x={BAR_W / 2}
                  y={BAR_H / 2 + 5}
                  fontSize={12}
                  fill="#0369a1"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  All classes share C = 10 b.u.
                </text>
                {/* axis */}
                <line
                  x1={0}
                  y1={BAR_H + 10}
                  x2={BAR_W}
                  y2={BAR_H + 10}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                {[0, 5, 10].map((t) => (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={BAR_H + 7}
                      x2={toX(t)}
                      y2={BAR_H + 13}
                      stroke="#94a3b8"
                      strokeWidth={1}
                    />
                    <text
                      x={toX(t)}
                      y={BAR_H + 24}
                      fontSize={10}
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {t}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  Advantage
                </p>
                <p className="text-sm text-slate-600">
                  Maximises resource utilisation: no bandwidth sits idle while
                  calls of another class are waiting.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-red-600">Limitation</p>
                <p className="text-sm text-slate-600">
                  Provides no GoS guarantee per service class. A high-traffic
                  class can crowd out lower-demand classes entirely.
                </p>
              </div>
            </div>
          </section>

          {/* ── (b) Complete Partitioning ────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-700">
                Complete Partitioning (CP)
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Under Complete Partitioning, the total system capacity is divided
              into fixed, non-overlapping portions, one dedicated portion per
              service class. A call of class <em>i</em> can only be served
              within its own allocated partition{" "}
              <em>
                C<sub>i</sub>
              </em>
              , regardless of how much capacity other partitions have available.
            </p>

            {/* CP diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Capacity diagram: C = 10 b.u., split across 3 classes
              </p>
              <svg
                viewBox={`-15 0 ${BAR_W + 75} ${BAR_H + 30}`}
                className="w-full"
              >
                {/* Class 1 partition: 0-4 */}
                <rect
                  x={toX(0)}
                  y={0}
                  width={toX(4)}
                  height={BAR_H}
                  rx={0}
                  fill="#e0e7ff"
                  stroke="#818cf8"
                  strokeWidth={1}
                />
                <text
                  x={toX(2)}
                  y={BAR_H / 2 + 5}
                  fontSize={11}
                  fill="#4338ca"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  C₁=4
                </text>
                {/* Class 2 partition: 4-7 */}
                <rect
                  x={toX(4)}
                  y={0}
                  width={toX(3)}
                  height={BAR_H}
                  rx={0}
                  fill="#ede9fe"
                  stroke="#a78bfa"
                  strokeWidth={1}
                />
                <text
                  x={toX(5.5)}
                  y={BAR_H / 2 + 5}
                  fontSize={11}
                  fill="#6d28d9"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  C₂=3
                </text>
                {/* Class 3 partition: 7-10 */}
                <rect
                  x={toX(7)}
                  y={0}
                  width={toX(3)}
                  height={BAR_H}
                  rx={0}
                  fill="#f5f3ff"
                  stroke="#c4b5fd"
                  strokeWidth={1}
                />
                <text
                  x={toX(8.5)}
                  y={BAR_H / 2 + 5}
                  fontSize={11}
                  fill="#7c3aed"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  C₃=3
                </text>
                {/* rounded corners on outer edges */}
                <rect
                  x={0}
                  y={0}
                  width={BAR_W}
                  height={BAR_H}
                  rx={6}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                />
                {/* axis */}
                <line
                  x1={0}
                  y1={BAR_H + 10}
                  x2={BAR_W}
                  y2={BAR_H + 10}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                {[0, 4, 7, 10].map((t) => (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={BAR_H + 7}
                      x2={toX(t)}
                      y2={BAR_H + 13}
                      stroke="#94a3b8"
                      strokeWidth={1}
                    />
                    <text
                      x={toX(t)}
                      y={BAR_H + 24}
                      fontSize={10}
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {t}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  Advantage
                </p>
                <p className="text-sm text-slate-600">
                  Guarantees a defined GoS to each service class. A class cannot
                  be starved by other classes because its partition is
                  exclusively reserved.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-red-600">
                  Limitations
                </p>
                <p className="text-sm text-slate-600">
                  Fixed partitions cannot adapt to changing traffic patterns.
                  Idle capacity in one partition cannot be used by another
                  class, leading to waste and inefficiency in a multi-service
                  environment.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-800">
                Important note
              </p>
              <p className="text-sm text-slate-700">
                The dedication of capacity to individual classes causes resource
                management and bandwidth control problems in multi-service
                environments. Complete Partitioning should be avoided where
                possible. Its only justification is when a hard per-class GoS
                guarantee is an absolute requirement.
              </p>
            </div>
          </section>

          {/* ── (c) Threshold Policy ─────────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-700">
                Threshold Policy
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              The Threshold Policy is a hybrid that combines the bandwidth
              guarantee of Complete Partitioning with the flexible sharing of
              Complete Sharing. Each service class <em>i</em> is assigned a
              threshold{" "}
              <em>
                T<sub>i</sub>
              </em>
              . A call of class <em>i</em> is accepted only if the currently
              occupied bandwidth does not exceed its threshold, but within that
              threshold, the class competes freely with others.
            </p>

            {/* Threshold diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Capacity diagram: C = 10 b.u., thresholds T₁ = 8, T₂ = 6
              </p>
              <svg
                viewBox={`-15 0 ${BAR_W + 75} ${BAR_H + 50}`}
                className="w-full"
              >
                {/* Shared area: all classes up to min threshold */}
                <rect
                  x={toX(0)}
                  y={0}
                  width={toX(6)}
                  height={BAR_H}
                  rx={0}
                  fill="#d1fae5"
                  stroke="#34d399"
                  strokeWidth={1}
                />
                <text
                  x={toX(3)}
                  y={BAR_H / 2 + 5}
                  fontSize={10}
                  fill="#065f46"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  shared
                </text>
                {/* Class 1 only: T2 to T1 */}
                <rect
                  x={toX(6)}
                  y={0}
                  width={toX(2)}
                  height={BAR_H}
                  rx={0}
                  fill="#bbf7d0"
                  stroke="#34d399"
                  strokeWidth={1}
                />
                <text
                  x={toX(7)}
                  y={BAR_H / 2 + 5}
                  fontSize={10}
                  fill="#065f46"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  C₁ only
                </text>
                {/* Above T1: blocked for both */}
                <rect
                  x={toX(8)}
                  y={0}
                  width={toX(2)}
                  height={BAR_H}
                  rx={0}
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />
                <text
                  x={toX(9)}
                  y={BAR_H / 2 + 5}
                  fontSize={9}
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  blocked
                </text>
                {/* Outer border */}
                <rect
                  x={0}
                  y={0}
                  width={BAR_W}
                  height={BAR_H}
                  rx={6}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={1.5}
                />
                {/* Threshold markers */}
                <line
                  x1={toX(6)}
                  y1={0}
                  x2={toX(6)}
                  y2={BAR_H + 18}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <text
                  x={toX(6)}
                  y={BAR_H + 30}
                  fontSize={10}
                  fill="#b45309"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  T₂=6
                </text>
                <line
                  x1={toX(8)}
                  y1={0}
                  x2={toX(8)}
                  y2={BAR_H + 18}
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <text
                  x={toX(8)}
                  y={BAR_H + 30}
                  fontSize={10}
                  fill="#1d4ed8"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  T₁=8
                </text>
                {/* axis */}
                <line
                  x1={0}
                  y1={BAR_H + 10}
                  x2={BAR_W}
                  y2={BAR_H + 10}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                {[0, 5, 10].map((t) => (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={BAR_H + 7}
                      x2={toX(t)}
                      y2={BAR_H + 13}
                      stroke="#94a3b8"
                      strokeWidth={1}
                    />
                    <text
                      x={toX(t)}
                      y={BAR_H + 44}
                      fontSize={10}
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {t}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  Advantages
                </p>
                <p className="text-sm text-slate-600">
                  Provides a bandwidth guarantee per class (via thresholds)
                  while allowing unrestricted sharing up to each threshold,
                  combining the best properties of CS and CP.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-red-600">Limitation</p>
                <p className="text-sm text-slate-600">
                  Threshold values must be carefully chosen per class and per
                  traffic condition. Poor threshold settings can degrade
                  performance below what either CS or CP would achieve.
                </p>
              </div>
            </div>
          </section>

          {/* ── (d) Bandwidth Reservation ────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-700">
                Bandwidth Reservation (BR)
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Under the BR policy, the system capacity is shared among service
              classes in such a way that each service class meets its own
              bandwidth capacity. An amount of{" "}
              <em>
                t<sub>k</sub>
              </em>{" "}
              b.u. is reserved by the system so that service class <em>k</em>{" "}
              sees{" "}
              <em>
                C &minus; t<sub>k</sub>
              </em>{" "}
              b.u. as its effective system capacity. A call of class <em>k</em>{" "}
              is accepted only if the currently occupied bandwidth does not
              exceed{" "}
              <em>
                C &minus; t<sub>k</sub>
              </em>{" "}
              b.u.
            </p>

            {/* BR diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Capacity diagram: C = 10 b.u., t_k = 2 reserved for class k
              </p>
              <svg
                viewBox={`-15 0 ${BAR_W + 75} ${BAR_H + 30}`}
                className="w-full"
              >
                <rect
                  x={toX(0)}
                  y={0}
                  width={toX(8)}
                  height={BAR_H}
                  rx={0}
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth={1}
                />
                <text
                  x={toX(4)}
                  y={BAR_H / 2 + 5}
                  fontSize={11}
                  fill="#92400e"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  C - t_k = 8 b.u. (effective capacity)
                </text>
                <rect
                  x={toX(8)}
                  y={0}
                  width={toX(2)}
                  height={BAR_H}
                  rx={0}
                  fill="#fde68a"
                  stroke="#f59e0b"
                  strokeWidth={1}
                />
                <text
                  x={toX(9)}
                  y={BAR_H / 2 + 5}
                  fontSize={10}
                  fill="#92400e"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  t_k=2
                </text>
                <rect
                  x={0}
                  y={0}
                  width={BAR_W}
                  height={BAR_H}
                  rx={6}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                />
                <line
                  x1={0}
                  y1={BAR_H + 10}
                  x2={BAR_W}
                  y2={BAR_H + 10}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                {[0, 5, 8, 10].map((t) => (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={BAR_H + 7}
                      x2={toX(t)}
                      y2={BAR_H + 13}
                      stroke="#94a3b8"
                      strokeWidth={1}
                    />
                    <text
                      x={toX(t)}
                      y={BAR_H + 24}
                      fontSize={10}
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {t}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Choosing t_k */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-slate-700">
                Choosing the reservation parameters
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                The reservation amounts{" "}
                <em>
                  t<sub>k</sub>
                </em>{" "}
                can be defined arbitrarily, as long as a reasonable effective
                capacity remains for each service class. However, they are
                usually chosen so that the sum of the bandwidth requirement and
                the reservation is equal across all service classes:
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-center font-mono text-sm text-slate-700">
                b<sub>1</sub> + t<sub>1</sub> = b<sub>2</sub> + t<sub>2</sub> =
                &middot;&middot;&middot; = b<sub>k</sub> + t<sub>k</sub> =
                &middot;&middot;&middot; = b<sub>K</sub> + t<sub>K</sub>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                When this condition holds, each service class experiences the
                same effective load relative to its capacity, which leads
                directly to GoS equalisation.
              </p>
            </div>

            {/* GoS equalization callout */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sky-600 text-lg">⚖️</span>
                <h4 className="font-semibold text-sky-800">
                  <Link
                    href="/theory/grade-of-service"
                    className="hover:underline"
                  >
                    GoS equalisation
                  </Link>
                </h4>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                When the reservation parameters are chosen so that{" "}
                <em>
                  b<sub>k</sub> + t<sub>k</sub>
                </em>{" "}
                is constant across all service classes, the blocking probability
                becomes equal for every class:
              </p>
              <div className="bg-white border border-sky-100 rounded-lg p-4 text-center font-mono text-sm text-slate-700">
                B<sub>1</sub> = B<sub>2</sub> = &middot;&middot;&middot; = B
                <sub>k</sub> = &middot;&middot;&middot; = B<sub>K</sub>
              </div>
              <p className="text-slate-600 text-sm">
                This is the standard case of the BR policy used in teletraffic
                analysis. No service class is favoured or penalised relative to
                another.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  Advantage
                </p>
                <p className="text-sm text-slate-600">
                  More flexible than Complete Partitioning: capacity is shared
                  globally while each class is protected by its reservation.
                  Achieves fair GoS across all service classes when parameters
                  are set correctly.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-red-600">Limitation</p>
                <p className="text-sm text-slate-600">
                  The reservation amounts{" "}
                  <em>
                    t<sub>k</sub>
                  </em>{" "}
                  must be carefully engineered per class. Poor choices can
                  reduce overall utilisation or fail to achieve GoS
                  equalisation.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison summary */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Policy Comparison
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold text-left">
                    <th className="px-4 py-3">Policy</th>
                    <th className="px-4 py-3">GoS guarantee per class</th>
                    <th className="px-4 py-3">Resource utilisation</th>
                    <th className="px-4 py-3">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-sky-700">CS</td>
                    <td className="px-4 py-3">None</td>
                    <td className="px-4 py-3">Maximum</td>
                    <td className="px-4 py-3">Low</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-3 font-medium text-violet-700">
                      CP
                    </td>
                    <td className="px-4 py-3">Hard guarantee</td>
                    <td className="px-4 py-3">Low (wasted idle b.u.s)</td>
                    <td className="px-4 py-3">Low</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-emerald-700">
                      Threshold
                    </td>
                    <td className="px-4 py-3">Soft guarantee</td>
                    <td className="px-4 py-3">High</td>
                    <td className="px-4 py-3">Medium</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-3 font-medium text-amber-700">BR</td>
                    <td className="px-4 py-3">Minimum guarantee</td>
                    <td className="px-4 py-3">High</td>
                    <td className="px-4 py-3">Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Reference */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">Reference</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Michael Logothetis, Ioannis D. Moscholios.{" "}
                <em>
                  Efficient Multirate Teletraffic Loss Models Beyond Erlang
                </em>
                . Wiley-IEEE Press, 2019.{" "}
                <a
                  href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  onlinelibrary.wiley.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
  );
}
