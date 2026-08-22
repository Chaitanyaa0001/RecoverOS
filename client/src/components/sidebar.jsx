"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  FileText,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Events",
    href: "/events",
    icon: ListChecks,
  },
  {
    label: "Guardrails",
    href: "/guardrails",
    icon: ShieldCheck,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <header className="fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
            <TrendingUp
              size={14}
              className="text-emerald-600"
            />
          </div>

          <span className="text-[12px] font-semibold text-slate-800">
            Revenue Recovery
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          bg-[#1d252e] text-slate-300
          transition-transform duration-200 ease-out

          w-[240px]

          md:w-[64px]

          lg:w-[250px]

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ================= BRAND ================= */}
        <div className="flex h-[58px] items-center border-b border-white/5 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15">
              <TrendingUp
                size={14}
                className="text-emerald-400"
              />
            </div>

            {/* Hide brand text on tablet */}
            <span className="truncate text-[12px] font-semibold text-white md:hidden lg:block">
              Revenue Recovery
            </span>
          </div>

          {/* Close button only mobile */}
          <button
            onClick={closeMobileSidebar}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="mt-3 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className={`
                  mb-1 flex items-center gap-2 rounded-md
                  px-3 py-2
                  text-[11px]
                  transition-colors

                  ${
                    active
                      ? "bg-[#303a47] text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }

                  md:justify-center
                  md:px-0

                  lg:justify-start
                  lg:px-3
                `}
              >
                <Icon size={14} strokeWidth={1.8} className="shrink-0"/>
                {/* Hide labels on tablet */}
                <span className="md:hidden lg:inline">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ================= FOOTER ================= */}
        <div className="mt-auto border-t border-white/5 px-4 py-4 md:px-2 lg:px-4">
          <p className="truncate text-[9px] text-slate-500 md:hidden lg:block">
            Zenpay Commerce
          </p>

          <p className="mt-1 truncate text-[9px] text-slate-500 md:hidden lg:block">
            Finance operations · IN
          </p>

          {/* Tablet footer icon */}
          <div className="hidden justify-center md:flex lg:hidden">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </aside>
    </>
  );
}