import { ServiceClass } from "../types";
import { blockingProbabilityLAR } from "./blocking-probability";
import { calculateLinkUtilization } from "./link-utilization";
import { calculateNormalizationConstant_G } from "../normalise-probabilities";
import { conditionalTransitionProbability } from "../utils/conditional-transition-probability";

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
    const numericTerms: string[] = [];
    let sum = 0;

    serviceClasses.forEach((sc, idx) => {
      const { bu, incomingLoad_a } = sc;
      const prevIndex = j - bu;
      if (prevIndex < 0) return;

      const qPrev = unnorm[prevIndex];
      const sigma = conditionalTransitionProbability(prevIndex, bu, ell, C);
      sum += incomingLoad_a * bu * sigma * qPrev;

      symbolicTerms.push(
        `a_{${idx + 1}} b_{${idx + 1}} \\sigma_{${idx + 1}}(${prevIndex}) q(${prevIndex})`,
      );
      numericTerms.push(
        `${incomingLoad_a} \\times ${bu} \\times ${fmt(sigma)} \\times ${fmt(qPrev)}`,
      );
    });

    unnorm[j] = sum / j;

    if (symbolicTerms.length === 0) {
      recursionFormulas.push(`q(${j}) = 0`);
    } else {
      recursionFormulas.push(
        `q(${j}) = \\frac{1}{${j}}\\Big(${symbolicTerms.join(" + ")}\\Big) = \\frac{1}{${j}}\\Big(${numericTerms.join(" + ")}\\Big) = ${fmt(unnorm[j], 6)}`,
      );
    }
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
      `B_{${idx + 1}} = \\sum_{j=${nState}}^{${V}} Q(j)\\big(1-\\sigma_{${idx + 1}}(j)\\big) = ${symbolicTerms.join(" + ")} = ${numericTerms.join(" + ")} = ${fmt(cbp, 6)}`,
    );
  });

  // ── Final results ─────────────────
  const results = blockingProbabilityLAR(ell, C, serviceClasses);
  const U = calculateLinkUtilization(ell, C, serviceClasses);
  const utilization = { U, efficiency: (U / V) * 100 };

  const steps: StepGroup[] = [
    {
      title: "Step 1: calculate the unnormalised occupancy distribution q(j)",
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
