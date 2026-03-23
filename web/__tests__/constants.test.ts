import { API_BASE, SITE_URL, STATES } from "@/lib/constants";

describe("constants", () => {
  test("API_BASE defaults to /api/v1", () => {
    expect(API_BASE).toBe("/api/v1");
  });

  test("SITE_URL defaults to hortiprise domain", () => {
    expect(SITE_URL).toBe("https://unitatlas.hortiprise.com");
  });

  test("STATES has 20 entries", () => {
    expect(STATES).toHaveLength(20);
  });

  test("STATES contains key states", () => {
    expect(STATES).toContain("UP");
    expect(STATES).toContain("Bihar");
    expect(STATES).toContain("TamilNadu");
    expect(STATES).toContain("Kerala");
    expect(STATES).toContain("Punjab");
    expect(STATES).toContain("Maharashtra");
  });

  test("STATES has no empty string", () => {
    expect(STATES).not.toContain("");
  });

  test("STATES has no duplicates", () => {
    const unique = new Set(STATES);
    expect(unique.size).toBe(STATES.length);
  });
});
