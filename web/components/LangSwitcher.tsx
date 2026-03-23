"use client";

import { useTranslation } from "react-i18next";

const LANGS = [
  "en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "od", "as",
] as const;

export default function LangSwitcher() {
  const { t, i18n } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  }

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="border border-[var(--border)] rounded-md px-2 py-1 text-xs bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
    >
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {t(`lang.${l}`)}
        </option>
      ))}
    </select>
  );
}
