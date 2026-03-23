"use client";

import { useState } from "react";
import { convertUnits, ConvertResponse } from "@/lib/api";

const STATES = [
  "", "UP", "Bihar", "Jharkhand", "Punjab", "Haryana", "HimachalPradesh",
  "Uttarakhand", "Rajasthan", "Maharashtra", "Gujarat", "TamilNadu",
  "Kerala", "Karnataka", "AndhraPradesh", "Telangana", "WestBengal",
  "Tripura", "Assam", "MadhyaPradesh", "Chhattisgarh",
];

export default function ConvertPage() {
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
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Convert</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Convert between land measurement units
      </p>

      <form onSubmit={handleConvert} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              Value
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
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s || "Any"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              From
            </label>
            <input
              type="text"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              placeholder="e.g. bigha"
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              To
            </label>
            <input
              type="text"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              placeholder="e.g. acre"
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
        </div>

        {(state === "UP" || state === "MadhyaPradesh") && (
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              Region (optional)
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. west, east"
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Converting..." : "Convert"}
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
          <div className="flex justify-center gap-6 mt-3 text-xs text-[var(--muted)]">
            <span>
              1 {result.from_unit} = {result.from_factor.toLocaleString()} sqft
            </span>
            <span>
              1 {result.to_unit} = {result.to_factor.toLocaleString()} sqft
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
