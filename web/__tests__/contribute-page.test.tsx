import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContributePage from "@/app/contribute/page";

const mockSubmit = jest.fn();
jest.mock("@/lib/api", () => ({
  submitContribution: (...args: unknown[]) => mockSubmit(...args),
}));

beforeEach(() => {
  mockSubmit.mockReset();
});

describe("ContributePage", () => {
  test("renders title and form", () => {
    render(<ContributePage />);
    expect(screen.getByText("contribute.title")).toBeInTheDocument();
    expect(screen.getByText("contribute.subtitle")).toBeInTheDocument();
    expect(screen.getByText("contribute.unitName")).toBeInTheDocument();
    expect(screen.getByText("contribute.sqftValue")).toBeInTheDocument();
    expect(screen.getByText("contribute.aliases")).toBeInTheDocument();
    expect(screen.getByText("contribute.source")).toBeInTheDocument();
    expect(screen.getByText("contribute.notes")).toBeInTheDocument();
  });

  test("has submit button", () => {
    render(<ContributePage />);
    expect(screen.getByRole("button", { name: "contribute.button" })).toBeInTheDocument();
  });

  test("state dropdown has Select + 20 states", () => {
    render(<ContributePage />);
    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");
    expect(options.length).toBe(21);
    expect(options[0].textContent).toBe("contribute.stateSelect");
  });

  test("submits and shows success message", async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValueOnce({
      id: "abc",
      unit_name: "testunit",
      conversion_factor: 5000,
      status: "pending",
    });

    render(<ContributePage />);

    const nameInput = screen.getByPlaceholderText("contribute.unitNamePlaceholder");
    const sqftInput = screen.getByPlaceholderText("contribute.sqftPlaceholder");
    await user.type(nameInput, "testunit");
    await user.type(sqftInput, "5000");

    await user.click(screen.getByRole("button", { name: "contribute.button" }));

    await waitFor(() => {
      expect(screen.getByText(/contribute.success/)).toBeInTheDocument();
    });
  });

  test("shows error on failed submission", async () => {
    const user = userEvent.setup();
    mockSubmit.mockRejectedValueOnce(new Error("Duplicate submission"));

    render(<ContributePage />);

    const nameInput = screen.getByPlaceholderText("contribute.unitNamePlaceholder");
    const sqftInput = screen.getByPlaceholderText("contribute.sqftPlaceholder");
    await user.type(nameInput, "testunit");
    await user.type(sqftInput, "5000");

    await user.click(screen.getByRole("button", { name: "contribute.button" }));

    await waitFor(() => {
      expect(screen.getByText("Duplicate submission")).toBeInTheDocument();
    });
  });

  test("clears form after successful submission", async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValueOnce({
      id: "abc",
      unit_name: "testunit",
      conversion_factor: 5000,
      status: "pending",
    });

    render(<ContributePage />);

    const nameInput = screen.getByPlaceholderText("contribute.unitNamePlaceholder") as HTMLInputElement;
    const sqftInput = screen.getByPlaceholderText("contribute.sqftPlaceholder") as HTMLInputElement;
    await user.type(nameInput, "testunit");
    await user.type(sqftInput, "5000");
    await user.click(screen.getByRole("button", { name: "contribute.button" }));

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(sqftInput.value).toBe("");
    });
  });
});
