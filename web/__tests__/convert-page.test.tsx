import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConvertPage from "@/app/convert/page";

const mockConvert = jest.fn();
jest.mock("@/lib/api", () => ({
  convertUnits: (...args: unknown[]) => mockConvert(...args),
}));

beforeEach(() => {
  mockConvert.mockReset();
});

describe("ConvertPage", () => {
  test("renders title and form fields", () => {
    render(<ConvertPage />);
    expect(screen.getByText("convert.title")).toBeInTheDocument();
    expect(screen.getByText("convert.subtitle")).toBeInTheDocument();
    expect(screen.getByText("convert.value")).toBeInTheDocument();
    expect(screen.getByText("convert.from")).toBeInTheDocument();
    expect(screen.getByText("convert.to")).toBeInTheDocument();
    expect(screen.getByText("convert.state")).toBeInTheDocument();
  });

  test("has convert button", () => {
    render(<ConvertPage />);
    expect(screen.getByRole("button", { name: "convert.button" })).toBeInTheDocument();
  });

  test("state dropdown has Any + 20 states", () => {
    render(<ConvertPage />);
    const selects = screen.getAllByRole("combobox");
    const stateSelect = selects[0];
    const options = stateSelect.querySelectorAll("option");
    expect(options.length).toBe(21);
    expect(options[0].textContent).toBe("convert.any");
  });

  test("shows region field when UP selected", () => {
    render(<ConvertPage />);
    // Default state is UP, so region should show
    expect(screen.getByText("convert.region")).toBeInTheDocument();
  });

  test("submits conversion and shows result", async () => {
    const user = userEvent.setup();
    mockConvert.mockResolvedValueOnce({
      value: 1,
      from_unit: "bigha",
      to_unit: "acre",
      result: 0.619835,
      from_factor: 27000,
      to_factor: 43560,
    });

    render(<ConvertPage />);
    await user.click(screen.getByRole("button", { name: "convert.button" }));

    await waitFor(() => {
      // Result appears multiple times (big number + summary line)
      const matches = screen.getAllByText(/0.619835/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  test("shows error on failed conversion", async () => {
    const user = userEvent.setup();
    mockConvert.mockRejectedValueOnce(new Error("Unit not found"));

    render(<ConvertPage />);
    await user.click(screen.getByRole("button", { name: "convert.button" }));

    await waitFor(() => {
      expect(screen.getByText("Unit not found")).toBeInTheDocument();
    });
  });
});
