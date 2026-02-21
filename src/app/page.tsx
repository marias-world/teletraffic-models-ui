"use client";
import { BlockMath } from "react-katex";
export default function Home() {
  return (
    <div className="min-h-screen p-10 bg-slate-100">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6">
        <h1 className="text-3xl font-bold">
          Mathematical Models for Capacity Planning
        </h1>
        <p>
          Welcome! This app allows you to explore several models used in network
          and system capacity planning, such as EMLM and Erlang formulas. Each
          model has its own dedicated page where you can input system parameters
          and calculate Call Blocking Propabilities (CBP).
        </p>

        <h2 className="text-2xl font-semibold">Analytical Models:</h2>
        <ul>
          <li>
            <a
              href="/erlang"
              className="inline-block px-4 py-2 font-bold border border-blue-500 text-blue-500 font-medium rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
            >
              Erlang-B Analytical Model
            </a>
          </li>
          {/* <li><a href="/simulations" className="text-blue-600 hover:underline">Simulations</a></li> */}
        </ul>

        <h2 className="text-2xl font-semibold">Theory & Formulas</h2>
        <p></p>
        <div className="space-y-3"></div>
      </div>
    </div>
  );
}
