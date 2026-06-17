"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

const modelLinks = [
  { href: "/erlang", label: "Erlang-B" },
  { href: "/kaufman-roberts", label: "Kaufman-Roberts" },
  {
    href: "/limited-availability-group",
    label: "Limited Availability Group (LAG)",
  },
];

const theoryLinks = [
  {
    href: "/theory/probability-and-statistics",
    label: "Probability & Statistics",
  },
  {
    href: "/theory/inclusion-exclusion",
    label: "Inclusion-Exclusion Principle",
  },
  { href: "/theory/traffic-load", label: "Traffic Load" },
  { href: "/theory/poisson-traffic", label: "Poisson Traffic" },
  {
    href: "/theory/markov-chains",
    label: "Markov Chains & Birth-Death",
  },
  {
    href: "/theory/classification-of-loss-models",
    label: "Classification of Loss Models",
  },
  {
    href: "/theory/bandwidth-sharing-policies",
    label: "Bandwidth Sharing Policies",
  },
  {
    href: "/theory/grade-of-service",
    label: "Grade of Service",
  },
];

type LayoutProps = {
  children: React.ReactNode;
};

function ModelsDropdown() {
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
        Models
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
        <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
          {modelLinks.map(({ href, label }) => (
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
            <ModelsDropdown />
            <TheoryDropdown />
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-10">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Column 1 — About */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              About
            </h3>
            <p className="text-sm leading-relaxed">
              An interactive reference for teletraffic loss models, built as a
              companion to academic study.
            </p>
            <div className="pt-1">
              <p className="text-xs text-slate-500 mb-1">Created by</p>
              <a
                href="https://www.linkedin.com/in/mariakourtesi/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Maria Kourtesi
              </a>
            </div>
          </div>

          {/* Column 2 — Research */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              Research
            </h3>
            <p className="text-xs text-slate-500">Master&apos;s Thesis</p>
            <a
              href="https://apothesis.eap.gr/archive/item/228527"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-slate-300 hover:text-white leading-relaxed transition-colors duration-150 group"
            >
              <span className="group-hover:underline underline-offset-2">
                Call blocking in cloud systems supporting multirate random
                traffic – The case of the Infrastructure as a Service model
                (IaaS)
              </span>
              <span className="block mt-1 text-xs text-sky-500 group-hover:text-sky-400">
                View thesis →
              </span>
            </a>
          </div>

          {/* Column 3 — Source */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              Source Code
            </h3>
            <p className="text-sm leading-relaxed">
              This project is open source. Contributions and feedback are
              welcome.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="https://github.com/marias-world/teletraffic-models-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                View on GitHub
              </a>
              <br />
              <a
                href="https://github.com/mariakourtesi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                @mariakourtesi
              </a>
            </div>
          </div>
        </div>

        {/* Publications band */}
        <div className="border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">
              Publications
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-1 rounded-full bg-sky-500" />
                <p className="text-sm leading-relaxed">
                  <span className="text-slate-400">
                    M. Vlasakis,{" "}
                    <span className="text-slate-200 font-medium">
                      M. Kourtesi
                    </span>
                    , I-A. Chousainov, I. Keramidi, D. Uzunidis, O. Zestas, I.
                    D. Moscholios and M. Logothetis.{" "}
                  </span>
                  <span className="text-slate-300 italic">
                    &ldquo;On the limited-availability group model for multirate
                    Poisson traffic.&rdquo;
                  </span>
                  <span className="text-slate-500">
                    {" "}
                    Proc. Panhellenic Conf. Electronics and Telecommunications
                    (PACET).
                  </span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer band */}
        <div className="border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-6 py-4 text-center text-xs text-slate-500 leading-relaxed">
            The content on this site is based on personal handwritten study
            notes and may contain errors or omissions. If you spot a mistake,
            please{" "}
            <a
              href="https://github.com/marias-world/teletraffic-models-ui/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-400 underline underline-offset-2 transition-colors duration-150"
            >
              raise an issue on GitHub
            </a>
            .
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <span className="text-slate-300">
              © {new Date().getFullYear()} Maria Kourtesi. Licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors duration-150"
              >
                CC BY-NC 4.0
              </a>
            </span>
            <span className="text-slate-600">
              Built with Next.js &amp; Tailwind CSS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
