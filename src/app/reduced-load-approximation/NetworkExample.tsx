import { InlineMath } from "react-katex";
import NetworkDiagram from "./NetworkDiagram";

export default function NetworkExample() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Example Network topology
      </h2>
      <p className="text-slate-600 leading-relaxed">
        Here is an example with three links (L1, L2, L3) in a row, each one a
        router/resource, and three service classes. Classes{" "}
        <InlineMath math="k_1" /> and <InlineMath math="k_2" /> both enter at
        link L1. Class <InlineMath math="k_1" /> leaves after link L2, while
        class <InlineMath math="k_2" /> carries on to the end. Class{" "}
        <InlineMath math="k_3" /> enters at link L2, and both{" "}
        <InlineMath math="k_2" /> and <InlineMath math="k_3" /> leave after link
        L3.
      </p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
          Network diagram
        </p>
        <NetworkDiagram
          links={[
            { id: 1, capacity: 4 },
            { id: 2, capacity: 5 },
            { id: 3, capacity: 4 },
          ]}
          routes={[
            { label: "k1", load: 1, demands: { 1: 1, 2: 1 } },
            { label: "k2", load: 1, demands: { 1: 1, 2: 1, 3: 1 } },
            { label: "k3", load: 1, demands: { 2: 1, 3: 1 } },
          ]}
        />
        <p className="text-xs text-slate-400 text-center">
          Each coloured line is one class: the arrow on the left is where it
          enters and the arrow on the right is where it leaves. The <em>b</em>{" "}
          labels show the bandwidth it needs on each link.
        </p>
      </div>
    </section>
  );
}
