const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface UnitData {
  name: string;
  category: string;
  base_unit: string;
  country: string | null;
  state: string | null;
  region: string | null;
  conversion_factor: number;
  aliases: string[];
  confidence: string | null;
  relation: { parent: string; ratio: string } | null;
  variants: { value: number; confidence: string | null }[];
}

export interface ConvertResponse {
  value: number;
  from_unit: string;
  to_unit: string;
  result: number;
  from_factor: number;
  to_factor: number;
}

export interface ContributionResponse {
  id: string;
  unit_name: string;
  country: string | null;
  state: string | null;
  region: string | null;
  conversion_factor: number;
  aliases: string[];
  source: string | null;
  notes: string | null;
  status: string;
  votes: number;
  submitted_at: string;
  reviewed_at: string | null;
}

export async function fetchUnits(params: {
  country?: string;
  state?: string;
  region?: string;
}): Promise<UnitData[]> {
  const sp = new URLSearchParams();
  if (params.country) sp.set("country", params.country);
  if (params.state) sp.set("state", params.state);
  if (params.region) sp.set("region", params.region);
  const res = await fetch(`${API_BASE}/units?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch units");
  return res.json();
}

export async function convertUnits(body: {
  value: number;
  from_unit: string;
  to_unit: string;
  country?: string;
  state?: string;
  region?: string;
}): Promise<ConvertResponse> {
  const res = await fetch(`${API_BASE}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Conversion failed");
  }
  return res.json();
}

export async function submitContribution(body: {
  unit_name: string;
  country: string;
  state?: string;
  region?: string;
  conversion_factor: number;
  aliases?: string[];
  source?: string;
  notes?: string;
}): Promise<ContributionResponse> {
  const res = await fetch(`${API_BASE}/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Submission failed");
  }
  return res.json();
}
