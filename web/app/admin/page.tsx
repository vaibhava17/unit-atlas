"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ContributionResponse } from "@/lib/api";
import { API_BASE } from "@/lib/constants";

export default function AdminPage() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [contributions, setContributions] = useState<ContributionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchContributions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/admin/contributions?status=${tab}`,
        { headers: { "X-Admin-Key": apiKey } }
      );
      if (res.status === 401) {
        setAuthed(false);
        setError("Invalid API key");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      setContributions(await res.json());
    } catch {
      setError(t("admin.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [apiKey, tab, t]);

  useEffect(() => {
    if (authed) fetchContributions();
  }, [authed, tab, fetchContributions]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionMsg("");
    try {
      const res = await fetch(`${API_BASE}/admin/${action}/${id}`, {
        method: "POST",
        headers: { "X-Admin-Key": apiKey },
      });
      if (!res.ok) {
        const err = await res.json();
        setActionMsg(err.detail || t("admin.actionFailed"));
        return;
      }
      const doc: ContributionResponse = await res.json();
      setActionMsg(`${doc.unit_name} → ${doc.status}`);
      fetchContributions();
    } catch {
      setActionMsg(t("admin.actionFailed"));
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthed(true);
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-2xl font-bold mb-6">{t("admin.title")}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">
              {t("admin.apiKey")}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-[var(--accent)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("admin.login")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("admin.mainTitle")}</h1>
        <button
          onClick={() => { setAuthed(false); setApiKey(""); }}
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {t("admin.logout")}
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
        {(["pending", "approved", "rejected"] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === tb
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t(`admin.${tb}`)}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 rounded-md bg-[var(--accent-light)] text-sm">
          {actionMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">{t("admin.loading")}</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : contributions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {t("admin.empty", { status: t(`admin.${tab}`) })}
        </p>
      ) : (
        <div className="space-y-3">
          {contributions.map((c) => (
            <div
              key={c.id}
              className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{c.unit_name}</span>
                    <span className="font-mono text-sm">
                      {c.conversion_factor.toLocaleString()} {t("admin.sqft")}
                    </span>
                    {c.region && (
                      <span className="text-xs bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-full">
                        {c.region}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 space-x-3">
                    {c.state && <span>{c.state}</span>}
                    {c.country && <span>{c.country}</span>}
                    {c.source && <span>{t("admin.src")} {c.source}</span>}
                  </div>
                  {c.notes && (
                    <p className="text-xs text-[var(--muted)] mt-1 italic">
                      {c.notes}
                    </p>
                  )}
                  {c.aliases.length > 0 && (
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {t("admin.aliases")} {c.aliases.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {new Date(c.submitted_at).toLocaleString()}
                    {c.reviewed_at && (
                      <span>
                        {" "}· {t("admin.reviewed")} {new Date(c.reviewed_at).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                {tab === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(c.id, "approve")}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      {t("admin.approve")}
                    </button>
                    <button
                      onClick={() => handleAction(c.id, "reject")}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      {t("admin.reject")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
