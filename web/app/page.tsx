"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchUnits, UnitData } from "@/lib/api";
import { STATES } from "@/lib/constants";

export default function UnitsPage() {
  const { t } = useTranslation();
  const [country] = useState("IN");
  const [state, setState] = useState("");
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUnits({ country, state: state || undefined })
      .then(setUnits)
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, [country, state]);

  const localUnits = units.filter((u) => u.country);
  const globalUnits = units.filter((u) => !u.country);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-1">{t("units.title")}</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        {t("units.subtitle")}
      </p>

      <div className="flex gap-3 mb-6">
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">{t("units.allStates")}</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--muted)] text-sm">{t("units.loading")}</p>
      ) : (
        <>
          {localUnits.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
                {state
                  ? t("units.localHeading", { state, count: localUnits.length })
                  : t("units.allLocalHeading", { count: localUnits.length })}
              </h2>
              <div className="grid gap-3">
                {localUnits.map((u, i) => (
                  <UnitCard key={`${u.name}-${u.region}-${i}`} unit={u} />
                ))}
              </div>
            </section>
          )}

          {globalUnits.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
                {t("units.globalHeading", { count: globalUnits.length })}
              </h2>
              <div className="grid gap-3">
                {globalUnits.map((u, i) => (
                  <UnitCard key={`${u.name}-g-${i}`} unit={u} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function UnitCard({ unit }: { unit: UnitData }) {
  const { t } = useTranslation();

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{unit.name}</span>
          {unit.region && (
            <span className="text-xs bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-full">
              {unit.region}
            </span>
          )}
          {unit.confidence && (
            <span className="text-xs text-[var(--muted)]">
              {unit.confidence}
            </span>
          )}
        </div>
        {unit.aliases.length > 0 && (
          <p className="text-xs text-[var(--muted)] mt-1">
            {t("units.aka")} {unit.aliases.join(", ")}
          </p>
        )}
        {unit.relation && (
          <p className="text-xs text-[var(--muted)] mt-1">
            {unit.relation.ratio} {t("units.of")} {unit.relation.parent}
          </p>
        )}
        {unit.state && (
          <p className="text-xs text-[var(--muted)] mt-1">{unit.state}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <span className="font-mono text-sm font-medium">
          {unit.conversion_factor.toLocaleString()}
        </span>
        <span className="text-xs text-[var(--muted)] ml-1">
          {t("units.sqft")}
        </span>
      </div>
    </div>
  );
}
