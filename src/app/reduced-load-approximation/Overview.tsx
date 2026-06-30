export default function Overview() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Overview</h2>

      <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl p-4">
        <span className="text-sky-500 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-sky-900 leading-relaxed">
          The Reduced Load Approximation is also known as the{" "}
          <strong>Fixed-Point (FP) method</strong> (and as the{" "}
          <strong>knapsack approximation</strong>).
        </p>
      </div>

      <p className="text-slate-600 leading-relaxed">
        The <strong>RLA</strong> is an iterative method for systems where shared
        resources, such as servers or network cells, carry many calls at the
        same time. It captures how accepting one call affects the others, since
        calls competing for the same resources are not independent. The method
        is quick to compute, at the cost of giving approximate rather than exact
        results.
      </p>

      <p className="text-slate-600 leading-relaxed">
        The core idea is to find a stable state of the system, where the
        interdependent values no longer change much from one iteration to the
        next.
      </p>

      <div className="flex gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <span className="text-violet-500 text-lg flex-shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-violet-900 leading-relaxed">
          In the RLA, a call that is already blocked on one link never reaches
          the next link, so it does not add load there. The model lowers
          (reduces) the traffic each link sees to account for this.
        </p>
      </div>
    </section>
  );
}
