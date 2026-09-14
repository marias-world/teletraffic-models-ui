// The one book cited across several theory/model pages on this site. Kept
// as its own component instead of repeated per-page markup so there's a
// single place to update the citation if it ever changes.
export default function MoscholiosBookReference() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-700">Reference</h2>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-1">
        <p className="font-medium text-slate-700">
          Ioannis D. Moscholios, Michael Logothetis
        </p>
        <p className="italic">
          Efficient Multirate Teletraffic Loss Models Beyond Erlang, Wiley-IEEE
          Press, 2019.
        </p>
        <a
          href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline break-all"
        >
          https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974
        </a>
      </div>
    </section>
  );
}
