import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocsPage from "@/app/docs/page";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe("DocsPage", () => {
  test("renders sidebar with endpoints", () => {
    render(<DocsPage />);
    // Both sidebar and mobile dropdown exist, so multiple matches expected
    expect(screen.getAllByText("List Units").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Get Unit").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Fallback Logic").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Error Codes").length).toBeGreaterThanOrEqual(1);
  });

  test("shows GET /units doc by default", () => {
    render(<DocsPage />);
    expect(screen.getByText("/api/v1/units")).toBeInTheDocument();
    expect(screen.getByText("Try it")).toBeInTheDocument();
  });

  test("switches to Get Unit doc via sidebar", async () => {
    const user = userEvent.setup();
    render(<DocsPage />);

    // Click sidebar button (role=button), not the option
    const buttons = screen.getAllByText("Get Unit");
    const sidebarButton = buttons.find((el) => el.tagName === "BUTTON");
    await user.click(sidebarButton!);
    expect(screen.getByText("/api/v1/unit/{name}")).toBeInTheDocument();
  });

  test("switches to Convert doc", async () => {
    const user = userEvent.setup();
    render(<DocsPage />);

    const buttons = screen.getAllByText("Convert");
    const sidebarButton = buttons.find((el) => el.tagName === "BUTTON");
    await user.click(sidebarButton!);
    // DocHeader renders method badge + code path
    const pathElements = screen.getAllByText("/api/v1/convert");
    expect(pathElements.length).toBeGreaterThanOrEqual(1);
  });

  test("switches to Fallback Logic", async () => {
    const user = userEvent.setup();
    render(<DocsPage />);

    const buttons = screen.getAllByText("Fallback Logic");
    const sidebarButton = buttons.find((el) => el.tagName === "BUTTON");
    await user.click(sidebarButton!);
    expect(screen.getByText("Fallback Resolution")).toBeInTheDocument();
  });

  test("switches to Error Codes", async () => {
    const user = userEvent.setup();
    render(<DocsPage />);

    const buttons = screen.getAllByText("Error Codes");
    const sidebarButton = buttons.find((el) => el.tagName === "BUTTON");
    await user.click(sidebarButton!);
    expect(screen.getByText("400")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("422")).toBeInTheDocument();
  });

  test("has Send Request button in playground", () => {
    render(<DocsPage />);
    expect(screen.getByText("Send Request")).toBeInTheDocument();
  });

  test("playground makes API call on send", async () => {
    const user = userEvent.setup();
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ name: "bigha" }],
    });
    global.fetch = mockFetch;

    render(<DocsPage />);
    await user.click(screen.getByText("Send Request"));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/units?")
    );
  });
});
