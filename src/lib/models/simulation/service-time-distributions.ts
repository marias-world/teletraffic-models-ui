import { exponential } from "./random";

export type ServiceDistribution =
  | "exponential"
  | "deterministic"
  | "erlang2"
  | "hyperexponential"
  | "lognormal";

export const SERVICE_DISTRIBUTIONS: {
  value: ServiceDistribution;
  label: string;
}[] = [
  { value: "exponential", label: "Exponential (baseline)" },
  { value: "deterministic", label: "Deterministic (constant)" },
  { value: "erlang2", label: "Erlang-2 (lower variance)" },
  { value: "hyperexponential", label: "Hyperexponential (higher variance)" },
  { value: "lognormal", label: "Lognormal (skewed, heavy tail)" },
];

type Sampler = () => number;
type SamplerFactory = (rng: () => number, rate: number) => Sampler;

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

  // Sum of 2 exponentials, each with rate 2*rate, has mean 2 * (1 / (2*rate))
  // == 1/rate: lower variance than a plain exponential.
  erlang2: (rng, rate) => {
    const innerRate = 2 * rate;
    return () => exponential(rng, innerRate) + exponential(rng, innerRate);
  },

  // Two-phase mixture: with probability 0.5 use a fast phase, otherwise a
  // slow one, balanced (phase means 0.5x and 1.5x the overall mean) so the
  // overall mean is still 1/rate. Higher variance than exponential, the
  // opposite extreme from Erlang-2.
  hyperexponential: (rng, rate) => {
    const mean = 1 / rate;
    const rate1 = 1 / (mean * 0.5);
    const rate2 = 1 / (mean * 1.5);
    return () =>
      rng() < 0.5 ? exponential(rng, rate1) : exponential(rng, rate2);
  },

  // Lognormal with a chosen sigma, mu solved so the mean is exactly 1/rate
  // (the mean of lognormal(mu, sigma) is exp(mu + sigma^2 / 2)).
  lognormal: (rng, rate) => {
    const mean = 1 / rate;
    const sigma = 0.75;
    const mu = Math.log(mean) - sigma ** 2 / 2;
    return () => Math.exp(mu + sigma * standardNormal(rng));
  },
};

// The caller asks for a sampler by name once, up front, and then just calls
// it repeatedly in the hot loop - no branching on the distribution per call.
export function makeServiceSampler(
  serviceDist: ServiceDistribution,
  rng: () => number,
  rate: number,
): Sampler {
  const factory = samplerFactories[serviceDist];
  if (!factory) {
    throw new Error(`unknown service distribution "${serviceDist}"`);
  }
  return factory(rng, rate);
}
