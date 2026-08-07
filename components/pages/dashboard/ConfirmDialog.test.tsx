import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog open={false} title="წაშლა" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the title and description when open", () => {
    render(
      <ConfirmDialog
        open
        title="კითხვის წაშლა"
        description="ეს მოქმედება შეუქცევადია."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("კითხვის წაშლა")).toBeInTheDocument();
    expect(screen.getByText("ეს მოქმედება შეუქცევადია.")).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", () => {
    const onConfirm = jest.fn();
    render(<ConfirmDialog open title="წაშლა" onConfirm={onConfirm} onCancel={jest.fn()} />);
    fireEvent.click(screen.getByText("დადასტურება"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog open title="წაშლა" onConfirm={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("გაუქმება"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables the action buttons while confirming", () => {
    render(<ConfirmDialog open title="წაშლა" confirming onConfirm={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("მუშავდება...")).toBeDisabled();
    expect(screen.getByText("გაუქმება")).toBeDisabled();
  });
});
