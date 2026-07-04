import { BlockMath, InlineMath } from "react-katex";

export default function ModelApproximations() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">
        Model Approximations
      </h2>
      <p className="text-slate-600 leading-relaxed text-sm">
        The recursion above relies on two approximations that keep the
        calculation simple enough to run in practice.
      </p>
      <div className="space-y-3">
        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
          <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">1️⃣</span>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-sky-800">
              Assumption 1: <InlineMath math="\sigma_k" /> depends only on total
              occupied b.u.
            </p>
            <p className="text-sm text-sky-900 leading-relaxed">
              In the exact model, the probability of accepting a class-
              <InlineMath math="k" /> call depends on how many calls of each
              type are in each specific subgroup, a very large state space. We
              simplify by assuming it depends only on the{" "}
              <strong>total number of busy b.u.</strong> across all subgroups,{" "}
              <InlineMath math="j" />:
            </p>
            <div className="overflow-x-auto">
              <BlockMath math="\sigma_k(n_{1,1},\,n_{1,2},\,\ldots,\,n_{K,\ell}) \approx \sigma_k(j)" />
            </div>
            {/* Visual: two scenarios with same j but different outcomes */}
            <div className="rounded-lg border border-sky-200 bg-white p-3 space-y-3">
              <p className="text-[11px] font-semibold text-slate-500 tracking-wider text-center">
                Example: ℓ=3, C=5, j=12. New class-k call arrives (needs 2 free
                b.u. in one resource).
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  {
                    label: "Scenario 1",
                    busy: [4, 4, 4],
                    result: "blocked",
                    resultColor: "text-red-600",
                    icon: "✗",
                  },
                  {
                    label: "Scenario 2",
                    busy: [5, 4, 3],
                    result: "accepted (fits in R3)",
                    resultColor: "text-emerald-600",
                    icon: "✓",
                  },
                ].map(({ label, busy, result, resultColor, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <p className="text-[11px] font-semibold text-slate-600">
                      {label} (j = {busy.reduce((a, b) => a + b, 0)})
                    </p>
                    <div className="flex gap-2 items-end">
                      {busy.map((b, gi) => (
                        <div
                          key={gi}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <div className="flex flex-col-reverse gap-0.5">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <div
                                key={si}
                                className={`w-7 h-4 rounded-sm border ${si < b ? "bg-slate-400 border-slate-500" : "bg-sky-100 border-sky-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            R{gi + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${resultColor}`}>
                      {icon} {result}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Both have j=12, so the model uses the same{" "}
                <InlineMath math="\sigma_k(12)" /> for both, even though the
                real outcome differs.
              </p>
            </div>

            <p className="text-xs text-sky-700 leading-relaxed">
              This reduces the problem from a high-dimensional state space to
              the simple 1D recursion. It is an approximation: two states with
              the same <InlineMath math="j" /> but different distributions
              across subgroups can give different acceptance outcomes in
              reality.
            </p>
          </div>
        </div>

        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">
            2️⃣
          </span>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-amber-800">
              Assumption 2: <InlineMath math="\sigma_k" /> changes slowly with{" "}
              <InlineMath math="j" />
            </p>

            {/* Step 1: the problem */}
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Step 1: the problem.</strong> In a real system, whether a
              new call is accepted can depend on exactly how the busy units are
              spread across the subgroups, not only on the total number of busy
              units <InlineMath math="j" />. The example below shows two
              situations that share the exact same <InlineMath math="j" />, yet
              lead to opposite outcomes for the next call. This is called{" "}
              <strong>mutual dependence between service classes</strong>: which
              subgroup absorbs one class&apos;s call can flip whether another
              class&apos;s call gets through.
            </p>

            {/* Two-case example */}
            <div className="rounded-lg border border-amber-200 bg-white p-4 space-y-4">
              <p className="text-xs font-semibold text-slate-600">
                Concrete case: ℓ=3 subgroups, each with capacity C=5. Starting
                from occupancy j=12, split as R1=5, R2=4, R3=3, a new class-1
                call arrives (it needs 1 b.u.) and occupies exactly one free
                slot, in whichever subgroup it lands in. A class-2 call needs 2
                free b.u. together in a single subgroup, so it matters a lot
                which subgroup serves the class-1 call.
              </p>

              {/* Before diagram, shared starting point */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] font-semibold text-slate-500 text-center">
                  Before the class-1 call (j = 12)
                </p>
                <div className="flex gap-2 items-end">
                  {[5, 4, 3].map((busy, gi) => (
                    <div
                      key={gi}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <div className="flex flex-col-reverse gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div
                            key={si}
                            className={`w-7 h-4 rounded-sm border ${
                              si < busy
                                ? "bg-slate-400 border-slate-500"
                                : "bg-sky-100 border-sky-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">R{gi + 1}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  R3 has exactly 2 free b.u., just enough for the next class-2
                  call.
                </p>
              </div>

              <div className="border-t border-dashed border-amber-200" />

              <div className="flex flex-wrap justify-center gap-8">
                {[
                  {
                    label: "Case a: call placed in R2",
                    before: [5, 4, 3],
                    newGroupIndex: 1,
                    next: "class-2 accepted",
                    nextColor: "text-emerald-600",
                    icon: "✓",
                    note: "R3 untouched, still has 2 free b.u.",
                  },
                  {
                    label: "Case b: call placed in R3",
                    before: [5, 4, 3],
                    newGroupIndex: 2,
                    next: "class-2 blocked",
                    nextColor: "text-red-600",
                    icon: "✗",
                    note: "R3's 2 free b.u. just became 1",
                  },
                ].map(
                  ({
                    label,
                    before,
                    newGroupIndex,
                    next,
                    nextColor,
                    icon,
                    note,
                  }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2"
                    >
                      <p className="text-[11px] font-semibold text-slate-600 text-center">
                        {label} (j = 13)
                      </p>
                      <div className="flex gap-2 items-end">
                        {before.map((busy, gi) => (
                          <div
                            key={gi}
                            className="flex flex-col items-center gap-0.5"
                          >
                            <div className="flex flex-col-reverse gap-0.5">
                              {Array.from({ length: 5 }).map((_, si) => {
                                const isNewCell =
                                  gi === newGroupIndex && si === busy;
                                return (
                                  <div
                                    key={si}
                                    className={`w-7 h-4 rounded-sm border ${
                                      isNewCell
                                        ? "bg-amber-300 border-amber-500 border-dashed border-2"
                                        : si < busy
                                          ? "bg-slate-400 border-slate-500"
                                          : "bg-sky-100 border-sky-300"
                                    }`}
                                  />
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              R{gi + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-amber-600 text-center">
                        dashed cell = the new class-1 call
                      </p>
                      <p className="text-[10px] text-slate-400 text-center">
                        {note}
                      </p>
                      <p className={`text-xs font-semibold ${nextColor}`}>
                        {icon} Next class-2: {next}
                      </p>
                    </div>
                  ),
                )}
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Same starting point (j=12) and same occupancy after the new call
                (j=13), but two different outcomes for the next call. The
                class-1 call always takes just 1 slot, the difference is whether
                that slot comes out of R3&apos;s 2 free b.u. (blocking the next
                class-2 call) or out of a different subgroup (leaving R3 free
                for it).
              </p>
            </div>

            {/* Step 2: why this is a problem for the model */}
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Step 2: why this is a problem for the model.</strong> The
              model does not want to track every possible way of splitting busy
              units across subgroups, that state space is huge. It wants one
              simple number, <InlineMath math="\sigma_k(j)" />
              , that depends only on the total <InlineMath math="j" />. But Step
              1 just showed that two situations with the same{" "}
              <InlineMath math="j" /> can behave differently in reality. So
              using a single <InlineMath math="\sigma_k(j)" /> for both is
              necessarily wrong for at least one of them, by some amount.
            </p>

            {/* Step 3: the assumption that keeps the error small */}
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Step 3: the fix.</strong> Assumption 2 does not claim
              mutual dependence goes away, it claims the error it causes stays
              small. It does this by requiring <InlineMath math="\sigma_k" /> to
              change only slightly between two neighbouring occupancy levels,{" "}
              <InlineMath math="j - 1" /> and <InlineMath math="j" />:
            </p>

            <div className="overflow-x-auto">
              <BlockMath math="\left|\frac{\sigma_k(j) - \sigma_k(j-1)}{\sigma_k(j)}\right| \ll 1" />
            </div>

            <p className="text-xs text-amber-700 leading-relaxed">
              <InlineMath math="\sigma_k(j)" /> is the current state,{" "}
              <InlineMath math="\sigma_k(j-1)" /> is the previous state, one
              busy unit earlier. The numerator is how much the acceptance
              probability moved between those two states. Dividing by{" "}
              <InlineMath math="\sigma_k(j)" /> turns that into a percentage of
              the current value, so it does not matter whether{" "}
              <InlineMath math="\sigma_k" /> itself is large or small, only how
              much it moved relative to where it was. The symbol{" "}
              <InlineMath math="\ll" /> means &ldquo;much less than&rdquo;: not
              just below 1, but close to 0. So the condition says this
              percentage change must be small, like a few percent, at every
              step.
            </p>

            <p className="text-xs text-amber-700 leading-relaxed">
              Example: if <InlineMath math="\sigma_k(j-1) = 1.0" /> and{" "}
              <InlineMath math="\sigma_k(j) = 0.9" />, the change is{" "}
              <InlineMath math="0.1 / 0.9 \approx 0.11" />, about 11%, small
              enough to satisfy <InlineMath math="\ll 1" />. But if{" "}
              <InlineMath math="\sigma_k(j-1) = 0.9" /> and{" "}
              <InlineMath math="\sigma_k(j) = 0.5" />, the change is{" "}
              <InlineMath math="0.4 / 0.5 = 0.8" />, 80%, close to 1 and far
              from 0, so it fails the condition. This tends to happen near
              saturation, when the system is close to full.
            </p>

            {/* Step 4: the explicit connection */}
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Step 4: how it all connects.</strong> Mutual dependence
              (Step 1) is the real phenomenon: identical <InlineMath math="j" />{" "}
              can hide very different true acceptance probabilities depending on
              how busy units are split. The assumption (Step 3) does not remove
              that phenomenon, it bounds it: if <InlineMath math="\sigma_k" />{" "}
              barely moves from <InlineMath math="j-1" /> to{" "}
              <InlineMath math="j" />, then any two situations sharing that{" "}
              <InlineMath math="j" /> cannot have truly different acceptance
              probabilities either, so replacing them with one shared{" "}
              <InlineMath math="\sigma_k(j)" /> costs little accuracy. When{" "}
              <InlineMath math="\sigma_k" /> instead swings sharply (as in the
              80% example, typically near saturation), that is exactly when the
              mutual dependence from Step 1 starts to matter, and the
              approximation gets less reliable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
