// Discrete-event simulation of an M/M/c/c (Erlang-B) loss system: calls
// arrive as a Poisson process, are served by `capacity` identical servers,
// and are blocked (lost, not queued) if every server is busy on arrival.
// Ported from a Python reference implementation that used a general
// event-heap; here the event list is bounded (at most one pending arrival
// plus one pending departure per busy server), so a fixed-size array of
// departure times stands in for the heap without changing the dynamics.

// Deterministic seeded PRNG (mulberry32) so a given seed always reproduces
// the same run - JS's Math.random() cannot be seeded.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Inverse-CDF sampling for an exponential(rate) random variable.
function exponential(rng: () => number, rate: number): number {
  return -Math.log(1 - rng()) / rate;
}

export interface ErlangBSimulationParams {
  arrivalRate: number;
  serviceRate: number;
  capacity: number;
  numCallsToSimulate: number;
  seed: number;
  // Fraction of arrivals used to warm up the system before counting starts,
  // so the empty-at-t=0 initial condition doesn't bias the statistics.
  warmupFraction?: number;
}

export interface ErlangBSimulationResult {
  // q[j]: simulated fraction of time the system spends with j busy servers.
  q: number[];
  // Fraction of *arrivals* that were blocked (an arrival-average quantity).
  callBlocking: number;
  // Average fraction of servers busy (a time-average quantity).
  utilization: number;
}

const DEFAULT_WARMUP_FRACTION = 0.05;

export function runErlangBSimulation(
  params: ErlangBSimulationParams,
): ErlangBSimulationResult {
  const {
    arrivalRate,
    serviceRate,
    capacity,
    numCallsToSimulate,
    seed,
    warmupFraction = DEFAULT_WARMUP_FRACTION,
  } = params;

  if (capacity <= 0 || numCallsToSimulate <= 0) {
    throw new Error("capacity and numCallsToSimulate must be positive.");
  }

  const rng = mulberry32(seed);

  const warmupCalls = Math.floor(warmupFraction * numCallsToSimulate);
  const totalArrivalsNeeded = numCallsToSimulate + warmupCalls;

  const timeInState = new Array<number>(capacity + 1).fill(0);
  let lastEventTime = 0;

  // departureTimes[i] = Infinity means server i is idle.
  const departureTimes = new Array<number>(capacity).fill(Infinity);
  let busyServers = 0;
  let arrivalsGenerated = 0;
  let acceptedCount = 0;
  let blockedCount = 0;
  let warmedUp = warmupCalls === 0;

  let nextArrivalTime = exponential(rng, arrivalRate);

  while (true) {
    // The next event is either the pending arrival or the earliest pending
    // departure - at most `capacity + 1` candidates, so a linear scan is
    // both simple and fast enough (no general priority queue needed).
    let now = nextArrivalTime;
    let departingServer = -1;
    for (let i = 0; i < capacity; i++) {
      if (departureTimes[i] < now) {
        now = departureTimes[i];
        departingServer = i;
      }
    }

    if (warmedUp) {
      timeInState[busyServers] += now - lastEventTime;
    }
    lastEventTime = now;

    if (departingServer >= 0) {
      departureTimes[departingServer] = Infinity;
      busyServers -= 1;
      continue;
    }

    // Arrival event.
    arrivalsGenerated += 1;
    if (arrivalsGenerated > totalArrivalsNeeded) break;

    nextArrivalTime = now + exponential(rng, arrivalRate);

    const accepted = busyServers < capacity;
    if (accepted) {
      const freeServer = departureTimes.indexOf(Infinity);
      departureTimes[freeServer] = now + exponential(rng, serviceRate);
      busyServers += 1;
    }

    if (!warmedUp && arrivalsGenerated > warmupCalls) {
      warmedUp = true;
    }

    if (warmedUp) {
      if (accepted) {
        acceptedCount += 1;
      } else {
        blockedCount += 1;
      }
    }
  }

  const counted = acceptedCount + blockedCount;
  if (counted === 0) {
    throw new Error(
      "No calls were counted; check warm-up vs total call settings.",
    );
  }

  const totalTime = timeInState.reduce((sum, t) => sum + t, 0);
  const q = timeInState.map((t) => t / totalTime);
  const callBlocking = blockedCount / counted;
  const avgBusy = q.reduce((sum, qj, j) => sum + j * qj, 0);
  const utilization = avgBusy / capacity;

  return { q, callBlocking, utilization };
}

export interface ReplicationSummary {
  qMean: number[];
  // Sample standard deviation of q(j) across seeds, one entry per state -
  // how much that state's estimate varies from run to run, same idea as
  // blockingStdev but per state instead of for the single blocking figure.
  qStdev: number[];
  utilization: number;
  blockingMean: number;
  blockingStdev: number;
  n: number;
}

// Mean and sample standard deviation of a set of independent observations
// (Bessel-corrected: divide by n-1, undefined for a single observation).
function meanAndStdev(values: number[]): { mean: number; stdev: number } {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.length > 1
      ? values.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
        (values.length - 1)
      : 0;
  return { mean, stdev: Math.sqrt(variance) };
}

// Combines independent replication runs into a mean/stdev summary. Shared
// by both the sequential path (replicateErlangBSimulation) and callers that
// gather the same per-seed runs some other way, e.g. in parallel across Web
// Workers, so the aggregation math is defined in exactly one place.
export function aggregateErlangBRuns(
  runs: ErlangBSimulationResult[],
): ReplicationSummary {
  const qStats = runs[0].q.map((_, j) => meanAndStdev(runs.map((r) => r.q[j])));
  const qMean = qStats.map((s) => s.mean);
  const qStdev = qStats.map((s) => s.stdev);

  const utilization =
    runs.reduce((sum, r) => sum + r.utilization, 0) / runs.length;

  const { mean: blockingMean, stdev: blockingStdev } = meanAndStdev(
    runs.map((r) => r.callBlocking),
  );

  return {
    qMean,
    qStdev,
    utilization,
    blockingMean,
    blockingStdev,
    n: runs.length,
  };
}

// Runs the simulation once per seed and aggregates the results - mirrors
// running several independent replications to get a confidence interval
// instead of trusting a single noisy run.
export function replicateErlangBSimulation(
  seeds: number[],
  params: Omit<ErlangBSimulationParams, "seed">,
): ReplicationSummary {
  const runs = seeds.map((seed) => runErlangBSimulation({ ...params, seed }));
  return aggregateErlangBRuns(runs);
}
