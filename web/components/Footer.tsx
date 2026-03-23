"use client";

import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--border)] px-4 sm:px-6 py-4 text-center text-xs text-[var(--muted)] space-y-1">
      <p>{t("footer.tagline")}</p>
      <p>
        {t("footer.managed")}{" "}
        <a
          href="https://github.com/vaibhava17"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--foreground)] hover:underline"
        >
          vaibhava17
        </a>
        {" · "}
        <a
          href="mailto:iamvaibhav.agarwal@gmail.com"
          className="text-[var(--foreground)] hover:underline"
        >
          iamvaibhav.agarwal@gmail.com
        </a>
      </p>
    </footer>
  );
}
