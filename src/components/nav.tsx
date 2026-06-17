"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const modelLinks = [
  { href: "/erlang", label: "Erlang-B" },
  { href: "/kaufman-roberts", label: "Kaufman-Roberts" },
  { href: "/limited-availability-group", label: "Limited Availability Group (LAG)" },
];

const theoryLinks = [
  { href: "/theory/probability-and-statistics", label: "Probability & Statistics" },
  { href: "/theory/traffic-load", label: "Traffic Load" },
  { href: "/theory/poisson-traffic", label: "Poisson Traffic" },
  { href: "/theory/markov-chains", label: "Markov Chains & Birth-Death" },
  { href: "/theory/classification-of-loss-models", label: "Classification of Loss Models" },
  { href: "/theory/bandwidth-sharing-policies", label: "Bandwidth Sharing Policies" },
  { href: "/theory/grade-of-service", label: "Grade of Service" },
];

function Dropdown({
  label,
  links,
  width = "w-52",
}: {
  label: string;
  links: { href: string; label: string }[];
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        {label}
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
        <div className={`absolute right-0 mt-1 ${width} bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1`}>
          {links.map(({ href, label: linkLabel }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              {linkLabel}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavBar() {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-sky-600">
          Home
        </Link>
        <div className="flex items-center gap-1">
          <Dropdown label="Models" links={modelLinks} width="w-52" />
          <Dropdown label="Theory" links={theoryLinks} width="w-56" />
        </div>
      </div>
    </nav>
  );
}
