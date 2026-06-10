import { ServiceClass, ServiceClassWithBR } from "../../models/types";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../../models/constants";
import { linkUtilizationFromProbabilities } from "./link-utilization";

export type StepGroup = {
  title: string;
  formulas: string[];
};

export type KaufmanRobertsStepsResult = {
  results: Record<string, number>;
  utilization: { U: number; efficiency: number };
  steps: StepGroup[];
};

const fmt = (n: number, digits = 4) => n.toFixed(digits);

/**
 * Computes the Kaufman-Roberts (EMLM) state probabilities and per-class
 * blocking probabilities, while also recording each step of the
 * calculation as a LaTeX string for display ("Show calculation").
 *
 * Works for both Complete Sharing (no `tk`) and Bandwidth Reservation
 * (`tk` present on each service class) policies.
 */
export function kaufmanRobertsWithSteps(
  capacity: number,
  serviceClasses: (ServiceClass | ServiceClassWithBR)[],
): KaufmanRobertsStepsResult {
  if (!serviceClasses.length || capacity <= 0) {
    return { results: {}, utilization: { U: 0, efficiency: 0 }, steps: [] };
  }

  const isBR = (serviceClasses[0] as ServiceClassWithBR).tk !== undefined;

  // ── Step 1: recursively build the unnormalised state probabilities ──────
  const recursionFormulas: string[] = [];
  const unnorm: number[] = Array(capacity + 1).fill(0);
  unnorm[0] = 1;
  recursionFormulas.push(`q(0) = 1 \\quad \\text{(base case)}`);

  for (let j = 1; j <= capacity; j++) {
    const symbolicTerms: string[] = [];
    const numericTerms: string[] = [];
    let sum = 0;

    serviceClasses.forEach((sc, idx) => {
      const tk = (sc as ServiceClassWithBR).tk ?? 0;
      const effectiveBu = isBR && j > capacity - tk ? 0 : sc.bu;
      if (effectiveBu <= 0 || sc.incomingLoad_a === 0) return;

      const prevIndex = j - effectiveBu;
      const qPrev = prevIndex >= 0 ? unnorm[prevIndex] : 0;
      sum += sc.incomingLoad_a * effectiveBu * qPrev;

      symbolicTerms.push(
        `\\alpha_{${idx + 1}} b_{${idx + 1}} q(${prevIndex})`,
      );
      numericTerms.push(
        `${sc.incomingLoad_a} \\times ${effectiveBu} \\times ${fmt(qPrev)}`,
      );
    });

    const qj = sum / j;
    unnorm[j] = parseFloat(qj.toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL));

    if (symbolicTerms.length === 0) {
      recursionFormulas.push(`q(${j}) = 0`);
    } else {
      recursionFormulas.push(
        `q(${j}) = \\frac{1}{${j}}\\Big(${symbolicTerms.join(" + ")}\\Big) = \\frac{1}{${j}}\\Big(${numericTerms.join(" + ")}\\Big) = ${fmt(unnorm[j], 6)}`,
      );
    }
  }

  // ── Step 2: normalisation ────────────────────────────────────────────────
  const normalisationFormulas: string[] = [];

  const G = unnorm.reduce((a, b) => a + b, 0);
  normalisationFormulas.push(
    `G = \\sum_{j=0}^{${capacity}} q(j) = ${unnorm.map((v) => fmt(v, 4)).join(" + ")} = ${fmt(G, 6)}`,
  );

  const normalised = unnorm.map((v) =>
    parseFloat((v / G).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL)),
  );

  normalisationFormulas.push(
    `q(j) = \\frac{q(j)}{G} \\;\\Rightarrow\\; ` +
      normalised.map((v, j) => `q(${j}) = ${fmt(v, 6)}`).join(",\\ "),
  );

  // ── Step 3: per-class blocking probability ──────────────────────────────
  const blockingFormulas: string[] = [];
  const results: Record<string, number> = {};

  serviceClasses.forEach((sc, idx) => {
    const tk = (sc as ServiceClassWithBR).tk ?? 0;
    const lower = capacity - sc.bu - tk + 1;

    let cbp = 0;
    const valueStrings: string[] = [];

    for (let j = lower; j <= capacity; j++) {
      const qj = j >= 0 && j <= capacity ? normalised[j] : 0;
      cbp += qj;
      valueStrings.push(fmt(qj, 6));
    }

    cbp = parseFloat(cbp.toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL));
    results[`B_class_${idx + 1}`] = cbp;

    const reservationTerm = tk ? ` - t_{${idx + 1}}` : "";
    blockingFormulas.push(
      `B_{${idx + 1}} = \\sum_{j=C-b_{${idx + 1}}${reservationTerm}+1}^{C} q(j) = \\sum_{j=${lower}}^{${capacity}} q(j) = ${valueStrings.join(" + ")} = ${fmt(cbp, 6)}`,
    );
  });

  // ── Link utilisation (for the results panel, not shown as a step) ───────
  const probMap: Record<string, number> = {};
  normalised.forEach((v, j) => (probMap[`q(${j})`] = v));
  const utilization = linkUtilizationFromProbabilities(capacity, probMap);

  const steps: StepGroup[] = [
    {
      title: "Step 1: calculate the unnormalised state probabilities q(j)",
      formulas: recursionFormulas,
    },
    {
      title: "Step 2: normalise so that the probabilities sum to 1",
      formulas: normalisationFormulas,
    },
    {
      title: "Step 3: calculate the blocking probability per service class",
      formulas: blockingFormulas,
    },
  ];

  return { results, utilization, steps };
}
