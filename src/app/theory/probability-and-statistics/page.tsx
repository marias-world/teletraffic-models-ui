import Layout from "@/components/layout";
import Link from "next/link";

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
              mathematical notation and tools used throughout. The videos below
              cover these prerequisites clearly and concisely.
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
