import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavBar from "@/components/NavBar";

describe("NavBar", () => {
  test("renders brand", () => {
    render(<NavBar />);
    expect(screen.getByText("nav.brand")).toBeInTheDocument();
  });

  test("renders desktop nav links", () => {
    render(<NavBar />);
    expect(screen.getByText("nav.units")).toBeInTheDocument();
    expect(screen.getByText("nav.convert")).toBeInTheDocument();
    expect(screen.getByText("nav.contribute")).toBeInTheDocument();
    expect(screen.getByText("nav.docs")).toBeInTheDocument();
  });

  test("has hamburger button for mobile", () => {
    render(<NavBar />);
    const menuBtn = screen.getByLabelText("Toggle menu");
    expect(menuBtn).toBeInTheDocument();
  });

  test("toggles mobile menu on click", async () => {
    const user = userEvent.setup();
    render(<NavBar />);

    const menuBtn = screen.getByLabelText("Toggle menu");
    // Mobile menu not visible initially
    const mobileLinks = screen.queryAllByText("nav.admin");
    // admin link appears in both desktop and will appear in mobile after toggle

    await user.click(menuBtn);
    // After click, mobile menu should be visible
    const adminLinks = screen.getAllByText("nav.admin");
    expect(adminLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
  });

  test("has language switcher", () => {
    render(<NavBar />);
    // LangSwitcher renders a select — check for at least one combobox
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });
});
