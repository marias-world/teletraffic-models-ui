const SEED_RESULTS = [
  { seed: 42, blocking: "0.2850026" },
  { seed: 50, blocking: "0.2852821" },
  { seed: 58, blocking: "0.2846537" },
  { seed: 59, blocking: "0.2857768" },
  { seed: 57, blocking: "0.2849089" },
  { seed: 38, blocking: "0.2848447" },
  { seed: 39, blocking: "0.2851353" },
  { seed: 68, blocking: "0.2851884" },
  { seed: 28, blocking: "0.2845026" },
  { seed: 80, blocking: "0.2852342" },
];

export default function Seeds() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">4. Seeds</h2>

      <p className="text-slate-600 leading-relaxed">
        Running the simulation multiple times gave noticeably different
        results each time, which is a problem: a simulation whose answer
        changes every time you run it isn&apos;t trustworthy. The fix is a{" "}
        <strong>seed</strong>: a starting number that initialises the random
        number generator so it produces the exact same sequence of
        &ldquo;random&rdquo; numbers every time. Since the simulation&apos;s
        entire outcome depends only on that sequence, the same seed always
        reproduces the same result, computer-generated randomness is really
        just a deterministic sequence that <em>looks</em> random.
      </p>

      <h3 className="text-lg font-semibold text-slate-700">
        Why run many seeds, not one
      </h3>
      <p className="text-slate-600 leading-relaxed">
        A single seed gives just one sample. Because the underlying process
        is random, that one result carries noise: it lands near the
        analytical value but rarely exactly on it. Picking whichever seed
        happens to land closest would be misleading, that&apos;s selecting a
        result <em>because</em> it matches the answer already known, which
        makes the simulation look more accurate than it honestly is.
      </p>
      <p className="text-slate-600 leading-relaxed">
        The right approach is to run several independent seeds and report
        the <strong>mean</strong> and <strong>standard deviation</strong>.
        Averaging cancels out run-to-run noise, so the mean lands closer to
        the true value than any single run, and the standard deviation shows
        how much the runs actually varied.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs font-semibold text-slate-400 tracking-wider">
              <th className="text-left px-2">Seed</th>
              <th className="text-left px-2">
                Simulated blocking (2,000,000 calls, 5% warm-up)
              </th>
            </tr>
          </thead>
          <tbody>
            {SEED_RESULTS.map(({ seed, blocking }) => (
              <tr key={seed} className="bg-slate-50">
                <td className="px-2 py-1.5 rounded-l-lg font-semibold text-slate-500">
                  {seed}
                </td>
                <td className="px-2 py-1.5 rounded-r-lg font-mono text-slate-700">
                  {blocking}
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-50 border-t border-slate-200">
              <td className="px-2 py-1.5 rounded-l-lg font-semibold text-emerald-700">
                Mean
              </td>
              <td className="px-2 py-1.5 rounded-r-lg font-mono font-semibold text-emerald-700">
                0.2850529
              </td>
            </tr>
            <tr className="bg-emerald-50">
              <td className="px-2 py-1.5 rounded-l-lg font-semibold text-emerald-700">
                Standard deviation
              </td>
              <td className="px-2 py-1.5 rounded-r-lg font-mono font-semibold text-emerald-700">
                0.0003595
              </td>
            </tr>
            <tr className="bg-white">
              <td className="px-2 py-1.5 rounded-l-lg text-slate-500">
                Analytical Erlang-B
              </td>
              <td className="px-2 py-1.5 rounded-r-lg font-mono text-slate-500">
                0.2848678
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Every individual seed lands within about ±0.0005 of the analytical
        value, and the mean across all ten is closer still. The result worth
        reporting is this average with its standard deviation, not any
        single hand-picked run.
      </p>

      <p className="text-slate-600 leading-relaxed text-sm">
        The seeds used throughout this page (42, 50, 58, 59, 57, 38, 39, 68,
        28, 80) are arbitrary, they were simply picked and then kept fixed
        so every run shown here is reproducible.
      </p>
    </section>
  );
}
