import { timeAverageBlocking } from "./blockingStates";
import type { EmlmOutput } from "./types";

// Builds a CSV with the parameters used, the per-seed results, and the
// aggregate/analytical summaries, so the raw numbers can be opened in a
// spreadsheet for charting instead of only being readable in the on-page
// tables.
export function buildEmlmResultsCsv(output: EmlmOutput): string {
  const {
    summary,
    runs,
    seeds,
    capacity,
    callsPerSeed,
    serviceDist,
    classes,
    analyticalQ,
    analyticalBlocking,
    elapsedMs,
  } = output;

  const lines: string[] = [];

  lines.push("Parameters");
  lines.push("parameter,value");
  lines.push(`capacity,${capacity}`);
  lines.push(`callsPerSeed,${callsPerSeed}`);
  lines.push(`serviceDistribution,${serviceDist}`);
  lines.push("");
  lines.push("class,bu,offeredLoad,serviceRate,arrivalRate");
  classes.forEach((c, k) => {
    lines.push(
      [
        k + 1,
        c.bu,
        c.offeredLoad,
        c.serviceRate,
        c.offeredLoad * c.serviceRate,
      ].join(","),
    );
  });

  lines.push("");
  lines.push("Per-seed results");
  lines.push(
    [
      "seed",
      "utilization",
      ...classes.map((_, k) => `blocking(class ${k + 1})`),
      ...analyticalQ.map((_, j) => `q(${j})`),
    ].join(","),
  );
  seeds.forEach((seed, i) => {
    const run = runs[i];
    lines.push(
      [seed, run.utilization, ...run.classBlocking, ...run.q].join(","),
    );
  });

  lines.push("");
  lines.push("Per-class summary across seeds");
  lines.push(
    "class,bu,offeredLoad,blockingMean,blockingStdev,analyticalBlocking,timeAverageBlockedStates,offered,accepted,blocked",
  );
  classes.forEach((c, k) => {
    lines.push(
      [
        k + 1,
        c.bu,
        c.offeredLoad,
        summary.classBlockingMean[k],
        summary.classBlockingStdev[k],
        analyticalBlocking[k],
        timeAverageBlocking(summary.qMean, capacity, c.bu),
        summary.classOfferedTotal[k],
        summary.classAcceptedTotal[k],
        summary.classBlockedTotal[k],
      ].join(","),
    );
  });

  lines.push("");
  lines.push("Summary");
  lines.push("metric,value");
  lines.push(`n,${summary.n}`);
  lines.push(`utilization,${summary.utilization}`);
  lines.push(`wallClockSeconds,${elapsedMs / 1000}`);

  lines.push("");
  lines.push("q(j): simulated (mean, stdev) vs analytical");
  lines.push("state,simulatedMean,simulatedStdev,analytical");
  for (let j = 0; j <= capacity; j++) {
    lines.push(
      [j, summary.qMean[j], summary.qStdev[j], analyticalQ[j]].join(","),
    );
  }

  return lines.join("\n");
}
