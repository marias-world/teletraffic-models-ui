import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../constants";
import { kaufmanRoberts } from "../kaufman-roberts/kaufman-roberts-formula";
import { networkTopology, ServiceClassWithRoute } from "../types";

const DEFAULT_THRESHOLD = 0.000001;
const MAX_ITERATIONS = 5000;
// If the same (rounded) step size repeats this many times, the iteration is
// treated as oscillating rather than genuinely still converging.
const OSCILLATION_REPEAT_LIMIT = 20;
// When oscillation is detected, the relaxation (damping) factor is
// multiplied by this each time, shrinking the step size until it settles.
const DAMPING_DECAY = 0.5;
const MIN_DAMPING = 0.05;

interface BlockingProbabilityResult {
  finalResult: { [key: string]: number };
  linkStateProbabilities: Record<string, Record<string, number>>;
}

const initializeResult = (
  key: string,
  previousResult: { [key: string]: number },
  initialResult: number,
): number => {
  return previousResult[key] !== undefined
    ? previousResult[key]
    : initialResult;
};

const calculateIncomingLoad = (
  serviceClass: ServiceClassWithRoute,
  link: networkTopology,
  result: { [key: string]: number },
  previousResult: { [key: string]: number },
  initialResult: number,
): number => {
  const { route, incomingLoad_a, serviceClass: scId } = serviceClass;
  let updatedLoad = incomingLoad_a;

  route.forEach((otherLink) => {
    if (otherLink.link !== link.link) {
      const key = `V_link${otherLink.link}_class_${scId}`;
      const blockingProb = initializeResult(key, previousResult, initialResult);
      result[key] = blockingProb;
      updatedLoad *= 1 - blockingProb;
    }
  });
  return updatedLoad;
};

export const blockingProbabilityNetworkTopology = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  previousResult: { [key: string]: number },
): BlockingProbabilityResult => {
  const result: { [key: string]: number } = {};
  const finalResult: { [key: string]: number } = {};
  const initialResult = 1;
  let linkStateProbabilities: Record<string, Record<string, number>> = {};

  links.forEach((link) => {
    const newServiceClasses = serviceClasses
      .filter((sc) => sc.route.some((r) => r.link === link.link))
      .map((sc) => ({
        ...sc,
        bu: sc.route.find((r) => r.link === link.link)?.bu || 0,
        incomingLoad_a: calculateIncomingLoad(
          sc,
          link,
          result,
          previousResult,
          initialResult,
        ),
      }));

    let stateProbabilityValues;
    try {
      if (link.bu <= 0 || link.bu === undefined) return; // Skip if link capacity is zero or negative

      stateProbabilityValues = kaufmanRoberts(link.bu, newServiceClasses);
      linkStateProbabilities[`link_${link.link}`] = stateProbabilityValues;
    } catch (error) {
      throw new Error(
        `Error in kaufmanRoberts calculation for link ${link.link}: ${error}`,
      );
    }

    newServiceClasses.forEach((sc) => {
      let cumulativeBlockingProb = 0;
      const requested_bu = sc.bu;

      for (let j = link.bu - requested_bu + 1; j <= link.bu; j++) {
        const q_i = stateProbabilityValues[`q(${j})`] || 0;

        cumulativeBlockingProb += q_i;
      }

      finalResult[`V_link${link.link}_class_${sc.serviceClass}`] =
        cumulativeBlockingProb;
    });
  });

  return { finalResult, linkStateProbabilities };
};

export const calculateBlockingWithReducedTrafficLoad = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  threshold: number = DEFAULT_THRESHOLD,
): BlockingProbabilityResult => {
  let currentResult = blockingProbabilityNetworkTopology(
    links,
    serviceClasses,
    {},
  );
  let differenceCount: { [key: string]: number } = {};
  let iterations = 0;
  // Starts undamped (1 = take the raw result outright), exactly like the
  // original iteration. Damping only kicks in, and is only strengthened,
  // once oscillation is actually detected, so well-behaved topologies that
  // already converge cleanly are completely unaffected.
  let damping = 1;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const previousResult = { ...currentResult };
    const rawNextResult = blockingProbabilityNetworkTopology(
      links,
      serviceClasses,
      previousResult.finalResult,
    );

    const dampedFinalResult: { [key: string]: number } = {};
    for (const key of Object.keys(rawNextResult.finalResult)) {
      const prevValue =
        previousResult.finalResult[key] ?? rawNextResult.finalResult[key];
      dampedFinalResult[key] =
        prevValue + damping * (rawNextResult.finalResult[key] - prevValue);
    }
    currentResult = {
      finalResult: dampedFinalResult,
      linkStateProbabilities: rawNextResult.linkStateProbabilities,
    };

    const maxDifference = Math.max(
      ...Object.keys(currentResult.finalResult).map((key) =>
        Math.abs(
          (currentResult.finalResult[key] || 0) -
            (previousResult.finalResult
              ? previousResult.finalResult[key] || 0
              : 0),
        ),
      ),
    );

    if (maxDifference <= threshold) break;

    // Round before using as a dictionary key: without this, floating-point
    // noise between otherwise-identical oscillating iterations can produce
    // slightly different numbers each time, so the "same difference
    // repeating" check below would never trigger.
    const roundedDifference = maxDifference.toFixed(10);
    differenceCount[roundedDifference] =
      (differenceCount[roundedDifference] || 0) + 1;

    if (differenceCount[roundedDifference] >= OSCILLATION_REPEAT_LIMIT) {
      if (damping > MIN_DAMPING) {
        // Oscillating: shrink the step size and keep going instead of
        // giving up. This is what lets topologies that used to bounce
        // between two or more states forever settle into a fixed point.
        damping *= DAMPING_DECAY;
        differenceCount = {};
        console.warn(
          `RLA fixed-point iteration is oscillating; reducing damping to ${damping} and continuing.`,
        );
        continue;
      }
      console.warn(
        "RLA fixed-point iteration is still oscillating after damping; stopping early with the best available estimate.",
      );
      break;
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn("Reached maximum iterations without convergence.");
  }

  console.log(`Number of iterations: ${iterations}`);

  return {
    finalResult: currentResult.finalResult,
    linkStateProbabilities: currentResult.linkStateProbabilities,
  };
};

export const callBlockingProbabilityinRLA = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  threshold: number = DEFAULT_THRESHOLD,
): { [key: string]: number } => {
  const blockingProbabilities = calculateBlockingWithReducedTrafficLoad(
    links,
    serviceClasses,
    threshold,
  );
  const result: { [key: string]: number } = {};

  serviceClasses.forEach((sc) => {
    const { serviceClass, route } = sc;
    const totalBlockingProbability = route.reduce((cbp, link) => {
      const key = `V_link${link.link}_class_${serviceClass}`;
      return cbp * (1 - (blockingProbabilities.finalResult[key] || 0));
    }, 1);

    // Clamp to [0, 1]: multiplying several (1 - V) terms together can drift
    // very slightly negative from floating-point rounding, especially when
    // a class can never fit on one of its links (V close to or at 1), which
    // would otherwise show up as a blocking probability just over 1
    // (e.g. 1.0000001) instead of the true value of 1.
    const clampedTotalBlockingProbability = Math.max(
      0,
      Math.min(1, totalBlockingProbability),
    );
    result[`B${serviceClass}`] = +(
      1 - clampedTotalBlockingProbability
    ).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL);
  });

  return result;
};

export const callBlockingProbabilityinRLAForProposedModel = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  threshold: number = DEFAULT_THRESHOLD,
): { [key: string]: number } => {
  const blockingProbabilities = calculateBlockingWithReducedTrafficLoad(
    links,
    serviceClasses,
    threshold,
  );
  const logs: { [key: string]: number } = {};

  serviceClasses.forEach((sc) => {
    const { serviceClass, route } = sc;
    route.forEach((link) => {
      const key = `V_link${link.link}_class_${serviceClass}`;
      const value = blockingProbabilities.finalResult[key];
      logs[key] = value;
    });
  });

  return logs;
};
