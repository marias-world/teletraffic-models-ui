export default function Assumptions() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-700">Model Assumptions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-sky-800">
            🔗 Independent links
          </p>
          <p className="text-sm text-slate-600">
            Each link is treated on its own, as if it blocks calls separately
            from the others. This is the shortcut that makes the model easy to
            solve.
          </p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-sky-800">🛣️ Fixed routes</p>
          <p className="text-sm text-slate-600">
            Each type of call always takes the same route, and needs some
            bandwidth on every link along it.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-amber-800">
            🚫 All-or-nothing
          </p>
          <p className="text-sm text-slate-600">
            A call is accepted only if every link on its route has enough room.
            If even one link is full, the call is blocked.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-emerald-700">
            📉 Reduced load
          </p>
          <p className="text-sm text-slate-600">
            The load sent to a link is lowered to reflect the calls that were
            already blocked earlier on the route.
          </p>
        </div>
      </div>
    </section>
  );
}
