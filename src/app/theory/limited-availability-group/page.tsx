import Layout from "@/components/layout";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";

// ─── subgroup diagram ──────────────────────────────────────────────────────
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

// ─── page ─────────────────────────────────────────────────────────────────────
export default function LimitedAvailabilityGroupPage() {
  return (
    <Layout>
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
              <span className="text-slate-700">
                Limited Availability Group Model
              </span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Limited Availability Group (LAG) Model
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              A network model where multiple separate resources, called
              subgroups, each handle their own share of the traffic.
            </p>
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              In the <strong>LAG model</strong> (also referred to as the{" "}
              <strong>Limited Availability Resources, LAR, model</strong>), the
              total capacity of the system is not a single shared pool.
              Instead, it is split into <InlineMath math="\ell" /> separate
              resources, called <strong>subgroups</strong>, each with its own
              capacity.
            </p>

            {/* subgroup diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Subgroups
              </p>
              <div className="flex items-center justify-center gap-6 overflow-x-auto py-1">
                <SubgroupBox label="1" />
                <SubgroupBox label="2" />
                <span className="text-slate-400 text-lg">&hellip;</span>
                <SubgroupBox label={"ℓ"} />
              </div>
              <p className="text-center text-sm text-slate-600">
                Total system capacity{" "}
                <InlineMath math="V = \ell \cdot C" />
              </p>
            </div>
          </section>

          {/* Assumptions */}
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
                  The model assumes the existence of{" "}
                  <InlineMath math="\ell" /> identical separate resources
                  (subgroups), each with a capacity of{" "}
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
                  A request cannot be divided across more than one resource:
                  it must be served entirely by a single subgroup.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  🔗 Special case{" "}
                  <InlineMath math="\ell = 1" />
                </p>
                <p className="text-sm text-slate-600">
                  If there&apos;s only one resource (
                  <InlineMath math="\ell = 1" />
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

          {/* Occupancy distribution */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Occupancy Distribution
            </h2>
            <p className="text-slate-600 leading-relaxed">
              As in the Kaufman-Roberts model, let <InlineMath math="q(j)" />{" "}
              be the unnormalised probability that the system is in state{" "}
              <InlineMath math="j" /> (i.e. <InlineMath math="j" /> bandwidth
              units are occupied across all subgroups). For a system with{" "}
              <InlineMath math="K" /> service-classes, where each class{" "}
              <InlineMath math="k" /> has offered load{" "}
              <InlineMath math="a_k" /> and bandwidth requirement{" "}
              <InlineMath math="b_k" />, the occupancy distribution satisfies:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath
                math="q(j) =
                \begin{cases}
                  1, & j = 0 \\[4pt]
                  \dfrac{1}{j} \displaystyle\sum_{k=1}^{K} a_k \cdot b_k \cdot \sigma_k(j-b_k) \cdot q(j-b_k), & j = 1, 2, \dots, \ell \cdot C \\[8pt]
                  0, & \text{otherwise}
                \end{cases}"
              />
            </div>

            <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
              <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
                📖
              </span>
              <p className="text-sm text-violet-900 leading-relaxed">
                The term <InlineMath math="\sigma_k(j-b_k)" /> is the factor
                that distinguishes the LAG model from Kaufman-Roberts: it
                accounts for the existence of the <InlineMath math="\ell" />{" "}
                identical subgroups, capturing how a class-<InlineMath math="k" />{" "}
                request can be placed into one of them when the system is in
                state <InlineMath math="j-b_k" />.
              </p>
            </div>

            <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-emerald-500 text-lg flex-shrink-0 mt-0.5">
                💡
              </span>
              <p className="text-sm text-emerald-900 leading-relaxed">
                When <InlineMath math="\ell = 1" />, there is only one
                subgroup, so <InlineMath math="\sigma_k(j-b_k) = 1" /> for
                every reachable state, and the recursion above reduces to the
                familiar Kaufman-Roberts formula:
              </p>
            </div>
            <div className="overflow-x-auto py-1">
              <BlockMath math="q(j) = \frac{1}{j} \sum_{k=1}^{K} a_k \cdot b_k \cdot q(j-b_k), \qquad j = 1, 2, \dots, C" />
            </div>
          </section>

          {/* Reference */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">
              References
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                M. Vlasakis, M. Kourtesi, I-A. Chousainov, I. Keramidi, D.
                Uzunidis, O. Zestas, I. D. Moscholios and M. Logothetis.{" "}
                <em>
                  &quot;On the limited-availability group model for multirate
                  Poisson traffic.&quot;
                </em>{" "}
                Proc. Panhellenic Conf. Electronics and Telecommunications
                (PACET).
              </p>
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
    </Layout>
  );
}
