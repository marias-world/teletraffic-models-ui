import { exponential, mulberry32 } from "./random";
import { meanAndStdev } from "./stats";
import {
  makeServiceSampler,
  ServiceDistribution,
} from "./service-time-distributions";

export interface EmlmServiceClassParams {
  bu: number;
  offeredLoad: number;
  serviceRate: number;
}

export interface EmlmSimulationParams {
  capacity: number;
  serviceClasses: EmlmServiceClassParams[];
  numCallsToSimulate: number;
  seed: number;
  warmupFraction?: number;
  serviceDist?: ServiceDistribution;
}

export interface EmlmSimulationResult {
  q: number[];
  classBlocking: number[];
  classOffered: number[];
  classAccepted: number[];
  classBlocked: number[];
  utilization: number;
}

const DEFAULT_WARMUP_FRACTION = 0.05;

export function runEmlmSimulation(
  params: EmlmSimulationParams,
): EmlmSimulationResult {
  const {
    capacity,
    serviceClasses,
    numCallsToSimulate,
    seed,
    warmupFraction = DEFAULT_WARMUP_FRACTION,
    serviceDist = "exponential",
  } = params;

  if (!Number.isInteger(capacity) || capacity <= 0 || numCallsToSimulate <= 0) {
    throw new Error(
      "capacity must be a positive whole number and numCallsToSimulate must be positive.",
    );
  }
  if (serviceClasses.length === 0) {
    throw new Error("need at least one service class");
  }
  for (const sc of serviceClasses) {
    if (!Number.isInteger(sc.bu) || sc.bu <= 0) {
      throw new Error("each class's bu must be a positive whole number.");
    }
    if (sc.offeredLoad <= 0 || sc.serviceRate <= 0) {
      throw new Error(
        "each class's offered load and service rate must be positive.",
      );
    }
  }

  const numClasses = serviceClasses.length;
  const rng = mulberry32(seed);

  const classBu = serviceClasses.map((sc) => sc.bu);
  const arrivalRates = serviceClasses.map(
    (sc) => sc.offeredLoad * sc.serviceRate,
  );
  // The holding-time strategy is picked once per class, up front.
  const holdingTime = serviceClasses.map((sc) =>
    makeServiceSampler(serviceDist, rng, sc.serviceRate),
  );

  const warmupCalls = Math.floor(warmupFraction * numCallsToSimulate);
  const totalArrivalsNeeded = numCallsToSimulate + warmupCalls;

  const timeInState = new Float64Array(capacity + 1);
  let lastEventTime = 0;

  const departureTimes = new Float64Array(capacity);
  const departureClass = new Int32Array(capacity);
  let activeCalls = 0;

  let occupied = 0;
  let arrivalsGenerated = 0;
  const acceptedCount = new Array<number>(numClasses).fill(0);
  const blockedCount = new Array<number>(numClasses).fill(0);
  let warmedUp = warmupCalls === 0;

  const nextArrival = new Float64Array(numClasses);
  for (let k = 0; k < numClasses; k++) {
    nextArrival[k] = exponential(rng, arrivalRates[k]);
  }

  while (true) {
    let now = nextArrival[0];
    let arrivingClass = 0;
    for (let k = 1; k < numClasses; k++) {
      if (nextArrival[k] < now) {
        now = nextArrival[k];
        arrivingClass = k;
      }
    }
    let departingSlot = -1;
    for (let i = 0; i < activeCalls; i++) {
      if (departureTimes[i] < now) {
        now = departureTimes[i];
        departingSlot = i;
      }
    }

    if (warmedUp) {
      timeInState[occupied] += now - lastEventTime;
    }
    lastEventTime = now;

    if (departingSlot >= 0) {
      occupied -= classBu[departureClass[departingSlot]];
      activeCalls -= 1;
      departureTimes[departingSlot] = departureTimes[activeCalls];
      departureClass[departingSlot] = departureClass[activeCalls];
      continue;
    }

    // Arrival event for class `arrivingClass`.
    arrivalsGenerated += 1;
    if (arrivalsGenerated > totalArrivalsNeeded) break;

    nextArrival[arrivingClass] =
      now + exponential(rng, arrivalRates[arrivingClass]);

    const bu = classBu[arrivingClass];
    const accepted = occupied + bu <= capacity;
    if (accepted) {
      occupied += bu;
      departureTimes[activeCalls] = now + holdingTime[arrivingClass]();
      departureClass[activeCalls] = arrivingClass;
      activeCalls += 1;
    }

    if (!warmedUp && arrivalsGenerated > warmupCalls) {
      warmedUp = true;
    }

    if (warmedUp) {
      if (accepted) {
        acceptedCount[arrivingClass] += 1;
      } else {
        blockedCount[arrivingClass] += 1;
      }
    }
  }

  let totalTime = 0;
  for (let j = 0; j <= capacity; j++) totalTime += timeInState[j];
  if (totalTime === 0) {
    throw new Error(
      "No time elapsed after warm-up; check warm-up vs total call settings.",
    );
  }
  const q = Array.from(timeInState, (t) => t / totalTime);

  const classOffered: number[] = [];
  const classBlocking: number[] = [];
  for (let k = 0; k < numClasses; k++) {
    const offered = acceptedCount[k] + blockedCount[k];
    if (offered === 0) {
      throw new Error(
        `No calls of class ${k + 1} were counted; try more calls per seed or a larger offered load for that class.`,
      );
    }
    classOffered.push(offered);
    classBlocking.push(blockedCount[k] / offered);
  }

  const avgOccupied = q.reduce((sum, qj, j) => sum + j * qj, 0);
  const utilization = avgOccupied / capacity;

  return {
    q,
    classBlocking,
    classOffered,
    classAccepted: acceptedCount,
    classBlocked: blockedCount,
    utilization,
  };
}

export interface EmlmReplicationSummary {
  qMean: number[];
  // Sample standard deviation of q(j) across seeds, one entry per state.
  qStdev: number[];
  utilization: number;
  // Per class, across seeds.
  classBlockingMean: number[];
  classBlockingStdev: number[];
  // Per class, summed across every seed: calls counted (after warm-up),
  // split into offered / accepted / blocked.
  classOfferedTotal: number[];
  classAcceptedTotal: number[];
  classBlockedTotal: number[];
  n: number;
}

export function aggregateEmlmRuns(
  runs: EmlmSimulationResult[],
): EmlmReplicationSummary {
  const numClasses = runs[0].classBlocking.length;

  const qStats = runs[0].q.map((_, j) => meanAndStdev(runs.map((r) => r.q[j])));
  const blockingStats = Array.from({ length: numClasses }, (_, k) =>
    meanAndStdev(runs.map((r) => r.classBlocking[k])),
  );
  const totalFor = (pick: (r: EmlmSimulationResult) => number[]) =>
    Array.from({ length: numClasses }, (_, k) =>
      runs.reduce((sum, r) => sum + pick(r)[k], 0),
    );

  return {
    qMean: qStats.map((s) => s.mean),
    qStdev: qStats.map((s) => s.stdev),
    utilization: runs.reduce((sum, r) => sum + r.utilization, 0) / runs.length,
    classBlockingMean: blockingStats.map((s) => s.mean),
    classBlockingStdev: blockingStats.map((s) => s.stdev),
    classOfferedTotal: totalFor((r) => r.classOffered),
    classAcceptedTotal: totalFor((r) => r.classAccepted),
    classBlockedTotal: totalFor((r) => r.classBlocked),
    n: runs.length,
  };
}

// Runs the simulation once per seed and aggregates the results.
export function replicateEmlmSimulation(
  seeds: number[],
  params: Omit<EmlmSimulationParams, "seed">,
): EmlmReplicationSummary {
  const runs = seeds.map((seed) => runEmlmSimulation({ ...params, seed }));
  return aggregateEmlmRuns(runs);
}
