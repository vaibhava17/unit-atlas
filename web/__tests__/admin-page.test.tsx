import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "@/app/admin/page";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("AdminPage — login", () => {
  test("renders login form initially", () => {
    render(<AdminPage />);
    expect(screen.getByText("admin.title")).toBeInTheDocument();
    expect(screen.getByText("admin.apiKey")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "admin.login" })).toBeInTheDocument();
  });

  test("has password input", () => {
    render(<AdminPage />);
    const pwInput = document.querySelector('input[type="password"]');
    expect(pwInput).toBeInTheDocument();
  });
});

describe("AdminPage — authed", () => {
  async function loginAndRender(contributions: unknown[] = []) {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => contributions,
    });

    const user = userEvent.setup();
    render(<AdminPage />);

    const pwInput = document.querySelector('input[type="password"]')!;
    await user.type(pwInput, "test-key");
    await user.click(screen.getByRole("button", { name: "admin.login" }));

    return user;
  }

  test("shows admin panel after login", async () => {
    await loginAndRender();

    await waitFor(() => {
      expect(screen.getByText("admin.mainTitle")).toBeInTheDocument();
    });
  });

  test("shows tabs: pending, approved, rejected", async () => {
    await loginAndRender();

    await waitFor(() => {
      expect(screen.getByText("admin.pending")).toBeInTheDocument();
      expect(screen.getByText("admin.approved")).toBeInTheDocument();
      expect(screen.getByText("admin.rejected")).toBeInTheDocument();
    });
  });

  test("shows empty message when no contributions", async () => {
    await loginAndRender([]);

    await waitFor(() => {
      expect(screen.getByText(/admin.empty/)).toBeInTheDocument();
    });
  });

  test("fetches contributions with api key header", async () => {
    await loginAndRender();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/contributions?status=pending"),
        expect.objectContaining({
          headers: { "X-Admin-Key": "test-key" },
        })
      );
    });
  });

  test("shows contributions list", async () => {
    const contributions = [
      {
        id: "1",
        unit_name: "testunit",
        country: "IN",
        state: "UP",
        region: null,
        conversion_factor: 5000,
        aliases: [],
        source: null,
        notes: null,
        status: "pending",
        votes: 0,
        submitted_at: "2026-01-01T00:00:00Z",
        reviewed_at: null,
      },
    ];

    await loginAndRender(contributions);

    await waitFor(() => {
      expect(screen.getByText("testunit")).toBeInTheDocument();
      expect(screen.getByText(/5,000/)).toBeInTheDocument();
    });
  });

  test("shows approve/reject buttons for pending tab", async () => {
    const contributions = [
      {
        id: "1",
        unit_name: "testunit",
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
      },
    ];

    await loginAndRender(contributions);

    await waitFor(() => {
      expect(screen.getByText("admin.approve")).toBeInTheDocument();
      expect(screen.getByText("admin.reject")).toBeInTheDocument();
    });
  });

  test("logout returns to login screen", async () => {
    const user = await loginAndRender();

    await waitFor(() => {
      expect(screen.getByText("admin.logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("admin.logout"));
    expect(screen.getByText("admin.title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "admin.login" })).toBeInTheDocument();
  });
});
