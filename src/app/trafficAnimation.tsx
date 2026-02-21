"use client";

import { motion } from "framer-motion";

export default function Call() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <motion.div
        className="w-4 h-4 bg-blue-500 rounded-full"
        initial={{ x: 0 }}
        animate={{ x: 200 }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
      />
    </div>
  );
}