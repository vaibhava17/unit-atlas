import { fetchUnits, convertUnits, submitContribution } from "@/lib/api";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchUnits", () => {
  test("calls /units with query params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "bigha" }],
    });

    const result = await fetchUnits({ country: "IN", state: "UP" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/units?");
    expect(url).toContain("country=IN");
    expect(url).toContain("state=UP");
    expect(result).toEqual([{ name: "bigha" }]);
  });

  test("omits empty params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchUnits({});
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/v1/units?");
  });

  test("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchUnits({ country: "IN" })).rejects.toThrow("Failed to fetch units");
  });
});

describe("convertUnits", () => {
  test("posts conversion request", async () => {
    const mockResponse = {
      value: 1,
      from_unit: "bigha",
      to_unit: "acre",
      result: 0.619835,
      from_factor: 27000,
      to_factor: 43560,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await convertUnits({
      value: 1,
      from_unit: "bigha",
      to_unit: "acre",
      country: "IN",
      state: "UP",
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: 1,
        from_unit: "bigha",
        to_unit: "acre",
        country: "IN",
        state: "UP",
      }),
    });
    expect(result).toEqual(mockResponse);
  });

  test("throws with detail on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Unit 'xyz' not found" }),
    });

    await expect(
      convertUnits({ value: 1, from_unit: "xyz", to_unit: "acre" })
    ).rejects.toThrow("Unit 'xyz' not found");
  });
});

describe("submitContribution", () => {
  test("posts contribution", async () => {
    const mockResponse = {
      id: "abc123",
      unit_name: "test",
      country: "IN",
      state: null,
      region: null,
      conversion_factor: 1000,
      aliases: [],
      source: null,
      notes: null,
      status: "pending",
      votes: 0,
      submitted_at: "2026-01-01T00:00:00Z",
      reviewed_at: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await submitContribution({
      unit_name: "test",
      country: "IN",
      conversion_factor: 1000,
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });
    expect(result.status).toBe("pending");
  });

  test("throws with detail on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Duplicate submission" }),
    });

    await expect(
      submitContribution({ unit_name: "test", country: "IN", conversion_factor: 1000 })
    ).rejects.toThrow("Duplicate submission");
  });
});
