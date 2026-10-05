import NewProperty from "./NewProperty";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, jsonResponse } from "../test/utils";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const places = [
  { placeId: "p1", mainText: "Nafplio", secondaryText: "Ελλάδα" },
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    if (url.startsWith("/api/areas/")) return jsonResponse({ places });
    if (url === "/api/properties" && init?.method === "POST") {
      return jsonResponse({ id: 1, ...JSON.parse(init.body as string) }, 201);
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function fillBasicFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Title*"), "Bright apartment");
  await user.selectOptions(screen.getByLabelText("Type*"), "Rent");
  await user.type(screen.getByLabelText("Floor*"), "2");
  await user.type(screen.getByLabelText("Bathrooms*"), "1");
  await user.type(screen.getByLabelText("Price*"), "750");
}

describe("NewProperty", () => {
  it("submits the form with the selected placeId", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewProperty />);

    await fillBasicFields(user);
    await user.type(screen.getByLabelText("Area*"), "naf");
    await user.click(await screen.findByText("Nafplio"));
    await user.click(screen.getByRole("button", { name: "Save Ad" }));

    expect(
      await screen.findByText("Property advertisement saved!"),
    ).toBeInTheDocument();
    const postCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(postCall![1].body)).toMatchObject({
      title: "Bright apartment",
      type: "Rent",
      price: 750,
      floor: 2,
      bathrooms: 1,
      placeId: "p1",
      area: "Nafplio, Ελλάδα",
    });
  });

  it("does not submit when the area was typed but not selected from the list", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewProperty />);

    await fillBasicFields(user);
    await user.type(screen.getByLabelText("Area*"), "Somewhere");
    await user.click(screen.getByRole("button", { name: "Save Ad" }));

    expect(await screen.findByText("No area selected!")).toBeInTheDocument();
    const postCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(postCall).toBeUndefined();
  });
});
