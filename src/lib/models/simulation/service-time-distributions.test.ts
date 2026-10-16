import { describe, it, expect } from "vitest";
import { mulberry32 } from "./random";
import {
  DEFAULT_SERVICE_DIST_PARAM_INPUTS,
  DEFAULT_SERVICE_DIST_PARAMS,
  describeServiceDistParams,
  hyperSlowMeanFactor,
  makeServiceSampler,
  parseServiceDistParams,
  SERVICE_DISTRIBUTIONS,
  ServiceDistribution,
  ServiceDistributionParams,
  validateServiceDistParams,
  WORKED_EXAMPLE_MEAN,
  sampleSummary,
} from "./service-time-distributions";

function sampleStats(
  dist: ServiceDistribution,
  rate: number,
  n: number,
  params?: ServiceDistributionParams,
) {
  const sample = makeServiceSampler(dist, mulberry32(7), rate, params);
  const draws = Array.from({ length: n }, () => sample());
  const mean = draws.reduce((sum, x) => sum + x, 0) / n;
  // Two passes, not E[X^2] - mean^2, which loses precision to cancellation.
  const variance = draws.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
  return { mean, cv: Math.sqrt(variance) / mean };
}

const rate = 2.5;

// Non-default settings for every parameter, to prove they really are tunable
// and still never move the mean.
const customParams: ServiceDistributionParams = {
  erlangStages: 5,
  hyperFastProbability: 0.2,
  hyperFastMeanFactor: 0.3,
  lognormalSigma: 1.2,
};

describe("makeServiceSampler with default parameters", () => {
  it.each(SERVICE_DISTRIBUTIONS.map((d) => d.value))(
    "%s has mean 1/rate",
    (dist) => {
      const { mean } = sampleStats(dist, rate, 200_000);
      expect(mean).toBeGreaterThan((1 / rate) * 0.98);
      expect(mean).toBeLessThan((1 / rate) * 1.02);
    },
  );

  it.each(SERVICE_DISTRIBUTIONS)(
    "$value matches the squared CV documented for it",
    ({ value, squaredCv }) => {
      const { cv } = sampleStats(value, rate, 400_000);
      expect(
        Math.abs(cv ** 2 - squaredCv(DEFAULT_SERVICE_DIST_PARAMS)),
      ).toBeLessThan(0.05);
    },
  );

  it("orders the coefficient of variation: deterministic < Erlang-2 < exponential < hyperexponential", () => {
    const cv = (d: ServiceDistribution) => sampleStats(d, rate, 200_000).cv;
    expect(cv("deterministic")).toBeCloseTo(0, 9);
    expect(cv("erlang")).toBeGreaterThan(0.65);
    expect(cv("erlang")).toBeLessThan(0.76);
    expect(cv("exponential")).toBeGreaterThan(0.95);
    expect(cv("exponential")).toBeLessThan(1.05);
    expect(cv("hyperexponential")).toBeGreaterThan(1.15);
    expect(cv("hyperexponential")).toBeLessThan(1.3);
  });

  it("is deterministic for a given seed", () => {
    const a = makeServiceSampler("lognormal", mulberry32(3), rate);
    const b = makeServiceSampler("lognormal", mulberry32(3), rate);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("gives the same draws whether parameters are omitted or explicit", () => {
    for (const { value } of SERVICE_DISTRIBUTIONS) {
      const implicit = makeServiceSampler(value, mulberry32(11), rate);
      const explicit = makeServiceSampler(
        value,
        mulberry32(11),
        rate,
        DEFAULT_SERVICE_DIST_PARAMS,
      );
      expect([implicit(), implicit(), implicit()]).toEqual([
        explicit(),
        explicit(),
        explicit(),
      ]);
    }
  });

  it("throws on an unknown distribution", () => {
    expect(() =>
      makeServiceSampler("weibull" as ServiceDistribution, mulberry32(1), rate),
    ).toThrow();
  });
});

describe("makeServiceSampler with custom parameters", () => {
  it.each(SERVICE_DISTRIBUTIONS.map((d) => d.value))(
    "%s still has mean 1/rate",
    (dist) => {
      const { mean } = sampleStats(dist, rate, 400_000, customParams);
      expect(mean).toBeGreaterThan((1 / rate) * 0.97);
      expect(mean).toBeLessThan((1 / rate) * 1.03);
    },
  );

  it.each(SERVICE_DISTRIBUTIONS)(
    "$value matches the squared CV documented for the custom parameters",
    ({ value, squaredCv }) => {
      const { cv } = sampleStats(value, rate, 600_000, customParams);
      const expected = squaredCv(customParams);
      // Relative tolerance: heavy-tailed settings have noisier estimates.
      expect(Math.abs(cv ** 2 - expected)).toBeLessThan(
        0.05 * Math.max(1, expected),
      );
    },
  );

  it("a single Erlang stage is the plain exponential", () => {
    const erlang1 = makeServiceSampler("erlang", mulberry32(5), rate, {
      ...DEFAULT_SERVICE_DIST_PARAMS,
      erlangStages: 1,
    });
    const expo = makeServiceSampler("exponential", mulberry32(5), rate);
    expect([erlang1(), erlang1(), erlang1()]).toEqual([expo(), expo(), expo()]);
  });

  it("more Erlang stages lower the variability (CV^2 = 1/k)", () => {
    const info = SERVICE_DISTRIBUTIONS.find((d) => d.value === "erlang")!;
    const cv2 = (k: number) =>
      info.squaredCv({ ...DEFAULT_SERVICE_DIST_PARAMS, erlangStages: k });
    expect(cv2(1)).toBe(1);
    expect(cv2(4)).toBe(0.25);
    expect(cv2(10)).toBeLessThan(cv2(4));
  });

  it("derives the slow hyperexponential phase so the mean stays h", () => {
    for (const [p, f] of [
      [0.5, 0.5],
      [0.2, 0.3],
      [0.9, 0.95],
    ]) {
      expect(p * f + (1 - p) * hyperSlowMeanFactor(p, f)).toBeCloseTo(1, 12);
    }
  });
});

describe("parameter validation", () => {
  const ok = DEFAULT_SERVICE_DIST_PARAMS;

  it("accepts the defaults for every distribution", () => {
    for (const { value } of SERVICE_DISTRIBUTIONS) {
      expect(validateServiceDistParams(value, ok)).toBeNull();
    }
  });

  it("rejects bad Erlang stages", () => {
    for (const k of [0, -1, 2.5, 51, NaN]) {
      expect(
        validateServiceDistParams("erlang", { ...ok, erlangStages: k }),
      ).not.toBeNull();
    }
  });

  it("rejects bad hyperexponential parameters", () => {
    for (const p of [0, 1, -0.1, 1.5, NaN]) {
      expect(
        validateServiceDistParams("hyperexponential", {
          ...ok,
          hyperFastProbability: p,
        }),
      ).not.toBeNull();
    }
    for (const f of [0, 1, 1.2, -0.5, NaN]) {
      expect(
        validateServiceDistParams("hyperexponential", {
          ...ok,
          hyperFastMeanFactor: f,
        }),
      ).not.toBeNull();
    }
  });

  it("rejects bad lognormal sigma", () => {
    for (const sigma of [0, -1, 2.5, NaN]) {
      expect(
        validateServiceDistParams("lognormal", {
          ...ok,
          lognormalSigma: sigma,
        }),
      ).not.toBeNull();
    }
  });

  it("only checks the parameters of the selected distribution", () => {
    const broken = { ...ok, lognormalSigma: -5, erlangStages: 0 };
    expect(validateServiceDistParams("exponential", broken)).toBeNull();
    expect(validateServiceDistParams("hyperexponential", broken)).toBeNull();
  });

  it("makeServiceSampler refuses invalid parameters", () => {
    expect(() =>
      makeServiceSampler("lognormal", mulberry32(1), rate, {
        ...ok,
        lognormalSigma: 0,
      }),
    ).toThrow();
  });

  it("parses typed fields and treats an empty field as invalid", () => {
    const good = parseServiceDistParams(
      DEFAULT_SERVICE_DIST_PARAM_INPUTS,
      "hyperexponential",
    );
    expect(good.error).toBeNull();
    expect(good.params).toEqual(DEFAULT_SERVICE_DIST_PARAMS);

    const empty = parseServiceDistParams(
      { ...DEFAULT_SERVICE_DIST_PARAM_INPUTS, lognormalSigma: "" },
      "lognormal",
    );
    expect(empty.error).not.toBeNull();
  });
});

describe("describeServiceDistParams", () => {
  it("lists only the parameters that apply, including the derived slow mean", () => {
    expect(
      describeServiceDistParams("exponential", DEFAULT_SERVICE_DIST_PARAMS),
    ).toEqual([]);
    expect(
      describeServiceDistParams("erlang", DEFAULT_SERVICE_DIST_PARAMS),
    ).toEqual([{ name: "erlangStages", value: 2 }]);
    expect(
      describeServiceDistParams(
        "hyperexponential",
        DEFAULT_SERVICE_DIST_PARAMS,
      ).map((d) => d.name),
    ).toEqual([
      "hyperFastProbability",
      "hyperFastMeanFactor",
      "hyperSlowMeanFactor",
    ]);
  });
});

describe("sampleSummary (the real sample calls shown on the site)", () => {
  it.each(SERVICE_DISTRIBUTIONS.map((d) => d.value))(
    "%s: 8 sample calls and an average at the worked-example mean",
    (dist) => {
      const summary = sampleSummary(dist);
      expect(summary.calls).toHaveLength(8);
      expect(summary.count).toBe(100_000);
      expect(Math.abs(summary.mean - WORKED_EXAMPLE_MEAN)).toBeLessThan(
        0.03 * WORKED_EXAMPLE_MEAN,
      );
    },
  );

  it("deterministic calls all equal the mean", () => {
    const summary = sampleSummary("deterministic");
    expect(summary.calls.every((x) => x === WORKED_EXAMPLE_MEAN)).toBe(true);
    expect(summary.median).toBe(WORKED_EXAMPLE_MEAN);
  });

  it("is reproducible and cached", () => {
    expect(sampleSummary("hyperexponential")).toBe(
      sampleSummary("hyperexponential"),
    );
  });

  it("the lognormal median is the typical call e^m, below the mean", () => {
    const sigma = DEFAULT_SERVICE_DIST_PARAMS.lognormalSigma;
    const typical = Math.exp(Math.log(WORKED_EXAMPLE_MEAN) - sigma ** 2 / 2);
    const summary = sampleSummary("lognormal");
    expect(Math.abs(summary.median - typical)).toBeLessThan(0.03 * typical);
    expect(summary.median).toBeLessThan(summary.mean);
  });

  it("follows custom parameters and still averages h", () => {
    const summary = sampleSummary("hyperexponential", {
      ...DEFAULT_SERVICE_DIST_PARAMS,
      hyperFastProbability: 0.2,
      hyperFastMeanFactor: 0.3,
    });
    expect(Math.abs(summary.mean - WORKED_EXAMPLE_MEAN)).toBeLessThan(0.06);
    expect(summary).not.toBe(sampleSummary("hyperexponential"));
  });
});

describe("Erlang worked example wording", () => {
  const erlang = SERVICE_DISTRIBUTIONS.find((d) => d.value === "erlang")!;
  const text = (k: number) =>
    erlang.workedExample({ ...DEFAULT_SERVICE_DIST_PARAMS, erlangStages: k });

  it("spells out the parts for the default 2 stages", () => {
    expect(text(2)).toBe(
      "The call is split into 2 consecutive parts. Each part is a random (exponential) time averaging h/2 = 2/2 = 1. Adding the parts, the whole call averages 1 + 1 = 2.",
    );
  });

  it("uses k x h/k when the parts aren't a short exact decimal", () => {
    expect(text(3)).toContain("averages 3 × 2/3 = 2.");
    expect(text(5)).toContain("averages 5 × 2/5 = 2.");
  });

  it("handles a single stage", () => {
    expect(text(1)).toContain("single exponential part averaging h/1 = 2");
  });
});

describe("Hyperexponential worked example wording", () => {
  const hyper = SERVICE_DISTRIBUTIONS.find(
    (d) => d.value === "hyperexponential",
  )!;

  it("walks through 100 calls for the defaults", () => {
    const text = hyper.workedExample(DEFAULT_SERVICE_DIST_PARAMS);
    expect(text).toContain("1/λ₁ = 1 and slow calls have mean 1/λ₂ = 3");
    expect(text).toContain("50 are quick and 50 are slow");
    expect(text).toContain("50 × 1 = 50");
    expect(text).toContain("50 × 3 = 150");
    expect(text).toContain(
      "Total: 50 + 150 = 200, so the average is 200 / 100 = 2",
    );
    expect(text).toContain("(2 − 0.5 × 1) / 0.5 = 3");
  });

  it("puts each step on its own line", () => {
    const lines = hyper.workedExample(DEFAULT_SERVICE_DIST_PARAMS).split("\n");
    expect(lines).toHaveLength(7);
  });

  it("stays consistent for custom parameters (the average is always h)", () => {
    const text = hyper.workedExample({
      ...DEFAULT_SERVICE_DIST_PARAMS,
      hyperFastProbability: 0.2,
      hyperFastMeanFactor: 0.3,
    });
    expect(text).toContain("20 × 0.6 = 12");
    expect(text).toContain("80 × 2.35 = 188");
    expect(text).toContain(
      "Total: 12 + 188 = 200, so the average is 200 / 100 = 2",
    );
    expect(text).toContain("1/λ₂ = 2.35");
  });
});

describe("Lognormal worked example wording", () => {
  const lognormal = SERVICE_DISTRIBUTIONS.find((d) => d.value === "lognormal")!;

  it("gives a concrete 10-call example before the maths", () => {
    const text = lognormal.plainWords(DEFAULT_SERVICE_DIST_PARAMS);
    expect(text).toContain("nine lasting 1 and one lasting 11");
    expect(text).toContain("(9 × 1 + 11) / 10 = 2");
    expect(text).toContain("typical (median) call is only 1");
    expect(text).toContain("about 1.51");
  });

  it("walks through the maths one step per line", () => {
    const lines = lognormal
      .workedExample(DEFAULT_SERVICE_DIST_PARAMS)
      .split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[1]).toBe(
      "With h = 2 and σ = 0.75: m = ln 2 − 0.75²/2 = 0.693 − 0.281 = 0.412.",
    );
    expect(lines[2]).toBe("Typical (median) call: e^m = e^0.412 = 1.51.");
    expect(lines[3]).toBe(
      "Check the mean: e^(m + σ²/2) = e^(0.412 + 0.281) = e^0.693 = 2.",
    );
  });

  it("keeps every displayed subtraction exact for other sigmas", () => {
    for (const sigma of [0.3, 0.5, 0.8, 1.2, 1.5, 2]) {
      const line = lognormal
        .workedExample({
          ...DEFAULT_SERVICE_DIST_PARAMS,
          lognormalSigma: sigma,
        })
        .split("\n")[1];
      const [, a, b, result] = line.match(
        /= (-?[\d.]+) − ([\d.]+) = (-?[\d.]+)\.$/,
      )!;
      expect(Math.abs(Number(a) - Number(b) - Number(result))).toBeLessThan(
        1e-9,
      );
    }
  });
});

describe("plain-words explanations", () => {
  const info = (value: ServiceDistribution) =>
    SERVICE_DISTRIBUTIONS.find((d) => d.value === value)!;

  it("mention the actual number of Erlang parts", () => {
    expect(
      info("erlang").plainWords({
        ...DEFAULT_SERVICE_DIST_PARAMS,
        erlangStages: 4,
      }),
    ).toContain("4 consecutive parts, each averaging h/4");
  });

  it("give the typical lognormal call for the chosen sigma", () => {
    const text = info("lognormal").plainWords(DEFAULT_SERVICE_DIST_PARAMS);
    expect(text).toContain("1.51");
  });
});
