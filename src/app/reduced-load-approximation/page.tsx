"use client";

import { useState } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { callBlockingProbabilityinRLA } from "@/lib/models/reduced-load-approximation/reduced-load-approximation";
import { linkUtilization_U } from "@/lib/models/reduced-load-approximation/link-utilization";
import { networkTopology, ServiceClassWithRoute } from "@/lib/models/types";
import NetworkDiagram from "./NetworkDiagram";

type LinkRow = {
  id: number;
  bu: string;
};

type ServiceRow = {
  id: number;
  incomingLoad_a: string;
  // bandwidth demanded on each link, keyed by link id ("" or "0" means the
  // class does not traverse that link)
  demands: Record<number, string>;
};

const DEFAULT_LINKS: LinkRow[] = [
  { id: 1, bu: "4" },
  { id: 2, bu: "5" },
];

const DEFAULT_SERVICES: ServiceRow[] = [
  { id: 1, incomingLoad_a: "1", demands: { 1: "1", 2: "1" } },
  { id: 2, incomingLoad_a: "1", demands: { 1: "", 2: "2" } },
];

export default function ReducedLoadApproximationPage() {
  const [links, setLinks] = useState<LinkRow[]>(DEFAULT_LINKS);
  const [rows, setRows] = useState<ServiceRow[]>(DEFAULT_SERVICES);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [utilization, setUtilization] = useState<Record<string, string> | null>(
    null,
  );
  const [error, setError] = useState("");

  // ── link handlers ──────────────────────────────────────────────────────
  const addLink = () => {
    const nextId = links.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    setLinks((prev) => [...prev, { id: nextId, bu: "" }]);
    setResults(null);
    setError("");
  };

  const removeLink = (id: number) => {
    if (links.length <= 1) return;
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setRows((prev) =>
      prev.map((r) => {
        const { [id]: _removed, ...rest } = r.demands;
        return { ...r, demands: rest };
      }),
    );
    setResults(null);
    setError("");
  };

  const updateLink = (id: number, value: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, bu: value } : l)),
    );
    setError("");
  };

  // ── service-class handlers ─────────────────────────────────────────────
  const addRow = () => {
    const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    setRows((prev) => [
      ...prev,
      { id: nextId, incomingLoad_a: "", demands: {} },
    ]);
    setResults(null);
    setError("");
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setResults(null);
    setError("");
  };

  const updateLoad = (id: number, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, incomingLoad_a: value } : r)),
    );
    setError("");
  };

  const updateDemand = (rowId: number, linkId: number, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, demands: { ...r.demands, [linkId]: value } }
          : r,
      ),
    );
    setError("");
  };

  const runModel = () => {
    setError("");
    setResults(null);
    setUtilization(null);

    const topology: networkTopology[] = [];
    for (const l of links) {
      const bu = Number(l.bu);
      if (!l.bu || isNaN(bu) || bu <= 0) {
        setError(`Please enter a valid capacity for link ${l.id}.`);
        return;
      }
      topology.push({ link: l.id, bu });
    }

    const serviceClasses: ServiceClassWithRoute[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const a = Number(row.incomingLoad_a);
      if (!row.incomingLoad_a || isNaN(a) || a <= 0) {
        setError(
          `Please enter a valid offered load for service class ${i + 1}.`,
        );
        return;
      }

      const route = links
        .map((l) => ({ link: l.id, bu: Number(row.demands[l.id]) }))
        .filter((r) => r.bu > 0 && !isNaN(r.bu));

      if (route.length === 0) {
        setError(
          `Service class ${i + 1} must traverse at least one link (set a bandwidth demand > 0).`,
        );
        return;
      }

      serviceClasses.push({
        serviceClass: i + 1,
        incomingLoad_a: a,
        route,
      });
    }

    try {
      const cbp = callBlockingProbabilityinRLA(topology, serviceClasses);
      const util = linkUtilization_U(topology, serviceClasses);
      setResults(cbp);
      setUtilization(util);
    } catch (e) {
      setError(`Calculation failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-10">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span>Models</span>
              {" / "}
              <span className="text-slate-700">Reduced Load Approximation</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Reduced Load Approximation (RLA) Model
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              A model for calls that cross a network of links, where a call is
              accepted only if every link on its route has room.
            </p>
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Overview</h2>

            <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
              <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">
                ℹ️
              </span>
              <p className="text-sm text-sky-900 leading-relaxed">
                The Reduced Load Approximation is also known as the{" "}
                <strong>Fixed-Point (FP) method</strong> (and as the{" "}
                <strong>knapsack approximation</strong>).
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              The <strong>RLA </strong> is an iterative technique for modelling
              systems where a single resource handles many calls at once. It
              takes into account how serving one call affects the others,
              capturing the way calls being processed by the shared resources
              depend on each other. It is especially useful when calls are
              served at the same time by shared resources, such as servers or
              network cells. The method is simple to compute, but it gives only
              approximate results.
            </p>

            <p className="text-slate-600 leading-relaxed">
              The core idea is to find a stable state of the system, where the
              interdependent values no longer change much from one iteration to
              the next.
            </p>

            <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
              <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
                💡
              </span>
              <p className="text-sm text-violet-900 leading-relaxed">
                In the RLA, a call that is already blocked on one link never
                reaches the next link, so it does not add load there. The model
                lowers (reduces) the traffic each link sees to account for this.
              </p>
            </div>
          </section>

          {/* Network example */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Example Network topology
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Here is an example with three links (L1, L2, L3) in a row, each
              one a router/resource, and three service classes. Classes{" "}
              <InlineMath math="k_1" /> and <InlineMath math="k_2" /> both enter
              at link L1. Class <InlineMath math="k_1" /> leaves after link L2,
              while class <InlineMath math="k_2" /> carries on to the end. Class{" "}
              <InlineMath math="k_3" /> enters at link L2, and both{" "}
              <InlineMath math="k_2" /> and <InlineMath math="k_3" /> leave
              after link L3.
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
                Each coloured line is one class: the arrow on the left is where
                it enters and the arrow on the right is where it leaves. The{" "}
                <em>b</em> labels show the bandwidth it needs on each link.
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
                  🔗 Independent links
                </p>
                <p className="text-sm text-slate-600">
                  Each link is treated on its own, as if it blocks calls
                  separately from the others. This is the shortcut that makes
                  the model easy to solve.
                </p>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-sky-800">
                  🛣️ Fixed routes
                </p>
                <p className="text-sm text-slate-600">
                  Each type of call always takes the same route, and needs some
                  bandwidth on every link along it.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-amber-800">
                  🚫 All-or-nothing
                </p>
                <p className="text-sm text-slate-600">
                  A call is accepted only if every link on its route has enough
                  room. If even one link is full, the call is blocked.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  📉 Reduced load
                </p>
                <p className="text-sm text-slate-600">
                  The load sent to a link is lowered to reflect the calls that
                  were already blocked earlier on the route.
                </p>
              </div>
            </div>
          </section>

          {/* Formula */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              The Formula
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Consider a fixed routing network with <InlineMath math="L" />{" "}
              resources or links, accommodating <InlineMath math="I" /> service
              classes. Suppose that a service class <InlineMath math="i" />{" "}
              traverses a resource <InlineMath math="l" /> with a capacity of{" "}
              <InlineMath math="C_l" /> b.u. and experiences a call blocking
              probability denoted as <InlineMath math="B_{li}" />. The CBP{" "}
              <InlineMath math="B_{li}" /> can be determined using the{" "}
              <Link
                href="/kaufman-roberts"
                className="text-sky-600 font-medium hover:underline"
              >
                Kaufman-Roberts
              </Link>{" "}
              occupancy distribution, summed over the states where a class-
              <InlineMath math="i" /> call would not fit:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath math="B_{li} = \bigl[C_l;\, \alpha_x,\, x \varepsilon I_l\bigr] = \sum_{j = C_l - b_i + 1}^{C_l} G^{-1}\, q(j)" />
            </div>

            <p className="text-slate-600 leading-relaxed text-sm">
              where <InlineMath math="\alpha_x" /> is the offered traffic load
              of a call <InlineMath math="x" /> in resource{" "}
              <InlineMath math="l" />, and <InlineMath math="q(j)" /> is the
              unnormalised probability of having <InlineMath math="j" />{" "}
              occupied b.u. in this resource, over all{" "}
              <InlineMath math="x \in I_l = \{\, x \in I : l \in R_x \,\}" />.{" "}
              <InlineMath math="R_x" /> is the set of resources that this
              service class call <InlineMath math="x" /> can traverse in the
              network.
            </p>

            <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
              <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">
                📉
              </span>
              <p className="text-sm text-violet-900 leading-relaxed">
                The fixed-point method uses a <strong>reduced</strong>{" "}
                traffic-load of a service class when traversing through a
                sequence of resources or links. The benefit is that it models
                multirate networks more accurately, leading to better CBP
                predictions and more efficient resource allocation. In a network
                where multiple service classes compete for resources, the actual
                load seen by a resource is often less than the sum of individual
                traffic demands. This happens because blocked calls do not
                contribute to further congestion, since they never reach later
                resources. The reduced traffic load accounts for this effect,
                providing a more realistic estimate of the load on a given
                resource.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              This can be represented by reducing the offered load{" "}
              <InlineMath math="\alpha_x" /> for resource{" "}
              <InlineMath math="l" /> by the blocking met on the other resources
              of the route:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath math="V_{lk} = B_{lk} = \Bigl[C_l;\, \alpha_x \cdot \!\!\prod_{l \in R_x - \{l\}}\!\! \bigl(1 - V_{lx}\bigr),\, x \in K_l\Bigr], \quad k \in K_l,\ l = 1, 2, \dots, L" />
            </div>

            <p className="text-slate-600 leading-relaxed text-sm">
              where{" "}
              <InlineMath math="\prod_{l \in R_x - \{l\}} \bigl(1 - V_{lx}\bigr)" />{" "}
              is the reduced factor multiplied by <InlineMath math="\alpha_x" />
              , which denotes the reduced traffic load. This reduction accounts
              for the fact that blocking is dependent on each individual
              resource, meaning that blocking on the other resources (excluding
              the current resource <InlineMath math="l" />) is also considered
              in the overall blocking probability.
            </p>

            {/* Parameter table */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Symbols
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                {[
                  ["B_{li}", "Blocking probability of class i on resource l"],
                  [
                    "V_{lk}",
                    "Reduced-load blocking probability of class k on resource l",
                  ],
                  ["L", "Number of resources (links) in the network"],
                  ["I", "Number of service classes"],
                  ["C_l", "Capacity of resource l in bandwidth units (b.u.)"],
                  [
                    "b_i",
                    "Bandwidth a class-i call needs on the resource (b.u.)",
                  ],
                  ["\\alpha_x", "Offered traffic load of a call x (erl)"],
                  ["R_x", "Set of resources a class-x call traverses"],
                  ["I_l", "Service classes that traverse resource l"],
                  ["G", "Normalisation constant of the occupancy distribution"],
                ].map(([sym, desc]) => (
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
        </div>
      </div>
    </div>
  );
}
