"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "Guardrails",
    href: "/guardrails",
  },
  {
    label: "Reports",
    href: "/reports",
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d9d68] text-white shadow-sm">
            <Activity size={18} />
          </div>

          <div>
            <p className="text-[14px] font-semibold tracking-tight text-slate-800">
              RecoverOS
            </p>

            <p className="hidden text-[8px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:block">
              Revenue Recovery
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP CTA */}

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-md bg-[#1d9d68] px-4 py-2 text-[10px] font-medium text-white shadow-sm transition hover:bg-[#16875a]"
          >
            Open Dashboard
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 md:hidden"
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {/* MOBILE MENU */}

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-md px-3 py-3 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#1d9d68] px-4 py-3 text-[10px] font-medium text-white"
          >
            Open Dashboard
            <ArrowUpRight size={12} />
          </Link>
        </div>
      )}
    </nav>
  );
}