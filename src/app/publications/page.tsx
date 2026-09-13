import Link from "next/link";

interface Publication {
  authors: string;
  title: string;
  venue: string;
  doi?: string;
  status?: string;
}

const PUBLICATIONS: Publication[] = [
  {
    authors:
      "M. Vlasakis, M. Kourtesi, I. P. Keramidi, D. Uzunidis, I. D. Moscholios and M. D. Logothetis",
    title:
      "Performance evaluation of the limited availability group model for multirate batched Poisson traffic",
    venue:
      "AEU – International Journal of Electronics and Communications, 2026",
    status: "Under minor revision",
  },
  {
    authors:
      "M. Kourtesi, M. Vlasakis, I.-A. Chousainov, I. Moscholios and M. Logothetis",
    title:
      "On the Analysis and Validation of a Multiparameter Analytical Loss Model for an IaaS Cloud Physical Infrastructure",
    venue:
      "2026 15th International Symposium on Communication Systems, Networks and Digital Signal Processing (CSNDSP), Edinburgh, United Kingdom, 2026, pp. 1-6",
    doi: "10.1109/CSNDSP68462.2026.11654431",
  },
  {
    authors:
      "M. Vlasakis, M. Kourtesi, I.-A. Chousainov, I. Keramidi, D. Uzunidis, O. Zestas, I. D. Moscholios and M. Logothetis",
    title:
      "An Analytical Study of the Limited Availability Group Model for Multirate Poisson Traffic",
    venue:
      "2026 15th International Symposium on Communication Systems, Networks and Digital Signal Processing (CSNDSP), Edinburgh, United Kingdom, 2026, pp. 1-6",
    doi: "10.1109/CSNDSP68462.2026.11654410",
  },
  {
    authors:
      "M. Vlasakis, M. Kourtesi, I.-A. Chousainov, I. Keramidi, D. Uzunidis, O. Zestas, I. D. Moscholios and M. Logothetis",
    title: "On the limited-availability group model for multirate Poisson traffic",
    venue: "Panhellenic Conf. Electronics and Telecommunications (PACET)",
    doi: "10.1109/PACET68758.2026.11498249",
  },
];

const PRESENTATIONS = [
  {
    title:
      "On the Analysis and Validation of a Multiparameter Analytical Loss Model for an IaaS Cloud Physical Infrastructure",
    detail: "Accepted for presentation at IEEE CSNDSP 2026, Edinburgh, July 2026",
    posterUrl:
      "https://drive.google.com/file/d/1RGBJV2bkQqRitWvKoZbzMLzyx1Rtc9vZ/view?usp=drive_link",
  },
  {
    title:
      "An Analytical Study of the Limited Availability Group Model for Multirate Poisson Traffic",
    detail: "Accepted for presentation at IEEE CSNDSP 2026, Edinburgh, July 2026",
    posterUrl:
      "https://drive.google.com/file/d/1Ol44buGwWKJY0Tv29OXvPo8c3CxKk1de/view?usp=drive_link",
  },
];

function highlightAuthor(authors: string) {
  // Bold whichever author name is "M. Kourtesi" or "Μ. Kourtesi" (the
  // Greek capital Mu look-alike some of these were originally typed with),
  // normalised to the Latin "M." used everywhere else on this site.
  const parts = authors.split(/([ΜM]\.\s*Kourtesi)/);
  return parts.map((part, i) =>
    /^[ΜM]\.\s*Kourtesi$/.test(part) ? (
      <strong key={i} className="text-slate-800 font-semibold">
        M. Kourtesi
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function PublicationsPage() {
  return (
    <div className="min-h-screen p-4 sm:p-10 bg-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-10">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span className="text-slate-700">Publications</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">Publications</h1>
            <p className="text-slate-500 text-sm mt-2">
              Journal papers, conference papers, and presentations related to
              the models on this site.
            </p>
          </div>

          {/* Publications */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Publications
            </h2>
            <ul className="space-y-5">
              {PUBLICATIONS.map((pub) => (
                <li key={pub.title} className="flex gap-3">
                  <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <div className="text-sm leading-relaxed break-words space-y-1">
                    <p className="text-slate-500">
                      {highlightAuthor(pub.authors)}
                    </p>
                    <p className="text-slate-700 italic">
                      &ldquo;{pub.title}.&rdquo;
                    </p>
                    <p className="text-slate-500">
                      {pub.venue}
                      {pub.status && (
                        <span className="ml-2 inline-block text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 align-middle">
                          {pub.status}
                        </span>
                      )}
                    </p>
                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sky-600 hover:underline break-all"
                      >
                        doi: {pub.doi}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Conference Presentations */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Conference Presentations
            </h2>
            <ul className="space-y-4">
              {PRESENTATIONS.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <div className="text-sm leading-relaxed space-y-1">
                    <p className="text-slate-700 italic">
                      &ldquo;{p.title}.&rdquo;
                    </p>
                    <p className="text-slate-500">{p.detail}</p>
                    {p.posterUrl && (
                      <a
                        href={p.posterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sky-600 hover:underline"
                      >
                        View poster &rarr;
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
