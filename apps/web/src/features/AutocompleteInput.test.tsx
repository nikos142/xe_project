import { useState } from "react";
import type { Area } from "@xe/shared";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AutocompleteInput from "./AutocompleteInput";
import { renderWithProviders, jsonResponse } from "../test/utils";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const places = [
  { placeId: "p1", mainText: "Nafplio", secondaryText: "Ελλάδα" },
  { placeId: "p2", mainText: "Nafpliou", secondaryText: "Αθήνα, Ελλάδα" },
];

const fetchMock = vi.fn();

function Wrapper({ onSelect }: { onSelect: (area: Area) => void }) {
  const [term, setTerm] = useState("");
  return (
    <AutocompleteInput
      searchTerm={term}
      onChange={(e) => setTerm(e.target.value)}
      onSelect={(area) => {
        setTerm(area.mainText);
        onSelect(area);
      }}
      error={false}
    />
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AutocompleteInput", () => {
  it("does not search before 3 characters are typed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Wrapper onSelect={vi.fn()} />);

    await user.type(screen.getByLabelText("Area*"), "na");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows the matching areas after 3 characters", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ places }));
    const user = userEvent.setup();
    renderWithProviders(<Wrapper onSelect={vi.fn()} />);

    await user.type(screen.getByLabelText("Area*"), "naf");

    expect(await screen.findByText("Nafplio")).toBeInTheDocument();
    expect(screen.getByText("Nafpliou")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/areas/naf");
  });

  it("waits until typing stops and sends one request for the full text", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ places }));
    const user = userEvent.setup();
    renderWithProviders(<Wrapper onSelect={vi.fn()} />);

    await user.type(screen.getByLabelText("Area*"), "nafpli");

    expect(await screen.findByText("Nafplio")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/areas/nafpli");
  });

  it("fills the field and returns the area when an option is clicked", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ places }));
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Wrapper onSelect={onSelect} />);

    const input = screen.getByLabelText("Area*");
    await user.type(input, "naf");
    await user.click(await screen.findByText("Nafplio"));

    expect(onSelect).toHaveBeenCalledWith(places[0]);
    expect(input).toHaveValue("Nafplio");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows the error message when the search fails", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Error fetching places. Please try again." }, 502),
    );
    const user = userEvent.setup();
    renderWithProviders(<Wrapper onSelect={vi.fn()} />);

    await user.type(screen.getByLabelText("Area*"), "naf");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Error fetching places. Please try again.",
    );
  });
});
