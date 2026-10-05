import { screen } from "@testing-library/react";
import PropertiesContent from "./PropertiesContent";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, jsonResponse } from "../test/utils";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const property = {
  id: 1,
  title: "Bright apartment",
  type: "Rent",
  price: 750,
  placeId: "p1",
  area: "Nafplio, Ελλάδα",
  floor: 2,
  bathrooms: 1,
  extra_description: "Close to the old town",
  created_at: "2026-10-01 10:00:00",
  updated_at: "2026-10-01 10:00:00",
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PropertiesContent", () => {
  it("shows the saved properties", async () => {
    fetchMock.mockResolvedValue(jsonResponse([property]));

    renderWithProviders(<PropertiesContent />);

    expect(await screen.findByText("Bright apartment")).toBeInTheDocument();
    expect(screen.getByText("Nafplio, Ελλάδα")).toBeInTheDocument();
  });

  it("shows a message when there are no properties", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    renderWithProviders(<PropertiesContent />);

    expect(
      await screen.findByText("No property advertisements found!"),
    ).toBeInTheDocument();
  });

  it("shows an error when the properties cannot be loaded", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Internal server error" }, 500),
    );

    renderWithProviders(<PropertiesContent />);

    expect(
      await screen.findByText("System Error! Could not fetch properties."),
    ).toBeInTheDocument();
  });

  it("edits a property and saves the change", async () => {
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init?.method === "PUT") {
        return jsonResponse({
          ...property,
          ...JSON.parse(init.body as string),
        });
      }
      return jsonResponse([property]);
    });
    const user = userEvent.setup();
    renderWithProviders(<PropertiesContent />);

    await user.click(await screen.findByRole("button", { name: "Edit" }));
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Renovated apartment");
    await user.selectOptions(screen.getByLabelText("Type"), "Buy");
    const floor = screen.getByLabelText("Floor");
    await user.clear(floor);
    await user.type(floor, "3");
    const bathrooms = screen.getByLabelText("Bathrooms");
    await user.clear(bathrooms);
    await user.type(bathrooms, "2");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const putCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PUT",
    );
    expect(putCall![0]).toBe("/api/properties/1");
    // The edited title is sent, and the unchanged fields are sent back too
    expect(JSON.parse(putCall![1].body)).toMatchObject({
      title: "Renovated apartment",
      type: "Buy",
      floor: 3,
      bathrooms: 2,
      placeId: "p1",
      price: 750,
    });
  });
});
