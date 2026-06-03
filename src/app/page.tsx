import Layout from "@/components/layout";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6">
          <h1 className="text-3xl font-bold">
            Mathematical Models for Capacity Planning
          </h1>
          <p>
            Welcome! This app allows you to explore several models used in
            network and system capacity planning, such as EMLM and Erlang
            formulas. Each model has its own dedicated page where you can input
            system parameters and calculate Call Blocking Propabilities (CBP).
          </p>

          <h2 className="text-2xl font-semibold">Analytical Models:</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/erlang"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Erlang-B Analytical Model
              </Link>
            </li>
            <li>
              <Link
                href="/kaufman-roberts"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Kaufman-Roberts Model
              </Link>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold">Theory & Formulas</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/theory/poisson-traffic"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Poisson Traffic
              </Link>
            </li>
            <li>
              <Link
                href="/theory/traffic-load"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Traffic Load
              </Link>
            </li>
            <li>
              <Link
                href="/theory/markov-chains"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Markov Chains &amp; Birth-Death Process
              </Link>
            </li>
            <li>
              <Link
                href="/theory/bandwidth-sharing-policies"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Bandwidth Sharing Policies
              </Link>
            </li>
            <li>
              <Link
                href="/theory/grade-of-service"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Grade of Service (GoS)
              </Link>
            </li>
            <li>
              <Link
                href="/theory/classification-of-loss-models"
                className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                Classification of Teletraffic Loss Models
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
