import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  test("renders tagline", () => {
    render(<Footer />);
    expect(screen.getByText("footer.tagline")).toBeInTheDocument();
  });

  test("renders managed by text", () => {
    render(<Footer />);
    expect(screen.getByText(/footer.managed/)).toBeInTheDocument();
  });

  test("has vaibhava17 github link", () => {
    render(<Footer />);
    const link = screen.getByText("vaibhava17");
    expect(link).toHaveAttribute("href", "https://github.com/vaibhava17");
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("has email link", () => {
    render(<Footer />);
    const link = screen.getByText("iamvaibhav.agarwal@gmail.com");
    expect(link).toHaveAttribute("href", "mailto:iamvaibhav.agarwal@gmail.com");
  });
});
