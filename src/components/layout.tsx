import React from "react";
import Link from "next/link";

const navLinks = [
  { href: "/erlang", label: "Erlang-B" },
];

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-sky-600">
            Home
          </Link>
          <div className="space-x-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1 rounded-md text-sky-600 hover:bg-sky-100"
              >
                {label}
              </Link>
            ))}
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
