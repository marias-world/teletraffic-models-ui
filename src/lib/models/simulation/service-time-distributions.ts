import { exponential, mulberry32 } from "./random";

export type ServiceDistribution =
  "exponential" | "deterministic" | "erlang" | "hyperexponential" | "lognormal";
export interface ServiceDistributionParams {
  // Erlang-k: number of exponential stages (k = 1 is the plain exponential).
  erlangStages: number;
  // Hyperexponential: probability that a call is a "quick" one...
  hyperFastProbability: number;
  // ...and the quick call's mean as a fraction of h = 1/rate (0 < f < 1).
  // The slow call's mean is derived so the overall mean stays exactly h.
  hyperFastMeanFactor: number;
  // Lognormal: standard deviation of the underlying normal.
  lognormalSigma: number;
}

// The defaults match the Python reference implementation.
export const DEFAULT_SERVICE_DIST_PARAMS: ServiceDistributionParams = {
  erlangStages: 2,
  hyperFastProbability: 0.5,
  hyperFastMeanFactor: 0.5,
  lognormalSigma: 0.75,
};

export const MAX_ERLANG_STAGES = 50;
export const MAX_LOGNORMAL_SIGMA = 2;

export function hyperSlowMeanFactor(
  fastProbability: number,
  fastMeanFactor: number,
): number {
  return (1 - fastProbability * fastMeanFactor) / (1 - fastProbability);
}

export function validateServiceDistParams(
  dist: ServiceDistribution,
  params: ServiceDistributionParams,
): string | null {
  if (dist === "erlang") {
    const k = params.erlangStages;
    if (!Number.isInteger(k) || k < 1 || k > MAX_ERLANG_STAGES) {
      return `Erlang stages must be a whole number between 1 and ${MAX_ERLANG_STAGES}.`;
    }
  }
  if (dist === "hyperexponential") {
    const p = params.hyperFastProbability;
    const f = params.hyperFastMeanFactor;
    if (!(p > 0 && p < 1)) {
      return "Hyperexponential: the quick-call probability must be strictly between 0 and 1.";
    }
    if (!(f > 0 && f < 1)) {
      return "Hyperexponential: the quick-call mean (as a fraction of h) must be strictly between 0 and 1.";
    }
  }
  if (dist === "lognormal") {
    const sigma = params.lognormalSigma;
    if (!(sigma > 0 && sigma <= MAX_LOGNORMAL_SIGMA)) {
      return `Lognormal: σ must be greater than 0 and at most ${MAX_LOGNORMAL_SIGMA}.`;
    }
  }
  return null;
}

// The form fields, as typed, before they are parsed into numbers.
export type ServiceDistributionParamInputs = Record<
  keyof ServiceDistributionParams,
  string
>;

export const DEFAULT_SERVICE_DIST_PARAM_INPUTS: ServiceDistributionParamInputs =
  {
    erlangStages: String(DEFAULT_SERVICE_DIST_PARAMS.erlangStages),
    hyperFastProbability: String(
      DEFAULT_SERVICE_DIST_PARAMS.hyperFastProbability,
    ),
    hyperFastMeanFactor: String(
      DEFAULT_SERVICE_DIST_PARAMS.hyperFastMeanFactor,
    ),
    lognormalSigma: String(DEFAULT_SERVICE_DIST_PARAMS.lognormalSigma),
  };

export function parseServiceDistParams(
  inputs: ServiceDistributionParamInputs,
  dist: ServiceDistribution,
): { params: ServiceDistributionParams; error: string | null } {
  const num = (text: string) => (text.trim() === "" ? NaN : Number(text));
  const params: ServiceDistributionParams = {
    erlangStages: num(inputs.erlangStages),
    hyperFastProbability: num(inputs.hyperFastProbability),
    hyperFastMeanFactor: num(inputs.hyperFastMeanFactor),
    lognormalSigma: num(inputs.lognormalSigma),
  };
  return { params, error: validateServiceDistParams(dist, params) };
}

export function describeServiceDistParams(
  dist: ServiceDistribution,
  params: ServiceDistributionParams,
): { name: string; value: number }[] {
  switch (dist) {
    case "erlang":
      return [{ name: "erlangStages", value: params.erlangStages }];
    case "hyperexponential":
      return [
        { name: "hyperFastProbability", value: params.hyperFastProbability },
        { name: "hyperFastMeanFactor", value: params.hyperFastMeanFactor },
        {
          name: "hyperSlowMeanFactor",
          // toPrecision drops floating-point noise like 1.1749999999999998.
          value: Number(
            hyperSlowMeanFactor(
              params.hyperFastProbability,
              params.hyperFastMeanFactor,
            ).toPrecision(12),
          ),
        },
      ];
    case "lognormal":
      return [{ name: "lognormalSigma", value: params.lognormalSigma }];
    default:
      return [];
  }
}

export const WORKED_EXAMPLE_MEAN = 2;

const fmt = (x: number) => Number(x.toFixed(3)).toString();

export interface ServiceDistributionInfo {
  value: ServiceDistribution;
  label: string;
  // How a single call duration is drawn (the mean is always h = 1/mu).
  rule: (params: ServiceDistributionParams) => string;
  // A one-line everyday example.
  example: string;
  // The idea in everyday words, and why it lands on the mean h.
  plainWords: (params: ServiceDistributionParams) => string;
  // Why the mean is exactly h, as a LaTeX formula.
  meanFormula: string;
  // The same distribution with concrete numbers for h = 1/mu =
  // WORKED_EXAMPLE_MEAN, showing how it reaches that mean.
  workedExample: (params: ServiceDistributionParams) => string;
  // Squared coefficient of variation, variance / mean^2: how much call
  // lengths vary. 0 means no variation at all, 1 is the exponential.
  squaredCv: (params: ServiceDistributionParams) => number;
}

export const SERVICE_DISTRIBUTIONS: ServiceDistributionInfo[] = [
  {
    value: "exponential",
    label: "Exponential (baseline)",
    rule: () =>
      "Each call ends at a random moment; how long it has already lasted says nothing about when it will end.",
    example: "an ordinary phone call, mostly short, sometimes long",
    meanFormula: String.raw`\text{mean} = \frac{1}{\mu} = h`,
    plainWords: () =>
      "Each call is one random draw: some are short, a few are long. The parameter is set so the average comes out at h.",
    workedExample: () =>
      `μ = 1/${WORKED_EXAMPLE_MEAN} = ${fmt(1 / WORKED_EXAMPLE_MEAN)}, so each call is one exponential draw with rate ${fmt(1 / WORKED_EXAMPLE_MEAN)}, whose mean is 1/${fmt(1 / WORKED_EXAMPLE_MEAN)} = ${WORKED_EXAMPLE_MEAN}.`,
    squaredCv: () => 1,
  },
  {
    value: "deterministic",
    label: "Deterministic (constant)",
    rule: () => "Every call lasts exactly h.",
    example: "a fixed 30-second recorded announcement",
    meanFormula: String.raw`\text{call length} = h`,
    plainWords: () =>
      "No randomness: every call lasts the same, so the average is that value.",
    workedExample: () => `Every call lasts exactly ${WORKED_EXAMPLE_MEAN}.`,
    squaredCv: () => 0,
  },
  {
    value: "erlang",
    label: "Erlang-k (lower variance)",
    rule: ({ erlangStages: k }) =>
      `The sum of ${k} independent exponential stage${k === 1 ? "" : "s"}, each with mean h/${k}.`,
    example:
      "a call made of consecutive steps, like verifying your identity and then doing the task",
    meanFormula: String.raw`\text{mean} = k \cdot \frac{h}{k} = h`,
    plainWords: ({ erlangStages: k }) =>
      k === 1
        ? "A call is a single part averaging h, which is just the plain exponential."
        : `A call has ${k} consecutive parts, each averaging h/${k}. Add the parts and the whole call averages h.`,
    workedExample: ({ erlangStages: k }) => {
      const h = WORKED_EXAMPLE_MEAN;
      if (k === 1) {
        return `The call is a single exponential part averaging h/1 = ${h}, so on average it lasts ${h}.`;
      }
      const part = fmt(h / k);
      // Spell the parts out while that stays short and exact (1 + 1), and
      // fall back to k x (h/k) otherwise (3 x 2/3, not 0.667 + 0.667 + 0.667).
      const total =
        k <= 4 && Math.abs(Number(part) * k - h) < 1e-9
          ? Array.from({ length: k }, () => part).join(" + ")
          : `${k} × ${h}/${k}`;
      return `The call is split into ${k} consecutive parts. Each part is a random (exponential) time averaging h/${k} = ${h}/${k} = ${part}. Adding the parts, the whole call averages ${total} = ${h}.`;
    },
    squaredCv: ({ erlangStages: k }) => 1 / k,
  },
  {
    value: "hyperexponential",
    label: "Hyperexponential (higher variance), two phases",
    rule: ({ hyperFastProbability: p, hyperFastMeanFactor: f }) =>
      `With probability ${fmt(p * 100)}% a quick call (exponential, mean ${fmt(f)} × h), otherwise a slow one (exponential, mean ${fmt(hyperSlowMeanFactor(p, f))} × h), where h is the mean holding time.`,
    example: "quick balance checks mixed with long support calls",
    meanFormula: String.raw`\text{mean} = \sum_{i=1}^{k} \frac{p_i}{\lambda_i} \;\to\; \frac{p}{\lambda_1} + \frac{1-p}{\lambda_2} = h`,
    plainWords: () =>
      "Two kinds of calls, quick and slow, where p is the fraction that are quick. The average is a weighted average of the two groups, with the slow group's average set so it lands on h. Same mean as the exponential, but far more unequal calls.",
    workedExample: ({ hyperFastProbability: p, hyperFastMeanFactor: f }) => {
      const h = WORKED_EXAMPLE_MEAN;
      const quickMean = f * h;
      const slowMean = hyperSlowMeanFactor(p, f) * h;
      const quickCalls = p * 100;
      const slowCalls = (1 - p) * 100;
      const quickTotal = quickCalls * quickMean;
      const slowTotal = slowCalls * slowMean;
      const total = quickTotal + slowTotal;
      return [
        `A k-phase hyperexponential has mean Σ pᵢ/λᵢ: phase i has probability pᵢ and rate λᵢ, so its mean is 1/λᵢ. We use k = 2 phases, a quick one and a slow one, with p₁ = p and p₂ = 1 − p.`,
        `In our example: quick calls have mean 1/λ₁ = ${fmt(quickMean)} and slow calls have mean 1/λ₂ = ${fmt(slowMean)}.`,
        `Take 100 calls: ${fmt(quickCalls)} are quick and ${fmt(slowCalls)} are slow.`,
        `Quick calls add up to ${fmt(quickCalls)} × ${fmt(quickMean)} = ${fmt(quickTotal)}. Slow calls add up to ${fmt(slowCalls)} × ${fmt(slowMean)} = ${fmt(slowTotal)}.`,
        `Total: ${fmt(quickTotal)} + ${fmt(slowTotal)} = ${fmt(total)}, so the average is ${fmt(total)} / 100 = ${fmt(total / 100)}.`,
        `That is the formula: p × 1/λ₁ + (1 − p) × 1/λ₂ = ${fmt(p)} × ${fmt(quickMean)} + ${fmt(1 - p)} × ${fmt(slowMean)} = ${fmt(total / 100)}.`,
        `Why is 1/λ₂ = ${fmt(slowMean)}? The average must land on h = ${h}, so 1/λ₂ = (h − p × 1/λ₁) / (1 − p) = (${h} − ${fmt(p)} × ${fmt(quickMean)}) / ${fmt(1 - p)} = ${fmt(slowMean)}.`,
      ].join("\n");
    },
    squaredCv: ({ hyperFastProbability: p, hyperFastMeanFactor: f }) => {
      const slow = hyperSlowMeanFactor(p, f);
      return 2 * (p * f ** 2 + (1 - p) * slow ** 2) - 1;
    },
  },
  {
    value: "lognormal",
    label: "Lognormal (skewed, heavy tail)",
    rule: ({ lognormalSigma: sigma }) =>
      `The logarithm of the duration follows a bell curve (a normal distribution) with spread σ = ${fmt(sigma)}, tuned so the mean is exactly h. Most calls are shorter than h, a few run much longer.`,
    example: "video views, mostly short clips and a few hours-long",
    meanFormula: String.raw`\text{mean} = e^{m + \sigma^2/2} = h \;\Rightarrow\; m = \ln h - \sigma^2/2`,
    plainWords: ({ lognormalSigma: sigma }) => {
      const h = WORKED_EXAMPLE_MEAN;
      // Nine short calls and one long one, built so the average is exactly h.
      const longCall = 10 * h - 9;
      return `Skewed: most calls are short and a few are very long, which pulls the average up. Example: take 10 calls, nine lasting 1 and one lasting ${longCall}. The average is (9 × 1 + ${longCall}) / 10 = ${h}, yet the typical (median) call is only 1. For h = ${h} its typical call is about ${fmt(Math.exp(Math.log(h) - sigma ** 2 / 2))}.`;
    },
    workedExample: ({ lognormalSigma: sigma }) => {
      const h = WORKED_EXAMPLE_MEAN;
      // Show the arithmetic on the rounded numbers a reader can see, so each
      // step checks out by hand.
      const lnH = fmt(Math.log(h));
      const halfSigmaSq = fmt(sigma ** 2 / 2);
      const m = fmt(Number(lnH) - Number(halfSigmaSq));
      const typical = fmt(Math.exp(Math.log(h) - sigma ** 2 / 2));
      return [
        `Take the logarithm of both sides of e^(m + σ²/2) = h. This gives m + σ²/2 = ln h, so m = ln h − σ²/2.`,
        `With h = ${h} and σ = ${fmt(sigma)}: m = ln ${h} − ${fmt(sigma)}²/2 = ${lnH} − ${halfSigmaSq} = ${m}.`,
        `Typical (median) call: e^m = e^${m} = ${typical}.`,
        `Check the mean: e^(m + σ²/2) = e^(${m} + ${halfSigmaSq}) = e^${lnH} = ${h}.`,
      ].join("\n");
    },
    squaredCv: ({ lognormalSigma: sigma }) => Math.exp(sigma ** 2) - 1,
  },
];

type Sampler = () => number;
type SamplerFactory = (
  rng: () => number,
  rate: number,
  params: ServiceDistributionParams,
) => Sampler;

// Standard normal draw via the Box-Muller transform. `1 - rng()` lies in
// (0, 1], so the log never sees 0.
function standardNormal(rng: () => number): number {
  const u1 = 1 - rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const samplerFactories: Record<ServiceDistribution, SamplerFactory> = {
  exponential: (rng, rate) => () => exponential(rng, rate),

  deterministic: (_rng, rate) => {
    const mean = 1 / rate;
    return () => mean;
  },

  // Sum of k exponentials, each with rate k*rate, has mean k * (1 / (k*rate))
  // == 1/rate: lower variance than a plain exponential (k = 1 is exactly it).
  erlang: (rng, rate, { erlangStages }) => {
    const innerRate = erlangStages * rate;
    return () => {
      let total = 0;
      for (let i = 0; i < erlangStages; i++) {
        total += exponential(rng, innerRate);
      }
      return total;
    };
  },

  // Two-phase mixture: with probability p use a quick phase (mean f*h),
  // otherwise a slow one whose mean is derived so the overall mean is still
  // h = 1/rate. Higher variance than exponential, the opposite extreme from
  // Erlang.
  hyperexponential: (
    rng,
    rate,
    { hyperFastProbability, hyperFastMeanFactor },
  ) => {
    const mean = 1 / rate;
    const slowFactor = hyperSlowMeanFactor(
      hyperFastProbability,
      hyperFastMeanFactor,
    );
    const rate1 = 1 / (mean * hyperFastMeanFactor);
    const rate2 = 1 / (mean * slowFactor);
    return () =>
      rng() < hyperFastProbability
        ? exponential(rng, rate1)
        : exponential(rng, rate2);
  },

  // Lognormal with a chosen sigma, mu solved so the mean is exactly 1/rate
  // (the mean of lognormal(mu, sigma) is exp(mu + sigma^2 / 2)).
  lognormal: (rng, rate, { lognormalSigma }) => {
    const mean = 1 / rate;
    const mu = Math.log(mean) - lognormalSigma ** 2 / 2;
    return () => Math.exp(mu + lognormalSigma * standardNormal(rng));
  },
};

// The caller asks for a sampler by name once, up front, and then just calls
// it repeatedly in the hot loop - no branching on the distribution per call.
export function makeServiceSampler(
  serviceDist: ServiceDistribution,
  rng: () => number,
  rate: number,
  params: ServiceDistributionParams = DEFAULT_SERVICE_DIST_PARAMS,
): Sampler {
  const factory = samplerFactories[serviceDist];
  if (!factory) {
    throw new Error(`unknown service distribution "${serviceDist}"`);
  }
  const error = validateServiceDistParams(serviceDist, params);
  if (error) throw new Error(error);
  return factory(rng, rate, params);
}

const SAMPLE_PREVIEW_COUNT = 8;
const SAMPLE_LARGE_COUNT = 100_000;
const SAMPLE_SEED = 21;

export interface SampleSummary {
  // The first few draws, to show what individual calls look like.
  calls: number[];
  // Average and median over SAMPLE_LARGE_COUNT draws.
  mean: number;
  median: number;
  count: number;
}

// Draws real calls from the actual sampler (same code path as the
// simulation, fixed seed) for a mean duration of WORKED_EXAMPLE_MEAN, so
// the examples shown on the site are evidence, not hand-written numbers.
// Results are cached because the page re-renders on every keystroke.
const sampleCache = new Map<string, SampleSummary>();

export function sampleSummary(
  dist: ServiceDistribution,
  params: ServiceDistributionParams = DEFAULT_SERVICE_DIST_PARAMS,
): SampleSummary {
  const key = `${dist}|${JSON.stringify(describeServiceDistParams(dist, params))}`;
  const cached = sampleCache.get(key);
  if (cached) return cached;

  const sample = makeServiceSampler(
    dist,
    mulberry32(SAMPLE_SEED),
    1 / WORKED_EXAMPLE_MEAN,
    params,
  );
  const draws = new Float64Array(SAMPLE_LARGE_COUNT);
  let total = 0;
  for (let i = 0; i < SAMPLE_LARGE_COUNT; i++) {
    draws[i] = sample();
    total += draws[i];
  }
  const calls = Array.from(draws.slice(0, SAMPLE_PREVIEW_COUNT));
  draws.sort();
  const summary: SampleSummary = {
    calls,
    mean: total / SAMPLE_LARGE_COUNT,
    median: draws[Math.floor(SAMPLE_LARGE_COUNT / 2)],
    count: SAMPLE_LARGE_COUNT,
  };

  if (sampleCache.size >= 50) sampleCache.clear();
  sampleCache.set(key, summary);
  return summary;
}
