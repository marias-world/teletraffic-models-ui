import { ServiceClass } from "../types";
import { blockingProbabilityLAR } from "./blocking-probability";
import { calculateLinkUtilization } from "./link-utilization";
import { unnormalisedLARModel } from "./limited-available-resources-model";
import { calculateNormalizationConstant_G } from "../normalise-probabilities";
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from "../constants";
import { conditionalTransitionProbability } from "../utils/conditional-transition-probability";
import { possibleArrangements } from "../utils/possible-arrangements";

export type StepGroup = {
  title: string;
  formulas: string[];
};

export type LARStepsResult = {
  results: Record<string, number>;
  utilization: { U: number; efficiency: number };
  steps: StepGroup[];
};

const fmt = (n: number, digits = 4) => n.toFixed(digits);

/**
 * Computes the LAG/LAR occupancy distribution and per-class blocking
 * probabilities (Complete Sharing policy), while also recording each step
 * of the calculation as a LaTeX string for display ("Show calculation").
 *
 * Final results are delegated to the existing tested
 * `blockingProbabilityLAR` / `calculateLinkUtilization` functions; the
 * steps are derived from the same recursion for illustration.
 */
export function lagWithSteps(
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[],
): LARStepsResult {
  if (
    !serviceClasses.length ||
    distinctResourceCount <= 0 ||
    individualResourceCapacity <= 0
  ) {
    return { results: {}, utilization: { U: 0, efficiency: 0 }, steps: [] };
  }

  const ell = distinctResourceCount;
  const C = individualResourceCapacity;
  const V = ell * C;

  // ── Step 1: occupancy distribution recursion q(j) ────────────────────────
  const recursionFormulas: string[] = [];
  const unnorm: number[] = Array(V + 1).fill(0);
  unnorm[0] = 1;
  recursionFormulas.push(`q(0) = 1 \\quad \\text{(base case)}`);

  for (let j = 1; j <= V; j++) {
    const symbolicTerms: string[] = [];
    let sum = 0;

    // Symbolic sum line
    serviceClasses.forEach((sc, idx) => {
      const prevIndex = j - sc.bu;
      if (prevIndex < 0) return;
      symbolicTerms.push(
        `a_{${idx + 1}} b_{${idx + 1}} \\cdot \\sigma_{${idx + 1}}(${prevIndex}) \\cdot q(${prevIndex})`,
      );
    });

    if (symbolicTerms.length === 0) {
      recursionFormulas.push(`q(${j}) = 0`);
      unnorm[j] = 0;
      continue;
    }

    recursionFormulas.push(
      `${j} \\cdot q(${j}) = ${symbolicTerms.join(" + ")}`,
    );

    // Per-class σ breakdown lines
    serviceClasses.forEach((sc, idx) => {
      const { bu } = sc;
      const prevIndex = j - bu;
      if (prevIndex < 0) {
        // Show why this term vanishes
        recursionFormulas.push(
          `\\sigma_{${idx + 1}}(${prevIndex}) = 0 \\text{ and } q(${prevIndex}) = 0 \\quad (\\text{boundary})`,
        );
        return;
      }

      const x = V - prevIndex; // free b.u. when prevIndex units busy
      const nom = possibleArrangements(x, ell, bu - 1);
      const den = possibleArrangements(x, ell, C);
      const sigma = conditionalTransitionProbability(prevIndex, bu, ell, C);
      const qPrev = unnorm[prevIndex];
      sum += sc.incomingLoad_a * bu * sigma * qPrev;

      if (den === 0) {
        recursionFormulas.push(
          `\\sigma_{${idx + 1}}(${prevIndex}) = 1 - \\frac{F(${x},\\,${ell},\\,${bu - 1},\\,0)}{F(${x},\\,${ell},\\,${C},\\,0)} = 1 - \\frac{${fmt(nom)}}{0} = 0`,
        );
      } else {
        recursionFormulas.push(
          `\\sigma_{${idx + 1}}(${prevIndex}) = 1 - \\frac{F(${x},\\,${ell},\\,${bu - 1},\\,0)}{F(${x},\\,${ell},\\,${C},\\,0)} = 1 - \\frac{${fmt(nom)}}{${fmt(den)}} = ${fmt(sigma)}`,
        );
      }
    });

    // Numeric result
    unnorm[j] = sum / j;
    const numericTerms = serviceClasses
      .filter((sc) => j - sc.bu >= 0)
      .map((sc, _) => {
        const prevIndex = j - sc.bu;
        const sigma = conditionalTransitionProbability(prevIndex, sc.bu, ell, C);
        return `${sc.incomingLoad_a} \\times ${sc.bu} \\times ${fmt(sigma)} \\times ${fmt(unnorm[prevIndex])}`;
      });

    recursionFormulas.push(
      `q(${j}) = \\frac{1}{${j}}\\Big(${numericTerms.join(" + ")}\\Big) = ${fmt(unnorm[j], 6)}`,
    );
  }

  // ── Step 2: normalisation ─────────────────────────────────────────────────
  const normalisationFormulas: string[] = [];

  const G = calculateNormalizationConstant_G(unnorm);
  normalisationFormulas.push(
    `G = \\sum_{j=0}^{${V}} q(j) = ${unnorm.map((v) => fmt(v, 4)).join(" + ")} = ${fmt(G, 6)}`,
  );

  const normalised = unnorm.map((v) => v / G);
  normalisationFormulas.push(
    `Q(j) = \\frac{q(j)}{G} \\;\\Rightarrow\\; ` +
      normalised.map((v, j) => `Q(${j}) = ${fmt(v, 6)}`).join(",\\ "),
  );

  // ── Step 3: per-class blocking probability ───────────────────────────────
  const blockingFormulas: string[] = [];

  serviceClasses.forEach((sc, idx) => {
    const { bu } = sc;
    const nState = ell * (C - bu + 1);

    let cbp = 0;
    const symbolicTerms: string[] = [];
    const numericTerms: string[] = [];

    for (let j = nState; j <= V; j++) {
      const Qj = normalised[j] ?? 0;
      const sigma = conditionalTransitionProbability(j, bu, ell, C);
      cbp += Qj * (1 - sigma);

      symbolicTerms.push(`Q(${j})(1-\\sigma_{${idx + 1}}(${j}))`);
      numericTerms.push(`${fmt(Qj, 6)} \\times (1 - ${fmt(sigma)})`);
    }

    blockingFormulas.push(
      `B_{${idx + 1}} = \\sum_{j=${nState}}^{${V}} Q(j)\\big(1-\\sigma_{${idx + 1}}(j)\\big)`,
    );
    blockingFormulas.push(
      `= ${symbolicTerms.join(" + ")}`,
    );
    blockingFormulas.push(
      `= ${numericTerms.join(" + ")} = ${fmt(cbp, 6)}`,
    );
  });

  // ── Final results ─────────────────────────────────────────────────────────
  const results = blockingProbabilityLAR(ell, C, serviceClasses);
  const U = calculateLinkUtilization(ell, C, serviceClasses);
  const utilization = { U, efficiency: (U / V) * 100 };

  const steps: StepGroup[] = [
    {
      title:
        "Step 1: calculate the unnormalised occupancy distribution q(j)",
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

/**
 * Computes blocking probabilities and link utilization for the LAG model
 * in a single pass — calls unnormalisedLARModel exactly once.
 * Use this instead of calling blockingProbabilityLAR + calculateLinkUtilization
 * separately, which would run the model twice.
 */
export function lagModelResult(
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[],
): { results: Record<string, number>; utilization: { U: number; efficiency: number } } {
  if (!serviceClasses.length || distinctResourceCount <= 0 || individualResourceCapacity <= 0) {
    return { results: {}, utilization: { U: 0, efficiency: 0 } };
  }

  const ell = distinctResourceCount;
  const C = individualResourceCapacity;
  const V = ell * C;

  const probabilities = unnormalisedLARModel(ell, C, serviceClasses);
  const G = calculateNormalizationConstant_G(probabilities);

  // Blocking probability per class
  const results: Record<string, number> = {};
  serviceClasses.forEach((sc, idx) => {
    const { bu } = sc;
    const nState = ell * (C - bu + 1);
    let cbp = 0;
    for (let n = nState; n <= V; n++) {
      const p_n = probabilities[n] ?? 0;
      cbp += p_n * (1 - conditionalTransitionProbability(n, bu, ell, C));
    }
    results[`B_class_${idx + 1}`] = parseFloat(
      (cbp / G).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL),
    );
  });

  // Link utilization
  const U = probabilities.reduce((sum, p, j) => (j > 0 ? sum + j * (p / G) : sum), 0);

  return { results, utilization: { U, efficiency: (U / V) * 100 } };
}
