import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";

const SYMBOLS: [string, string][] = [
  ["B_{li}", "Blocking probability of class i on resource l"],
  ["V_{lk}", "Reduced-load blocking probability of class k on resource l"],
  ["L", "Number of resources (links) in the network"],
  ["I", "Number of service classes"],
  ["C_l", "Capacity of resource l in bandwidth units (b.u.)"],
  ["b_i", "Bandwidth a class-i call needs on the resource (b.u.)"],
  ["\\alpha_x", "Offered traffic load of a call x (erl)"],
  ["R_x", "Set of resources (links) a class-x call traverses"],
  ["I_l", "Service classes that traverse resource l"],
  ["G", "Normalisation constant of the occupancy distribution"],
];

export default function Formula() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">The Formula</h2>
      <p className="text-slate-600 leading-relaxed">
        Take a network of <InlineMath math="L" /> links carrying{" "}
        <InlineMath math="I" /> service classes. A class-
        <InlineMath math="i" /> call on a link <InlineMath math="l" /> of
        capacity <InlineMath math="C_l" /> has a blocking probability{" "}
        <InlineMath math="B_{li}" />.
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="B_{li} = \bigl[C_l;\, \alpha_x,\, x \varepsilon I_l\bigr] = \sum_{j = C_l - b_i + 1}^{C_l} G^{-1}\, q(j)" />
      </div>

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">🔗</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          The occupancy distribution <InlineMath math="q(j)" /> for each link is
          computed with the{" "}
          <Link
            href="/kaufman-roberts"
            className="text-sky-700 font-medium hover:underline"
          >
            Kaufman-Roberts formula
          </Link>
          , treating that link as a single resource shared by the classes that
          traverse it.
        </p>
      </div>
      <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed text-sm">
        <li>
          <InlineMath math="\alpha_x" /> is the offered traffic load of a call{" "}
          <InlineMath math="x" /> in resource <InlineMath math="l" />.
        </li>
        <li>
          <InlineMath math="q(j)" /> is the unnormalised probability of having{" "}
          <InlineMath math="j" /> occupied b.u. in this resource, over all{" "}
          <InlineMath math="x \in I_l = \{\, x \in I : l \in R_x \,\}" />.
        </li>
        <li>
          <InlineMath math="R_x" /> is the set of resources (links) that this
          service class call <InlineMath math="x" /> can traverse in the network.
        </li>
      </ul>

      <p className="text-slate-600 leading-relaxed">
        A link usually sees less load than the total demand, because calls
        blocked elsewhere on the route never reach it. To capture this, we
        reduce the offered load <InlineMath math="\alpha_x" /> on link{" "}
        <InlineMath math="l" /> by the blocking the call meets on the previous
        links of its route:
      </p>

      <div className="overflow-x-auto py-1">
        <BlockMath math="V_{lk} = B_{lk} = \Bigl[C_l;\, \alpha_x \cdot \!\!\prod_{l \in R_x - \{l\}}\!\! \bigl(1 - V_{lx}\bigr),\, x \in K_l\Bigr], \quad k \in K_l,\ l = 1, 2, \dots, L" />
      </div>

      <p className="text-slate-600 leading-relaxed text-sm">
        The factor{" "}
        <InlineMath math="\prod_{l \in R_x - \{l\}} \bigl(1 - V_{lx}\bigr)" />{" "}
        multiplied by <InlineMath math="\alpha_x" /> gives the reduced traffic
        load. The reduction accounts for the fact that blocking depends on each
        individual link: the blocking on the other links of the route (excluding
        link <InlineMath math="l" />) is also considered in the overall blocking
        probability.
      </p>

      {/* Parameter table */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Symbols
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
          {SYMBOLS.map(([sym, desc]) => (
            <div key={sym} className="flex gap-2 items-start">
              <span className="text-sky-700 w-16 flex-shrink-0">
                <InlineMath math={sym} />
              </span>
              <span className="text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
