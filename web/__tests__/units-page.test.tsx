import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnitsPage from "@/app/page";

const mockFetchUnits = jest.fn();
jest.mock("@/lib/api", () => ({
  fetchUnits: (...args: unknown[]) => mockFetchUnits(...args),
}));

const mockUnits = [
  {
    name: "bigha",
    category: "area",
    base_unit: "sqft",
    country: "IN",
    state: "UP",
    region: "west",
    conversion_factor: 27000,
    aliases: ["biga", "beegha"],
    confidence: "high",
    relation: null,
    variants: [],
  },
  {
    name: "acre",
    category: "area",
    base_unit: "sqft",
    country: null,
    state: null,
    region: null,
    conversion_factor: 43560,
    aliases: [],
    confidence: null,
    relation: null,
    variants: [],
  },
];

beforeEach(() => {
  mockFetchUnits.mockReset();
  mockFetchUnits.mockResolvedValue(mockUnits);
});

describe("UnitsPage", () => {
  test("renders title and subtitle", async () => {
    render(<UnitsPage />);
    expect(screen.getByText("units.title")).toBeInTheDocument();
    expect(screen.getByText("units.subtitle")).toBeInTheDocument();
  });

  test("shows loading then units", async () => {
    render(<UnitsPage />);
    expect(screen.getByText("units.loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("bigha")).toBeInTheDocument();
    });
    expect(screen.getByText("acre")).toBeInTheDocument();
  });

  test("renders state dropdown with all states", async () => {
    render(<UnitsPage />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    // "All States" option + 20 states
    const options = select.querySelectorAll("option");
    expect(options.length).toBe(21);
  });

  test("shows aliases for units with aliases", async () => {
    render(<UnitsPage />);
    await waitFor(() => {
      expect(screen.getByText(/biga, beegha/)).toBeInTheDocument();
    });
  });

  test("shows region tag", async () => {
    render(<UnitsPage />);
    await waitFor(() => {
      expect(screen.getByText("west")).toBeInTheDocument();
    });
  });

  test("separates local and global units", async () => {
    render(<UnitsPage />);
    await waitFor(() => {
      expect(screen.getByText(/units.allLocalHeading/)).toBeInTheDocument();
      expect(screen.getByText(/units.globalHeading/)).toBeInTheDocument();
    });
  });

  test("filters by state on select change", async () => {
    const user = userEvent.setup();
    render(<UnitsPage />);

    await waitFor(() => {
      expect(screen.getByText("bigha")).toBeInTheDocument();
    });

    mockFetchUnits.mockResolvedValueOnce([mockUnits[0]]);
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "UP");

    await waitFor(() => {
      expect(mockFetchUnits).toHaveBeenCalledWith({ country: "IN", state: "UP" });
    });
  });

  test("handles fetch error gracefully", async () => {
    mockFetchUnits.mockRejectedValueOnce(new Error("Network error"));
    render(<UnitsPage />);

    await waitFor(() => {
      // Should not crash, units array empty
      expect(screen.queryByText("bigha")).not.toBeInTheDocument();
    });
  });
});
