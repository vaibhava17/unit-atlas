"use client";

import { useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const STATES = [
  "", "UP", "Bihar", "Jharkhand", "Punjab", "Haryana", "HimachalPradesh",
  "Uttarakhand", "Rajasthan", "Maharashtra", "Gujarat", "TamilNadu",
  "Kerala", "Karnataka", "AndhraPradesh", "Telangana", "WestBengal",
  "Tripura", "Assam", "MadhyaPradesh", "Chhattisgarh",
];

const ENDPOINTS = [
  { id: "get-units", label: "List Units", method: "GET" },
  { id: "get-unit", label: "Get Unit", method: "GET" },
  { id: "convert", label: "Convert", method: "POST" },
  { id: "fallback", label: "Fallback Logic", method: null },
  { id: "errors", label: "Error Codes", method: null },
] as const;

type EndpointId = (typeof ENDPOINTS)[number]["id"];

export default function DocsPage() {
  const [active, setActive] = useState<EndpointId>("get-units");

  return (
    <div className="flex min-h-[calc(100vh-7rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[var(--border)] py-6 px-4 hidden md:block">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3 px-2">
          Endpoints
        </p>
        <nav className="space-y-0.5">
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setActive(ep.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                active === ep.id
                  ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              }`}
            >
              {ep.method && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    ep.method === "GET"
                      ? "bg-green-600/15 text-green-600"
                      : "bg-blue-600/15 text-blue-600"
                  }`}
                >
                  {ep.method}
                </span>
              )}
              {ep.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile dropdown */}
      <div className="md:hidden w-full px-4 pt-4">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value as EndpointId)}
          className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] mb-4"
        >
          {ENDPOINTS.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {ep.method ? `${ep.method} ` : ""}{ep.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl px-6 py-6 md:px-10">
        {active === "get-units" && <GetUnitsDoc />}
        {active === "get-unit" && <GetUnitDoc />}
        {active === "convert" && <ConvertDoc />}
        {active === "fallback" && <FallbackDoc />}
        {active === "errors" && <ErrorsDoc />}
      </div>
    </div>
  );
}

/* ─── GET /units ─── */

function GetUnitsDoc() {
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("UP");
  const [region, setRegion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  async function run() {
    setLoading(true);
    setResult("");
    setStatus(null);
    const sp = new URLSearchParams();
    if (country) sp.set("country", country);
    if (state) sp.set("state", state);
    if (region) sp.set("region", region);
    try {
      const res = await fetch(`${API_BASE}/units?${sp.toString()}`);
      setStatus(res.status);
      setResult(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  const qs = buildQS({ country, state, region });

  return (
    <>
      <DocHeader method="GET" path="/api/v1/units" />
      <p className="text-sm text-[var(--muted)] mb-6">
        List units with geo-fallback resolution. Returns global + matching local units.
        No params returns all units.
      </p>

      <ParamsTable
        params={[
          { name: "country", type: "query", required: false, desc: "ISO country code (e.g. IN)" },
          { name: "state", type: "query", required: false, desc: "State key (e.g. UP, Bihar, TamilNadu)" },
          { name: "region", type: "query", required: false, desc: "Region within state. Requires state." },
        ]}
      />

      <ExampleBlock code={`curl "/api/v1/units?country=IN&state=UP"`} />

      <SampleResponse
        code={`[
  {
    "name": "bigha",
    "category": "area",
    "base_unit": "sqft",
    "country": "IN",
    "state": "UP",
    "region": "west",
    "conversion_factor": 27000,
    "aliases": ["biga", "beegha", "pucca bigha"],
    "confidence": "high",
    "relation": null,
    "variants": []
  }
]`}
      />

      {/* Playground */}
      <div className="mt-8 border border-[var(--accent)] rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold uppercase tracking-wide">
          Try it
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="country" value={country} onChange={setCountry} placeholder="IN" />
            <StateSelect value={state} onChange={setState} />
            <Input label="region" value={region} onChange={setRegion} placeholder="west" />
          </div>
          <UrlPreview method="GET" url={`/api/v1/units${qs ? `?${qs}` : ""}`} />
          <RunButton loading={loading} onClick={run} />
          <ResponseBlock status={status} body={result} />
        </div>
      </div>
    </>
  );
}

/* ─── GET /unit/{name} ─── */

function GetUnitDoc() {
  const [name, setName] = useState("bigha");
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("UP");
  const [region, setRegion] = useState("west");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  async function run() {
    setLoading(true);
    setResult("");
    setStatus(null);
    const sp = new URLSearchParams();
    if (country) sp.set("country", country);
    if (state) sp.set("state", state);
    if (region) sp.set("region", region);
    try {
      const res = await fetch(`${API_BASE}/unit/${encodeURIComponent(name)}?${sp.toString()}`);
      setStatus(res.status);
      setResult(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  const qs = buildQS({ country, state, region });

  return (
    <>
      <DocHeader method="GET" path="/api/v1/unit/{name}" />
      <p className="text-sm text-[var(--muted)] mb-6">
        Get a single unit by name or alias. Returns the most specific match for the given location.
        Supports alias lookup (e.g. &quot;gaj&quot; → sqyard, &quot;decimal&quot; → dismil).
      </p>

      <ParamsTable
        params={[
          { name: "name", type: "path", required: true, desc: "Unit name or alias (e.g. bigha, gaj, decimal)" },
          { name: "country", type: "query", required: false, desc: "ISO country code" },
          { name: "state", type: "query", required: false, desc: "State key" },
          { name: "region", type: "query", required: false, desc: "Region within state. Requires state." },
        ]}
      />

      <ExampleBlock code={`curl "/api/v1/unit/bigha?country=IN&state=UP&region=west"`} />

      <SampleResponse
        code={`{
  "name": "bigha",
  "category": "area",
  "base_unit": "sqft",
  "country": "IN",
  "state": "UP",
  "region": "west",
  "conversion_factor": 27000,
  "aliases": ["biga", "beegha", "pucca bigha"],
  "confidence": "high",
  "relation": null,
  "variants": []
}`}
      />

      <div className="mt-8 border border-[var(--accent)] rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold uppercase tracking-wide">
          Try it
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="name *" value={name} onChange={setName} placeholder="bigha" />
            <Input label="country" value={country} onChange={setCountry} placeholder="IN" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StateSelect value={state} onChange={setState} />
            <Input label="region" value={region} onChange={setRegion} placeholder="west" />
          </div>
          <UrlPreview method="GET" url={`/api/v1/unit/${name || "{name}"}${qs ? `?${qs}` : ""}`} />
          <RunButton loading={loading} onClick={run} />
          <ResponseBlock status={status} body={result} />
        </div>
      </div>
    </>
  );
}

/* ─── POST /convert ─── */

function ConvertDoc() {
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("bigha");
  const [toUnit, setToUnit] = useState("acre");
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("UP");
  const [region, setRegion] = useState("west");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const bodyObj: Record<string, unknown> = {
    value: parseFloat(value) || 0,
    from_unit: fromUnit,
    to_unit: toUnit,
  };
  if (country) bodyObj.country = country;
  if (state) bodyObj.state = state;
  if (region) bodyObj.region = region;

  async function run() {
    setLoading(true);
    setResult("");
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });
      setStatus(res.status);
      setResult(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DocHeader method="POST" path="/api/v1/convert" />
      <p className="text-sm text-[var(--muted)] mb-6">
        Convert a value between two units via sqft base.
        Formula: <code className="text-xs font-mono bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded">result = value × (from_factor / to_factor)</code>.
        Location params help resolve region-specific conversion factors.
      </p>

      <ParamsTable
        params={[
          { name: "value", type: "number", required: true, desc: "Value to convert (must be > 0)" },
          { name: "from_unit", type: "string", required: true, desc: "Source unit name or alias" },
          { name: "to_unit", type: "string", required: true, desc: "Target unit name or alias" },
          { name: "country", type: "string", required: false, desc: "ISO country code" },
          { name: "state", type: "string", required: false, desc: "State key" },
          { name: "region", type: "string", required: false, desc: "Region within state" },
        ]}
      />

      <ExampleBlock
        code={`curl -X POST "/api/v1/convert" \\
  -H "Content-Type: application/json" \\
  -d '{"value": 1, "from_unit": "bigha", "to_unit": "acre", "country": "IN", "state": "UP", "region": "west"}'`}
      />

      <SampleResponse
        code={`{
  "value": 1.0,
  "from_unit": "bigha",
  "to_unit": "acre",
  "result": 0.619835,
  "from_factor": 27000.0,
  "to_factor": 43560.0
}`}
      />

      <div className="mt-8 border border-[var(--accent)] rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold uppercase tracking-wide">
          Try it
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="value *" value={value} onChange={setValue} placeholder="1" />
            <Input label="from_unit *" value={fromUnit} onChange={setFromUnit} placeholder="bigha" />
            <Input label="to_unit *" value={toUnit} onChange={setToUnit} placeholder="acre" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="country" value={country} onChange={setCountry} placeholder="IN" />
            <StateSelect value={state} onChange={setState} />
            <Input label="region" value={region} onChange={setRegion} placeholder="west" />
          </div>
          <UrlPreview method="POST" url="/api/v1/convert" body={JSON.stringify(bodyObj, null, 2)} />
          <RunButton loading={loading} onClick={run} />
          <ResponseBlock status={status} body={result} />
        </div>
      </div>
    </>
  );
}

/* ─── FALLBACK LOGIC ─── */

function FallbackDoc() {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Fallback Resolution</h2>
      <p className="text-sm text-[var(--muted)] mb-4">
        When querying units, the API resolves from most specific to most general:
      </p>
      <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] space-y-3 mb-6">
        <Step n={1} title="Region" desc="Exact region match (e.g. UP → west)" />
        <Step n={2} title="State" desc="All units in state + all its regions" />
        <Step n={3} title="Country" desc="All units across all states and regions" />
        <Step n={4} title="Global" desc="Universal units (acre, sqft, hectare, sqyard, sqmeter)" />
      </div>
      <p className="text-sm text-[var(--muted)] mb-4">
        Global units are <strong>always</strong> included in every response.
        When a unit exists at multiple levels, the most specific version wins.
      </p>
      <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
        <p className="text-sm font-semibold mb-2">Example: bigha in UP</p>
        <div className="text-sm text-[var(--muted)] space-y-1 font-mono">
          <p>?state=UP          → returns both west (27000) and east (13600)</p>
          <p>?state=UP&region=west → returns only west (27000)</p>
          <p>?state=UP&region=east → returns only east (13600)</p>
        </div>
      </div>
    </>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[var(--muted)]">{desc}</p>
      </div>
    </div>
  );
}

/* ─── ERROR CODES ─── */

function ErrorsDoc() {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Error Codes</h2>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--card)] border-b border-[var(--border)]">
              <th className="text-left px-4 py-2 font-medium text-[var(--muted)]">Code</th>
              <th className="text-left px-4 py-2 font-medium text-[var(--muted)]">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <ErrorRow code={400} desc="Bad request — invalid params, region without state" />
            <ErrorRow code={404} desc="Unit not found" />
            <ErrorRow code={422} desc="Validation error — missing required fields, value out of range" />
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <p className="text-sm font-semibold mb-2">Error response format</p>
        <pre className="text-xs font-mono bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto">{`{
  "detail": "Unit 'xyz' not found"
}

// or validation errors:
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "value"],
      "msg": "Field required"
    }
  ]
}`}</pre>
      </div>
    </>
  );
}

function ErrorRow({ code, desc }: { code: number; desc: string }) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <td className="px-4 py-2">
        <code className="font-mono text-red-500 font-bold">{code}</code>
      </td>
      <td className="px-4 py-2 text-[var(--muted)]">{desc}</td>
    </tr>
  );
}

/* ─── SHARED COMPONENTS ─── */

function DocHeader({ method, path }: { method: string; path: string }) {
  const color = method === "GET" ? "bg-green-600" : "bg-blue-600";
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={`${color} text-white text-xs font-bold px-2 py-1 rounded`}>{method}</span>
      <code className="font-mono text-lg font-semibold">{path}</code>
    </div>
  );
}

function ParamsTable({
  params,
}: {
  params: { name: string; type: string; required: boolean; desc: string }[];
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
        Parameters
      </p>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--card)] border-b border-[var(--border)]">
              <th className="text-left px-3 py-2 font-medium text-[var(--muted)]">Name</th>
              <th className="text-left px-3 py-2 font-medium text-[var(--muted)]">Type</th>
              <th className="text-left px-3 py-2 font-medium text-[var(--muted)]">Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.name} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <code className="font-mono text-xs">{p.name}</code>
                  {p.required && <span className="text-red-500 ml-1 text-xs">*</span>}
                </td>
                <td className="px-3 py-2 text-xs text-[var(--muted)]">{p.type}</td>
                <td className="px-3 py-2 text-xs text-[var(--muted)]">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-md hover:bg-[var(--border)] transition-colors"
      title="Copy"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted)]">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function ExampleBlock({ code }: { code: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
        Example
      </p>
      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-lg">
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
        <pre className="text-xs font-mono p-4 pr-10 overflow-x-auto whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    </div>
  );
}

function SampleResponse({ code }: { code: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
        Response
      </p>
      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-lg">
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
        <pre className="text-xs font-mono p-4 pr-10 overflow-x-auto whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  );
}

function StateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">state</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        {STATES.map((s) => (
          <option key={s} value={s}>{s || "— Any —"}</option>
        ))}
      </select>
    </div>
  );
}

function UrlPreview({ method, url, body }: { method: string; url: string; body?: string }) {
  const color = method === "GET" ? "bg-green-600" : "bg-blue-600";
  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-[var(--background)] flex items-center gap-2">
        <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
          {method}
        </span>
        <code className="font-mono text-xs break-all text-[var(--muted)]">{url}</code>
      </div>
      {body && (
        <pre className="px-3 py-2 text-xs font-mono bg-[var(--card)] border-t border-[var(--border)] overflow-x-auto">
          {body}
        </pre>
      )}
    </div>
  );
}

function RunButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-[var(--accent)] text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? "Sending..." : "Send Request"}
    </button>
  );
}

function ResponseBlock({ status, body }: { status: number | null; body: string }) {
  if (!body) return null;
  const ok = status !== null && status >= 200 && status < 300;
  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-[var(--card)] border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--muted)]">Response</span>
        {status !== null && (
          <span className={`text-xs font-mono font-bold ${ok ? "text-green-500" : "text-red-500"}`}>
            {status}
          </span>
        )}
        <div className="flex-1" />
        <CopyButton text={body} />
      </div>
      <pre className="px-3 py-3 text-xs font-mono bg-[var(--background)] overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">
        {body}
      </pre>
    </div>
  );
}

function buildQS(params: Record<string, string>) {
  return Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
}
