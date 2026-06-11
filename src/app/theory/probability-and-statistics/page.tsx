"use client";

import Layout from "@/components/layout";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";

type VideoCard = {
  id: string;
  title: string;
  topic: string;
  description: string;
};

const videos: VideoCard[] = [
  {
    id: "XLhlHcVzJXc",
    title: "Summation and Product Form",
    topic: "Basics",
    description:
      "An introduction to Sigma (summation) and Pi (product) notation: the building blocks for expressing probability distributions, normalisation constants, and steady-state formulas compactly.",
  },
];

export default function ProbabilityAndStatisticsPage() {
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
                Probability &amp; Statistics
              </span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Probability &amp; Statistics
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Foundational concepts in probability and statistics.
            </p>
          </div>

          {/* Course callout */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">
              📌
            </span>
            <p className="text-sm text-amber-900 leading-relaxed">
              This series closely follows the lecture schedules of{" "}
              <strong>Stanford University&apos;s CS 109</strong> (Probability
              for Computer Scientists) and{" "}
              <strong>University of Washington&apos;s CSE 312</strong>{" "}
              (Foundations of Computing II).
            </p>
          </div>

          {/* Intro */}
          <section className="space-y-3">
            <p className="text-slate-600 leading-relaxed">
              Before working with traffic models such as Erlang-B or the
              Kaufman-Roberts recursion, it helps to be comfortable with the
              mathematical notation and tools used throughout. The sections and
              videos below cover these prerequisites clearly and concisely.
            </p>
          </section>

          {/* Factorials */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Factorials</h2>

            <p className="text-slate-600 leading-relaxed">
              A factorial is written as <InlineMath math="n!" /> and means
              multiplying <InlineMath math="n" /> by every positive whole number
              smaller than it, all the way down to 1:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath math="n! = n \times (n-1) \times (n-2) \times \cdots \times 1" />
            </div>

            <p className="text-slate-600 leading-relaxed">
              For example, a very simple case:
            </p>

            <div className="overflow-x-auto py-1">
              <BlockMath math="4! = 4 \times 3 \times 2 \times 1 = 24" />
            </div>

            {/* 0! = 1 callout */}
            <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
              <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">
                ℹ️
              </span>
              <p className="text-sm text-sky-900 leading-relaxed">
                By definition, <InlineMath math="0! = 1" />. There is exactly
                one way to arrange zero things: do nothing.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Factorials count the number of ways to{" "}
              <strong>arrange (order) a set of distinct things</strong>. For
              example, say you have 3 books, A, B and C, and you want to line
              them up on a shelf. There are{" "}
              <InlineMath math="3! = 3 \times 2 \times 1 = 6" /> different
              orderings:
            </p>

            {/* Visual: all 6 permutations of books A, B, C */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["A", "B", "C"]
                .flatMap((a) =>
                  ["A", "B", "C"]
                    .filter((b) => b !== a)
                    .flatMap((b) =>
                      ["A", "B", "C"]
                        .filter((c) => c !== a && c !== b)
                        .map((c) => [a, b, c]),
                    ),
                )
                .map((order, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex gap-1.5">
                      {order.map((letter, j) => {
                        const colors: Record<string, string> = {
                          A: "bg-sky-500",
                          B: "bg-emerald-500",
                          C: "bg-amber-500",
                        };
                        return (
                          <div
                            key={j}
                            className={`w-9 h-11 rounded-md text-white flex items-center justify-center text-sm font-bold shadow-sm ${colors[letter]}`}
                          >
                            {letter}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-slate-400">
                      {i + 1}. {order.join("")}
                    </span>
                  </div>
                ))}
            </div>

            <p className="text-slate-600 leading-relaxed">
              That&apos;s the same idea behind terms like{" "}
              <InlineMath math="i!" /> and <InlineMath math="C!" /> that show up
              in the Erlang-B and Kaufman-Roberts formulas: they count how many
              ways things can be arranged.
            </p>
          </section>

          {/* Video list */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700">
              Video Resources
            </h2>

            {videos.map((v) => (
              <div
                key={v.id}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Embed */}
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Meta */}
                <div className="p-4 space-y-1 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                      {v.topic}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </Layout>
  );
}
