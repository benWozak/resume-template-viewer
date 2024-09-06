import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "@/components/resume/card";

// Mock Next.js Link component
vi.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) => <a href={href}>{children}</a>,
  };
});

describe("Card", () => {
  const mockTemplate = {
    id: 1,
    name: "Resume v1",
    slug: "test-template",
    description: "This is a test template description",
  };

  it("renders the card with correct content", () => {
    render(<Card template={mockTemplate} />);

    const image = screen.getByAltText("Resume v1 Template") as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain("test-template_demo.webp");

    // Renders title
    expect(screen.getByText("Resume v1")).toBeInTheDocument();

    // Renders badge
    expect(screen.getByText("NEW")).toBeInTheDocument();

    // Renders description
    expect(
      screen.getByText("This is a test template description")
    ).toBeInTheDocument();

    // renders link
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test-template");
  });
});
