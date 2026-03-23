"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LangSwitcher from "./LangSwitcher";

export default function NavBar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const linkClass =
    "text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-4 sm:gap-6">
        <Link href="/" className="font-bold text-lg tracking-tight shrink-0">
          {t("nav.brand")}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <Link href="/" className={linkClass}>{t("nav.units")}</Link>
          <Link href="/convert" className={linkClass}>{t("nav.convert")}</Link>
          <Link href="/contribute" className={linkClass}>{t("nav.contribute")}</Link>
          <Link href="/docs" className={linkClass}>{t("nav.docs")}</Link>
          <div className="flex-1" />
          <LangSwitcher />
          <Link href="/admin" className={linkClass}>{t("nav.admin")}</Link>
        </div>

        {/* Mobile right side */}
        <div className="flex-1 md:hidden" />
        <div className="md:hidden">
          <LangSwitcher />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1.5 rounded-md hover:bg-[var(--card)] transition-colors"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-3">
          <Link href="/" onClick={() => setOpen(false)} className={linkClass}>{t("nav.units")}</Link>
          <Link href="/convert" onClick={() => setOpen(false)} className={linkClass}>{t("nav.convert")}</Link>
          <Link href="/contribute" onClick={() => setOpen(false)} className={linkClass}>{t("nav.contribute")}</Link>
          <Link href="/docs" onClick={() => setOpen(false)} className={linkClass}>{t("nav.docs")}</Link>
          <Link href="/admin" onClick={() => setOpen(false)} className={linkClass}>{t("nav.admin")}</Link>
        </div>
      )}
    </nav>
  );
}
