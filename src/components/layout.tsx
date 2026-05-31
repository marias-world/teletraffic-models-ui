"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

const theoryLinks = [
  { href: "/theory/traffic-load",                label: "Traffic Load" },
  { href: "/theory/poisson-traffic",             label: "Poisson Traffic" },
  { href: "/theory/classification-of-loss-models", label: "Classification of Loss Models" },
];

type LayoutProps = {
  children: React.ReactNode;
};

function TheoryDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-3 py-1 rounded-md text-sky-600 hover:bg-sky-100 font-medium text-sm"
      >
        Theory
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
          {theoryLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-sky-600">
            Home
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/erlang"
              className="px-3 py-1 rounded-md text-sky-600 hover:bg-sky-100 font-medium text-sm"
            >
              Erlang-B
            </Link>
            <TheoryDropdown />
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-white shadow-inner p-4 mt-10">
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Teletraffic Models. All rights reserved.
        </div>
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          Created by{" "}
          <a
            href="https://www.linkedin.com/in/mariakourtesi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Maria Kourtesi
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
