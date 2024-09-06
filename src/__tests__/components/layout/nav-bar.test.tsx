import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NavBar from "@/components/layout/nav-bar";
import { useUser } from "@auth0/nextjs-auth0/client";

vi.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/util/hooks", () => ({
  useViewportWidth: vi.fn(() => 1024), // Mocking a desktop viewport
}));

describe("NavBar", () => {
  it("renders the navbar content when user is not logged in", () => {
    (useUser as any).mockReturnValue({
      user: null,
      error: null,
      isLoading: false,
    });

    render(<NavBar />);

    expect(screen.getByText("ResumeBuilder")).toBeInTheDocument();
    expect(
      screen.getByText("Professional Resume Templates")
    ).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders the navbar content when user is logged in", () => {
    (useUser as any).mockReturnValue({
      user: { picture: "https://example.com/avatar.jpg" },
      error: null,
      isLoading: false,
    });

    render(<NavBar />);

    expect(screen.getByText("ResumeBuilder")).toBeInTheDocument();
    expect(
      screen.getByText("Professional Resume Templates")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Write Content")).toBeInTheDocument();
    expect(screen.getByLabelText("User menu")).toBeInTheDocument();
    expect(screen.getByAltText("profile")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    (useUser as any).mockReturnValue({
      user: null,
      error: null,
      isLoading: true,
    });

    render(<NavBar />);

    expect(screen.getByTestId("full-page-loader")).toBeInTheDocument();
  });

  it("renders error state", () => {
    (useUser as any).mockReturnValue({
      user: null,
      error: new Error("Test error"),
      isLoading: false,
    });

    render(<NavBar />);

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });
});
