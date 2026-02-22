"use client";

import React from "react";
import Link from "next/link";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-sky-600">
            Home
          </Link>
          <div className="space-x-4">
            <Link
              href="/erlang"
              className="px-3 py-1 rounded-md text-sky-600 hover:bg-sky-100"
            >
              Erlang-B
            </Link>
            {/* Add other models here */}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white shadow-inner p-4 mt-10">
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Teletraffic Models. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
