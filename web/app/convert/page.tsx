"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { convertUnits, ConvertResponse } from "@/lib/api";
import { STATES } from "@/lib/constants";

export default function ConvertPage() {
  const { t } = useTranslation();
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("bigha");
  const [toUnit, setToUnit] = useState("acre");
  const [state, setState] = useState("UP");
  const [region, setRegion] = useState("");
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await convertUnits({
        value: parseFloat(value),
        from_unit: fromUnit,
        to_unit: toUnit,
        country: "IN",
        state: state || undefined,
        region: region || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-1">{t("convert.title")}</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        {t("convert.subtitle")}
      </p>

      <form onSubmit={handleConvert} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("convert.value")}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("convert.state")}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">{t("convert.any")}</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("convert.from")}
            </label>
            <input
              type="text"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              placeholder={t("convert.fromPlaceholder")}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("convert.to")}
            </label>
            <input
              type="text"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              placeholder={t("convert.toPlaceholder")}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
        </div>

        {(state === "UP" || state === "MadhyaPradesh") && (
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("convert.region")}
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder={t("convert.regionPlaceholder")}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? t("convert.loading") : t("convert.button")}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <div className="text-center">
            <span className="text-3xl font-bold font-mono">
              {result.result.toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })}
            </span>
            <span className="text-lg text-[var(--muted)] ml-2">
              {result.to_unit}
            </span>
          </div>
          <p className="text-center text-sm text-[var(--muted)] mt-2">
            {result.value} {result.from_unit} = {result.result.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
            {result.to_unit}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-6 mt-3 text-xs text-[var(--muted)]">
            <span>
              1 {result.from_unit} = {result.from_factor.toLocaleString()} {t("convert.sqft")}
            </span>
            <span>
              1 {result.to_unit} = {result.to_factor.toLocaleString()} {t("convert.sqft")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
