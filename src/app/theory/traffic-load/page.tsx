import Layout from "@/components/layout";
import { BlockMath, InlineMath } from "react-katex";
import Link from "next/link";

// ─── call data for the diagram ────────────────────────────────────────────────
// Each call: { line (0-3), start (min), duration (min) }
const CALLS = [
  { line: 0, start: 0, duration: 10 },
  { line: 0, start: 22, duration: 2 },
  { line: 1, start: 7, duration: 16 },
  { line: 2, start: 0, duration: 5 },
  { line: 2, start: 8, duration: 1 },
  { line: 2, start: 13, duration: 5 },
  { line: 2, start: 21, duration: 3 },
  { line: 3, start: 2, duration: 5 },
  { line: 3, start: 11, duration: 10 },
  { line: 3, start: 24, duration: 5 },
];

const PERIOD = 30; // minutes
const SVG_W = 520;
const LABEL_W = 52;
const TRACK_W = SVG_W - LABEL_W - 16;
const ROW_H = 28;
const BAR_H = 16;
const SVG_H = 4 * ROW_H + 48;
const COLORS = ["#38bdf8", "#34d399", "#f472b6", "#fb923c"];

function toX(min: number) {
  return LABEL_W + (min / PERIOD) * TRACK_W;
}

const totalDuration = CALLS.reduce((s, c) => s + c.duration, 0); // 69 min

// ─── page ─────────────────────────────────────────────────────────────────────
export default function TrafficLoadPage() {
  return (
    <Layout>
      <div className="min-h-screen p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span>Theory & Formulas</span>
              {" / "}
              <span className="text-slate-700">Traffic Load</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">Traffic Load</h1>
          </div>

          {/* Plain-English intro */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">
              What is it?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Imagine you run a small call centre with 4 phone lines. Over 30
              minutes, 10 calls come in, each lasting a different amount of
              time. Some lines are busy for most of those 30 minutes; others are
              free for long stretches.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Traffic load</strong> answers the question:{" "}
              <em>on average, how many lines were busy at any given moment?</em>{" "}
              It is the ratio of the total time lines were occupied to the
              length of the observation window.
            </p>
            <BlockMath math="\text{Traffic load} = \frac{\text{sum of call durations}}{\text{observation time}}" />
          </section>

          {/* Visual diagram */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Example: 4 lines, 10 calls, 30 minutes
            </h2>
            <p className="text-slate-600">
              Each coloured bar is one call. The width of the bar is its
              duration in minutes.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full"
                style={{ minWidth: 320 }}
              >
                {/* axis ticks */}
                {[0, 5, 10, 15, 20, 25, 30].map((t) => (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={4}
                      x2={toX(t)}
                      y2={SVG_H - 20}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                    />
                    <text
                      x={toX(t)}
                      y={SVG_H - 6}
                      fontSize={10}
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {t}m
                    </text>
                  </g>
                ))}

                {/* line labels */}
                {[0, 1, 2, 3].map((i) => (
                  <text
                    key={i}
                    x={LABEL_W - 6}
                    y={14 + i * ROW_H + BAR_H / 2 + 4}
                    fontSize={10}
                    fill="#64748b"
                    textAnchor="end"
                  >
                    Line {i + 1}
                  </text>
                ))}

                {/* call bars */}
                {CALLS.map((c, i) => {
                  const x = toX(c.start);
                  const w = (c.duration / PERIOD) * TRACK_W;
                  const y = 14 + c.line * ROW_H;
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={BAR_H}
                        rx={3}
                        fill={COLORS[c.line]}
                        opacity={0.85}
                      />
                      <text
                        x={x + w / 2}
                        y={y + BAR_H / 2 + 4}
                        fontSize={9}
                        fill="white"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {c.duration}m
                      </text>
                    </g>
                  );
                })}

                {/* total period arrow */}
                <line
                  x1={toX(0)}
                  y1={SVG_H - 22}
                  x2={toX(30)}
                  y2={SVG_H - 22}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  markerEnd="url(#arrow)"
                  markerStart="url(#arrowL)"
                />
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="6"
                    markerHeight="6"
                    refX="3"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="arrowL"
                    markerWidth="6"
                    markerHeight="6"
                    refX="3"
                    refY="3"
                    orient="auto-start-reverse"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
                  </marker>
                </defs>
              </svg>
            </div>
          </section>

          {/* Step-by-step calculation */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Step-by-step calculation
            </h2>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-600">
                  Step 1: add up all call durations
                </p>
                <BlockMath math="10 + 2 + 16 + 5 + 1 + 5 + 3 + 5 + 10 + 5 = 62 \text{ min}" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-600">
                  Step 2: divide by the observation period
                </p>
                <BlockMath math="\text{Traffic load} = \frac{62 \text{ min}}{30 \text{ min}} \approx 2.07 \text{ erl}" />
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <p className="text-slate-700">
                  This means that on average, about{" "}
                  <strong>2 out of 4 lines</strong> were busy at any point
                  during those 30 minutes.
                </p>
              </div>
            </div>
          </section>

          {/* The formula */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              The general formula
            </h2>
            <p className="text-slate-600">
              Instead of adding individual call durations, you can express
              traffic load using two summary numbers:
            </p>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
              <ul className="space-y-2 text-slate-600">
                <li>
                  <InlineMath math="C" />: total number of calls in the period
                </li>
                <li>
                  <InlineMath math="h" />: mean call duration
                </li>
              </ul>
              <BlockMath math="\alpha = \frac{C \cdot h}{T}" />
              <p className="text-slate-600 text-sm">
                where <InlineMath math="T" /> is the observation period. Since{" "}
                <InlineMath math="C \cdot h" /> is just the total occupied time,
                this is identical to the definition above.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2">
              <p className="text-slate-700 font-medium">
                Applied to the example:
              </p>
              <BlockMath math="\alpha = \frac{10 \times 6.2}{30} = \frac{62}{30} \approx 2.07 \text{ erl}" />
              <p className="text-slate-600 text-sm">
                (<InlineMath math="h = 62 / 10 = 6.2" /> min average call
                duration)
              </p>
            </div>
          </section>

          {/* Unit: erlang */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">
              The unit: erlang
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Traffic load is measured in <strong>erlangs (erl)</strong>, named
              after the Danish engineer A. K. erlang. Because it is a ratio of
              two times, it is dimensionless. 1 erlang simply means one circuit
              continuously occupied for the entire observation period.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {[
                { value: "0.5 erl", label: "line busy 50% of the time" },
                { value: "1 erl", label: "line busy 100% of the time" },
                { value: "2 erl", label: "2 lines fully busy on average" },
              ].map(({ value, label }) => (
                <div
                  key={value}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                >
                  <div className="text-lg font-bold text-sky-500">{value}</div>
                  <div className="text-xs text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Connection to erlang-B */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700">
              Connection to erlang-B
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The traffic load <InlineMath math="\alpha" /> is exactly the{" "}
              <em>offered traffic</em> input to the erlang-B model. Given{" "}
              <InlineMath math="\alpha" /> and the number of available lines{" "}
              <InlineMath math="C" />, erlang-B tells you the probability that
              an incoming call finds all lines busy and gets blocked.
            </p>
            <Link
              href="/erlang"
              className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
            >
              Try the Erlang-B Model →
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
