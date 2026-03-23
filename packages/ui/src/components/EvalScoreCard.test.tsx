import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { EvalScoreCard } from "./EvalScoreCard";

describe("EvalScoreCard — score display", () => {
  test("renders the score value", () => {
    render(<EvalScoreCard score={75} label="Accuracy" />);
    expect(screen.getByText("75")).not.toBeNull();
  });

  test("renders the /100 suffix", () => {
    render(<EvalScoreCard score={75} label="Accuracy" />);
    expect(screen.getByText("/100")).not.toBeNull();
  });

  test("renders the label text", () => {
    render(<EvalScoreCard score={75} label="Accuracy" />);
    expect(screen.getByText("Accuracy")).not.toBeNull();
  });

  test("applies green color class for score >= 80", () => {
    const { container } = render(<EvalScoreCard score={85} label="High" />);
    expect(container.querySelector(".text-green-400")).not.toBeNull();
  });

  test("applies amber color class for score >= 50 and < 80", () => {
    const { container } = render(<EvalScoreCard score={65} label="Mid" />);
    expect(container.querySelector(".text-amber-400")).not.toBeNull();
  });

  test("applies red color class for score < 50", () => {
    const { container } = render(<EvalScoreCard score={30} label="Low" />);
    expect(container.querySelector(".text-red-400")).not.toBeNull();
  });
});

describe("EvalScoreCard — trend arrow", () => {
  test("shows positive delta value when score increased", () => {
    render(<EvalScoreCard score={80} previousScore={70} label="Score" />);
    expect(screen.getByText("+10")).not.toBeNull();
  });

  test("shows negative delta value when score decreased", () => {
    render(<EvalScoreCard score={60} previousScore={75} label="Score" />);
    expect(screen.getByText("-15")).not.toBeNull();
  });

  test("does not render delta text when change is less than 1 point", () => {
    const { queryByText } = render(
      <EvalScoreCard score={70} previousScore={70} label="Score" />,
    );
    expect(queryByText(/^\+/) ).toBeNull();
    expect(queryByText(/^-\d/)).toBeNull();
  });

  test("does not render delta text when previousScore is omitted", () => {
    render(<EvalScoreCard score={70} label="Score" />);
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  test("applies green trend color when score increased", () => {
    const { container } = render(
      <EvalScoreCard score={80} previousScore={70} label="Score" />,
    );
    const trendEl = container.querySelector(".text-green-400");
    expect(trendEl).not.toBeNull();
  });

  test("applies red trend color when score decreased", () => {
    const { container } = render(
      <EvalScoreCard score={60} previousScore={75} label="Score" />,
    );
    const trendEl = container.querySelector(".text-red-400");
    expect(trendEl).not.toBeNull();
  });
});

describe("EvalScoreCard — dimension breakdown", () => {
  const dims = [
    { name: "Reasoning", score: 90 },
    { name: "Fluency", score: 55 },
  ];

  test("renders dimension names", () => {
    render(<EvalScoreCard score={70} label="Score" dimensions={dims} />);
    expect(screen.getByText("Reasoning")).not.toBeNull();
    expect(screen.getByText("Fluency")).not.toBeNull();
  });

  test("renders dimension scores", () => {
    render(<EvalScoreCard score={70} label="Score" dimensions={dims} />);
    expect(screen.getByText("90")).not.toBeNull();
    expect(screen.getByText("55")).not.toBeNull();
  });

  test("does not render dimension section when dimensions prop is omitted", () => {
    render(<EvalScoreCard score={70} label="Score" />);
    expect(screen.queryByText("Reasoning")).toBeNull();
  });

  test("does not render dimension section when dimensions array is empty", () => {
    const { container } = render(
      <EvalScoreCard score={70} label="Score" dimensions={[]} />,
    );
    // The dimension bar wrapper should not be present
    expect(container.querySelectorAll(".bg-surface-3").length).toBe(0);
  });
});
