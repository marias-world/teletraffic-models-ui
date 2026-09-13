"use client";

import { forwardRef } from "react";

const SIMULATED_COLOR = "#0ea5e9";
const ANALYTICAL_COLOR = "#f97316";
const AXIS_COLOR = "#334155";
const GRID_COLOR = "#e2e8f0";
const TEXT_COLOR = "#334155";

interface QComparisonChartProps {
  qMean: number[];
  analyticalQ: number[];
}

// Inline SVG line chart comparing simulated vs analytical q(j), the same
// hand-rolled-SVG approach (no charting library) used by the Python
// reference implementation's --plot option, so both sides of this page's
// "simulation vs analytical" story render the same kind of chart. Forwards
// the <svg> node itself so a parent can serialize it for a "download as
// image" button without any extra state or effects.
const QComparisonChart = forwardRef<SVGSVGElement, QComparisonChartProps>(
  function QComparisonChart({ qMean, analyticalQ }, ref) {
  const capacity = analyticalQ.length - 1;
  const width = 700;
  const height = 340;
  const marginLeft = 55;
  const marginRight = 20;
  const marginTop = 40;
  const marginBottom = 40;
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const maxValue = Math.max(...qMean, ...analyticalQ);
  const yMax = maxValue > 0 ? maxValue * 1.15 : 1;

  const states = Array.from({ length: capacity + 1 }, (_, j) => j);
  const xFor = (j: number) =>
    marginLeft + (capacity > 0 ? (plotWidth * j) / capacity : 0);
  const yFor = (value: number) =>
    marginTop + plotHeight * (1 - value / yMax);

  const ticks = Array.from({ length: 6 }, (_, i) => (yMax * i) / 5);

  const pointsFor = (values: number[]) =>
    states.map((j) => `${xFor(j)},${yFor(values[j])}`).join(" ");

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
    >
      <rect x={0} y={0} width={width} height={height} fill="white" />
      <text
        x={width / 2}
        y={20}
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
        fill={TEXT_COLOR}
      >
        q(j): simulated vs analytical
      </text>

      {ticks.map((value) => (
        <g key={value}>
          <line
            x1={marginLeft}
            x2={width - marginRight}
            y1={yFor(value)}
            y2={yFor(value)}
            stroke={GRID_COLOR}
          />
          <text
            x={marginLeft - 8}
            y={yFor(value) + 4}
            fontSize={10}
            textAnchor="end"
            fill={TEXT_COLOR}
          >
            {value.toFixed(3)}
          </text>
        </g>
      ))}

      <line
        x1={marginLeft}
        y1={marginTop}
        x2={marginLeft}
        y2={height - marginBottom}
        stroke={AXIS_COLOR}
      />
      <line
        x1={marginLeft}
        y1={height - marginBottom}
        x2={width - marginRight}
        y2={height - marginBottom}
        stroke={AXIS_COLOR}
      />

      {states.map((j) => (
        <text
          key={j}
          x={xFor(j)}
          y={height - marginBottom + 16}
          fontSize={11}
          textAnchor="middle"
          fill={TEXT_COLOR}
        >
          {j}
        </text>
      ))}
      <text
        x={width / 2}
        y={height - 6}
        fontSize={11}
        textAnchor="middle"
        fill={TEXT_COLOR}
      >
        state j (busy servers)
      </text>

      <polyline
        points={pointsFor(analyticalQ)}
        fill="none"
        stroke={ANALYTICAL_COLOR}
        strokeWidth={3}
        strokeDasharray="8 5"
      />
      {states.map((j) => (
        <g key={`a${j}`}>
          <rect
            x={xFor(j) - 4}
            y={yFor(analyticalQ[j]) - 4}
            width={8}
            height={8}
            fill={ANALYTICAL_COLOR}
          />
          {/* Value label below its point: when the two series are close
              (the common case, since that's the point of the simulation),
              the lines themselves land almost exactly on top of each
              other, so the only way to tell them apart is by the printed
              numbers, not by the line style. */}
          <text
            x={xFor(j)}
            y={yFor(analyticalQ[j]) + 16}
            fontSize={9}
            textAnchor="middle"
            fill={ANALYTICAL_COLOR}
          >
            {analyticalQ[j].toFixed(7)}
          </text>
        </g>
      ))}

      <polyline
        points={pointsFor(qMean)}
        fill="none"
        stroke={SIMULATED_COLOR}
        strokeWidth={3}
      />
      {states.map((j) => (
        <g key={`s${j}`}>
          <circle
            cx={xFor(j)}
            cy={yFor(qMean[j])}
            r={5}
            fill={SIMULATED_COLOR}
          />
          <text
            x={xFor(j)}
            y={yFor(qMean[j]) - 10}
            fontSize={9}
            textAnchor="middle"
            fill={SIMULATED_COLOR}
          >
            {qMean[j].toFixed(7)}
          </text>
        </g>
      ))}

      <line
        x1={width - marginRight - 150}
        y1={marginTop - 20}
        x2={width - marginRight - 134}
        y2={marginTop - 20}
        stroke={SIMULATED_COLOR}
        strokeWidth={3}
      />
      <text
        x={width - marginRight - 128}
        y={marginTop - 16}
        fontSize={11}
        fill={TEXT_COLOR}
      >
        simulated
      </text>
      <line
        x1={width - marginRight - 60}
        y1={marginTop - 20}
        x2={width - marginRight - 44}
        y2={marginTop - 20}
        stroke={ANALYTICAL_COLOR}
        strokeWidth={3}
        strokeDasharray="8 5"
      />
      <text
        x={width - marginRight - 38}
        y={marginTop - 16}
        fontSize={11}
        fill={TEXT_COLOR}
      >
        analytical
      </text>
    </svg>
  );
  },
);

export default QComparisonChart;
