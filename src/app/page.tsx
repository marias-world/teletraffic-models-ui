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

        <h2 className="text-2xl font-semibold">Models:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <a href="/erlang" className="text-blue-600 hover:underline">
              Erlang Model
            </a>
          </li>
          {/* <li><a href="/simulations" className="text-blue-600 hover:underline">Simulations</a></li> */}
        </ul>
  

        <h2 className="text-2xl font-semibold">Theory & Formulas</h2>
        <p>Here you can describe the formulas and include LaTeX rendering:</p>
        <div className="space-y-3">
          
        </div>
      </div>
    </div>
  );
}
