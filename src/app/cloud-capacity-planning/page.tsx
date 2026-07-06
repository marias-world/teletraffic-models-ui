import Link from "next/link";
import "katex/dist/katex.min.css";
import Overview from "./Overview";
import RequestFlow from "./RequestFlow";
import WorkedExample from "./WorkedExample";
import Calculator from "./Calculator";
import AnimationSection from "./AnimationSection";
import Image from "next/image";

export default function CloudCapacityPlanningPage() {
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
              <span>Models</span>
              {" / "}
              <span className="text-slate-700">Cloud Capacity Planning</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Algorithm for Cloud Physical Infrastructure Capacity Planning
            </h1>
          </div>

          <Overview />
          <RequestFlow />

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">
              Model Structure
            </h2>
            <figure className="space-y-3">
              <Image
                src="/images/models.png"
                alt="Visual representation of how the Kaufman-Roberts, Limited Availability, and Reduced Load Approximation models are combined across k identical physical machines"
                width={800}
                height={500}
                className="w-full max-w-md mx-auto rounded-lg border border-slate-200"
              />
              <figcaption className="text-xs text-slate-400 text-center leading-relaxed">
                How the Kaufman-Roberts, Limited Availability Group (LAG), and
                Reduced Load Approximation (RLA) models are combined to
                calculate blocking probabilities in a cloud infrastructure with{" "}
                <em>k</em> identical physical machines (PMs). Each PM exposes
                four resource dimensions: P (Processor), R (RAM), D (Disk), and
                bps (Network bandwidth).
              </figcaption>
            </figure>
          </section>
          <Calculator />
          <AnimationSection />
          <WorkedExample />

          {/* References */}
          <section className="border-t border-slate-200 pt-6 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              References
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hanczewski, S., Stasiak, M., &amp; Weissenberg, M. (2021).{" "}
              <em>
                A Multiparameter Analytical Model of the Physical Infrastructure
                of a Cloud-Based System
              </em>
              . IEEE Access, vol. 9, pp. 100981-100990.{" "}
              <a
                href="https://doi.org/10.1109/ACCESS.2021.3097157"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                https://doi.org/10.1109/ACCESS.2021.3097157
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
