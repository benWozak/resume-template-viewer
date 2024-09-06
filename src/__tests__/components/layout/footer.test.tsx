import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/footer";

describe("Footer", () => {
  it("renders the footer content", () => {
    render(<Footer />);

    expect(screen.getByText(/Ben Wozak/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /logo/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Developing elegant user experiences/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Find me on")).toBeInTheDocument();

    expect(screen.getByLabelText("LinkedIn")).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/ben-wozak/"
    );
    expect(screen.getByLabelText("GitHub")).toHaveAttribute(
      "href",
      "https://github.com/benWozak/"
    );
    expect(screen.getByLabelText("Portfolio")).toHaveAttribute(
      "href",
      "https://benwozak.netlify.app/"
    );
  });
});
