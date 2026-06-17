"use client";

import { useState } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import InclusionExclusion from "../inclusion-exclusion/InclusionExclusion";

export default function InclusionEsclusionPage() {
  return (
      <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                {" / "}
                <span className="text-slate-400">Theory</span>
                {" / "}
                <span className="text-slate-700">Markov Chains</span>
              </p>
              <h1 className="text-2xl font-bold text-slate-800">
                Inclusion-Exclusion Principle
              </h1>
            </div>

            <InclusionExclusion />
          </div>
        </div>
      </div>
  );
}
