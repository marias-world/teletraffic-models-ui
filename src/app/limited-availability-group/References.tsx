export default function References() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">References</h2>
      <div className="space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">
          M. Vlasakis, M. Kourtesi, I-A. Chousainov, I. Keramidi, D. Uzunidis,
          O. Zestas, I. D. Moscholios and M. Logothetis.{" "}
          <em>
            &quot;On the limited-availability group model for multirate
            Poisson traffic.&quot;
          </em>{" "}
          Proc. Panhellenic Conf. Electronics and Telecommunications (PACET).
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Michael Logothetis, Ioannis D. Moscholios.{" "}
          <em>Efficient Multirate Teletraffic Loss Models Beyond Erlang</em>.
          Wiley-IEEE Press, 2019.{" "}
          <a
            href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:underline"
          >
            onlinelibrary.wiley.com
          </a>
        </p>
      </div>
    </div>
  );
}
