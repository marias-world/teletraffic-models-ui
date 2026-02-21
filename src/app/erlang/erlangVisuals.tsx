"use client";

import { useState } from "react";
import Server from "../server";
import { motion } from "framer-motion";

export default function ErlangVisualization() {
  const [servers, setServers] = useState(Array(5).fill(false)); // 5 servers, all free initially

  const calculate = () => {
    // Random example for blocking
    const newServers = servers.map(() => Math.random() < 0.6); // 60% chance busy
    setServers(newServers);
  };

  return (
    <div className="min-h-screen p-8 bg-slate-100 flex flex-col items-center space-y-8">
      <h1 className="text-2xl font-bold">Erlang B Simulation</h1>

      {/* Servers */}
      <div className="flex gap-4">
        {servers.map((busy, idx) => (
          <Server key={idx} busy={busy} />
        ))}
      </div>

      {/* Trigger calculation */}
      <button
        onClick={calculate}
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Calculate Blocking Probabilities
      </button>

      {/* Calls animation */}
      <div className="relative w-full h-20 mt-8">
        {servers.map((_, idx) => (
          <motion.div
            key={idx}
            className="w-4 h-4 bg-blue-500 rounded-full absolute top-8 left-0"
            initial={{ x: 0 }}
            animate={{ x: servers[idx] ? 0 : 200 }}
            transition={{ duration: 1 }}
          />
        ))}
      </div>
    </div>
  );
}