"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitContribution } from "@/lib/api";
import { STATES } from "@/lib/constants";

export default function ContributePage() {
  const { t } = useTranslation();
  const [unitName, setUnitName] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [factor, setFactor] = useState("");
  const [aliases, setAliases] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await submitContribution({
        unit_name: unitName,
        country: "IN",
        state: state || undefined,
        region: region || undefined,
        conversion_factor: parseFloat(factor),
        aliases: aliases
          ? aliases.split(",").map((a) => a.trim()).filter(Boolean)
          : undefined,
        source: source || undefined,
        notes: notes || undefined,
      });
      setSuccess(
        t("contribute.success", {
          unit: res.unit_name,
          factor: res.conversion_factor,
        })
      );
      setUnitName("");
      setFactor("");
      setAliases("");
      setSource("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-1">{t("contribute.title")}</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        {t("contribute.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            {t("contribute.unitName")}
          </label>
          <input
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder={t("contribute.unitNamePlaceholder")}
            className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("contribute.state")}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">{t("contribute.stateSelect")}</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("contribute.region")}
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder={t("contribute.regionPlaceholder")}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            {t("contribute.sqftValue")}
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            placeholder={t("contribute.sqftPlaceholder")}
            className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            {t("contribute.aliases")}
          </label>
          <input
            type="text"
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            placeholder={t("contribute.aliasesPlaceholder")}
            className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            {t("contribute.source")}
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={t("contribute.sourcePlaceholder")}
            className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            {t("contribute.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("contribute.notesPlaceholder")}
            rows={3}
            className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? t("contribute.loading") : t("contribute.button")}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 rounded-md bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
