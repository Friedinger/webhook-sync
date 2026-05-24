import { beforeEach, describe, expect, it, vi } from "vitest";
import * as core from "@actions/core";
import { parseInputs } from "../src/inputs";

vi.mock("@actions/core", () => ({
  getInput: vi.fn(),
}));

const getInputMock = vi.mocked(core.getInput);

describe("parseInputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setInputs(values: Record<string, string>) {
    getInputMock.mockImplementation((name) => values[name] ?? "");
  }

  it("parses and trims valid inputs", () => {
    setInputs({
      "github-token": "ghs_123",
      "webhook-url": "https://example.com/webhook",
      events: "push, pull_request ",
      secret: "topsecret",
      "content-type": "json",
    });

    expect(parseInputs()).toEqual({
      token: "ghs_123",
      webhookUrl: "https://example.com/webhook",
      events: ["push", "pull_request"],
      secret: "topsecret",
      contentType: "json",
    });
  });

  it('throws when content type is neither "json" nor "form"', () => {
    setInputs({
      "github-token": "ghs_123",
      "webhook-url": "https://example.com/webhook",
      events: "push",
      secret: "",
      "content-type": "xml",
    });

    expect(() => parseInputs()).toThrow(
      'Invalid content type: xml. Must be either "json" or "form".',
    );
  });

  it("throws when events are empty after trimming", () => {
    setInputs({
      "github-token": "ghs_123",
      "webhook-url": "https://example.com/webhook",
      events: " , ",
      secret: "",
      "content-type": "json",
    });

    expect(() => parseInputs()).toThrow(
      "At least one event must be specified.",
    );
  });
});
