import { beforeEach, describe, expect, it, vi } from "vitest";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import packageJson from "../package.json";
import { parseInputs } from "../src/inputs";
import { findExistingWebhook, listWebhooks } from "../src/webhookGet";
import { saveWebhook } from "../src/webhookSave";

vi.mock("@actions/core", () => ({
  info: vi.fn(),
}));

vi.mock("@actions/github", () => ({
  context: {
    repo: {
      owner: "owner",
      repo: "repo",
    },
  },
}));

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn(function MockOctokit() {
    return undefined;
  }),
}));

vi.mock("../src/inputs", () => ({
  parseInputs: vi.fn(),
}));

vi.mock("../src/webhookGet", () => ({
  listWebhooks: vi.fn(),
  findExistingWebhook: vi.fn(),
}));

vi.mock("../src/webhookSave", () => ({
  saveWebhook: vi.fn(),
}));

const infoMock = vi.mocked(core.info);
const OctokitMock = vi.mocked(Octokit);
const parseInputsMock = vi.mocked(parseInputs);
const listWebhooksMock = vi.mocked(listWebhooks);
const findExistingWebhookMock = vi.mocked(findExistingWebhook);
const saveWebhookMock = vi.mocked(saveWebhook);

describe("main", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function runMain() {
    const { main } = await import("../src/main");
    return main();
  }

  it("creates a webhook when none exists", async () => {
    parseInputsMock.mockReturnValue({
      token: "token",
      webhookUrl: "https://example.com/webhook",
      events: ["push"],
      secret: "secret",
      contentType: "json",
    });

    listWebhooksMock.mockResolvedValue([
      { id: 1, config: { url: "https://example.com/other" } },
    ] as never);
    findExistingWebhookMock.mockReturnValue(undefined);
    saveWebhookMock.mockResolvedValue({
      id: 99,
      config: { url: "https://example.com/webhook" },
    } as never);

    await runMain();

    expect(OctokitMock).toHaveBeenCalledWith({ auth: "token" });
    expect(listWebhooksMock).toHaveBeenCalledWith(
      expect.any(Object),
      "owner",
      "repo",
    );
    expect(findExistingWebhookMock).toHaveBeenCalledWith(
      [{ id: 1, config: { url: "https://example.com/other" } }],
      "https://example.com/webhook",
    );
    expect(saveWebhookMock).toHaveBeenCalledWith(
      expect.any(Object),
      {
        owner: "owner",
        repo: "repo",
        webhookUrl: "https://example.com/webhook",
        events: ["push"],
        secret: "secret",
        contentType: "json",
      },
      undefined,
    );
    expect(infoMock).toHaveBeenCalledWith(
      `🛠️ Running Friedinger/webhook-sync@v${packageJson.version}`,
    );
    expect(infoMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /^🛠️ Running Friedinger\/webhook-sync@v\d+\.\d+\.\d+$/,
      ),
    );
    expect(infoMock).toHaveBeenCalledWith(
      "📦 Found 1 webhooks for repo owner/repo",
    );
    expect(infoMock).toHaveBeenCalledWith("🔍 Existing webhook not found");
    expect(infoMock).toHaveBeenCalledWith(
      "✅ Webhook is set up for repo owner/repo with id 99",
    );
  });

  it("passes an existing webhook to saveWebhook", async () => {
    const existingWebhook = {
      id: 42,
      config: { url: "https://example.com/webhook" },
    };

    parseInputsMock.mockReturnValue({
      token: "token",
      webhookUrl: "https://example.com/webhook",
      events: ["push"],
      secret: "secret",
      contentType: "json",
    });

    listWebhooksMock.mockResolvedValue([existingWebhook] as never);
    findExistingWebhookMock.mockReturnValue(existingWebhook as never);
    saveWebhookMock.mockResolvedValue(existingWebhook as never);

    await runMain();

    expect(infoMock).toHaveBeenCalledWith("🔍 Existing webhook found");
    expect(saveWebhookMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        owner: "owner",
        repo: "repo",
        webhookUrl: "https://example.com/webhook",
      }),
      existingWebhook,
    );
  });
});
