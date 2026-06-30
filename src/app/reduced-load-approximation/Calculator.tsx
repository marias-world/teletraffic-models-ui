"use client";

import { useState } from "react";
import { callBlockingProbabilityinRLA } from "@/lib/models/reduced-load-approximation/reduced-load-approximation";
import { linkUtilization_U } from "@/lib/models/reduced-load-approximation/link-utilization";
import { networkTopology, ServiceClassWithRoute } from "@/lib/models/types";

type LinkRow = { id: number; capacity: string };
type ServiceRow = { id: number; load: string; demands: Record<number, string> };

const DEFAULT_LINKS: LinkRow[] = [
  { id: 1, capacity: "4" },
  { id: 2, capacity: "5" },
];

const DEFAULT_SERVICES: ServiceRow[] = [
  { id: 1, load: "1", demands: { 1: "1", 2: "1" } },
  { id: 2, load: "1", demands: { 2: "2" } },
];

export default function Calculator() {
  const [links, setLinks] = useState<LinkRow[]>(DEFAULT_LINKS);
  const [rows, setRows] = useState<ServiceRow[]>(DEFAULT_SERVICES);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [utilization, setUtilization] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");

  const addLink = () => {
    const nextId = links.reduce((m, l) => Math.max(m, l.id), 0) + 1;
    setLinks((p) => [...p, { id: nextId, capacity: "" }]);
    setResults(null);
    setError("");
  };

  const removeLink = (id: number) => {
    if (links.length <= 1) return;
    setLinks((p) => p.filter((l) => l.id !== id));
    setRows((p) =>
      p.map((r) => {
        const { [id]: _, ...rest } = r.demands;
        return { ...r, demands: rest };
      }),
    );
    setResults(null);
    setError("");
  };

  const updateLink = (id: number, capacity: string) => {
    setLinks((p) => p.map((l) => (l.id === id ? { ...l, capacity } : l)));
    setError("");
  };

  const addRow = () => {
    const nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    setRows((p) => [...p, { id: nextId, load: "", demands: {} }]);
    setResults(null);
    setError("");
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((p) => p.filter((r) => r.id !== id));
    setResults(null);
    setError("");
  };

  const updateLoad = (id: number, load: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, load } : r)));
    setError("");
  };

  const updateDemand = (rowId: number, linkId: number, value: string) => {
    setRows((p) =>
      p.map((r) =>
        r.id === rowId ? { ...r, demands: { ...r.demands, [linkId]: value } } : r,
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
      const bu = Number(l.capacity);
      if (!l.capacity || isNaN(bu) || bu <= 0) {
        setError(`Please enter a valid capacity for link ${l.id}.`);
        return;
      }
      topology.push({ link: l.id, bu });
    }

    const serviceClasses: ServiceClassWithRoute[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const a = Number(row.load);
      if (!row.load || isNaN(a) || a <= 0) {
        setError(`Please enter a valid offered load for service class ${i + 1}.`);
        return;
      }
      const route = links
        .map((l) => ({ link: l.id, bu: Number(row.demands[l.id]) }))
        .filter((r) => r.bu > 0 && !isNaN(r.bu));
      if (route.length === 0) {
        setError(`Service class ${i + 1} must traverse at least one link.`);
        return;
      }
      serviceClasses.push({ serviceClass: i + 1, incomingLoad_a: a, route });
    }

    try {
      setResults(callBlockingProbabilityinRLA(topology, serviceClasses));
      setUtilization(linkUtilization_U(topology, serviceClasses));
    } catch (e) {
      setError(`Calculation failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Try it: RLA Calculator
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        Define the links and their capacities, then specify which links each
        service class traverses and its bandwidth demand on each. Leave a demand
        blank (or 0) if a class does not use that link.
      </p>

      {/* Links */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Links</p>
          <button
            onClick={addLink}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium border border-sky-300 rounded-md px-2 py-1 hover:bg-sky-50 transition"
          >
            + Add link
          </button>
        </div>
        <div className="grid gap-2 text-xs font-semibold text-slate-400 tracking-wider px-1 grid-cols-[48px_1fr_32px]">
          <span>Link</span>
          <span>Capacity (b.u.)</span>
          <span />
        </div>
        {links.map((l) => (
          <div
            key={l.id}
            className="grid gap-2 items-center grid-cols-[48px_1fr_32px]"
          >
            <span className="text-xs font-semibold text-slate-500">L{l.id}</span>
            <input
              type="number"
              min={1}
              value={l.capacity}
              onChange={(e) => updateLink(l.id, e.target.value)}
              placeholder="e.g. 5"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              onClick={() => removeLink(l.id)}
              disabled={links.length <= 1}
              className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Service classes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Service Classes</p>
          <button
            onClick={addRow}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium border border-sky-300 rounded-md px-2 py-1 hover:bg-sky-50 transition"
          >
            + Add class
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1"
            style={{ minWidth: `${160 + links.length * 100}px` }}>
            <thead>
              <tr className="text-xs font-semibold text-slate-400 tracking-wider">
                <th className="text-left w-8 px-1" />
                <th className="text-left px-1 w-24">aₖ (erl)</th>
                {links.map((l) => (
                  <th key={l.id} className="text-left px-1">
                    b on L{l.id} (b.u.)
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.id}>
                  <td className="px-1">
                    <span className="text-xs font-semibold text-slate-500">
                      k{ri + 1}
                    </span>
                  </td>
                  <td className="px-1">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={row.load}
                      onChange={(e) => updateLoad(row.id, e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </td>
                  {links.map((l) => (
                    <td key={l.id} className="px-1">
                      <input
                        type="number"
                        min={0}
                        value={row.demands[l.id] ?? ""}
                        onChange={(e) =>
                          updateDemand(row.id, l.id, e.target.value)
                        }
                        placeholder="0"
                        className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-1 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}

      <button
        onClick={runModel}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition"
      >
        Run Model
      </button>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Call Blocking Probabilities
            </p>
            {Object.entries(results).map(([key, val]) => {
              const classNum = key.replace("B", "");
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    B<sub>{classNum}</sub> (class {classNum})
                  </span>
                  <span className="font-semibold text-slate-800">
                    {(val * 100).toFixed(4)}%
                  </span>
                </div>
              );
            })}
          </div>

          {utilization && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Link Utilization
              </p>
              {Object.entries(utilization).map(([key, val]) => {
                const linkNum = key.replace("link_", "");
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-600">Link {linkNum}</span>
                    <span className="font-semibold text-slate-800">{val}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
