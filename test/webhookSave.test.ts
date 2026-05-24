import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Octokit } from "@octokit/rest";
import * as core from "@actions/core";
import type { WebhookData, WebhookItem } from "../src/types";
import { saveWebhook } from "../src/webhookSave";

vi.mock("@actions/core", () => ({
  info: vi.fn(),
}));

const infoMock = vi.mocked(core.info);

describe("saveWebhook", () => {
  const webhookData: WebhookData = {
    owner: "owner",
    repo: "repo",
    webhookUrl: "https://example.com/webhook",
    events: ["push"],
    secret: "secret",
    contentType: "json",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a webhook when none exists", async () => {
    const createdWebhook = {
      id: 1,
      config: { url: webhookData.webhookUrl },
    } as WebhookItem;
    const createWebhookMock = vi.fn().mockResolvedValue({
      status: 201,
      data: createdWebhook,
    });

    const octokit = {
      rest: {
        repos: {
          createWebhook: createWebhookMock,
          updateWebhook: vi.fn(),
        },
      },
    } as unknown as Octokit;

    await expect(saveWebhook(octokit, webhookData)).resolves.toBe(
      createdWebhook,
    );
    expect(infoMock).toHaveBeenCalledWith("🔧 Creating new webhook");
    expect(createWebhookMock).toHaveBeenCalledWith({
      owner: webhookData.owner,
      repo: webhookData.repo,
      config: {
        url: webhookData.webhookUrl,
        content_type: webhookData.contentType,
        secret: webhookData.secret,
      },
      events: webhookData.events,
    });
  });

  it("updates an existing webhook", async () => {
    const existingWebhook = {
      id: 42,
      config: { url: "https://example.com/old" },
    } as WebhookItem;
    const updatedWebhook = {
      id: 42,
      config: { url: webhookData.webhookUrl },
    } as WebhookItem;
    const updateWebhookMock = vi.fn().mockResolvedValue({
      status: 200,
      data: updatedWebhook,
    });

    const octokit = {
      rest: {
        repos: {
          createWebhook: vi.fn(),
          updateWebhook: updateWebhookMock,
        },
      },
    } as unknown as Octokit;

    await expect(
      saveWebhook(octokit, webhookData, existingWebhook),
    ).resolves.toBe(updatedWebhook);
    expect(infoMock).toHaveBeenCalledWith("🔧 Updating existing webhook 42");
    expect(updateWebhookMock).toHaveBeenCalledWith({
      owner: webhookData.owner,
      repo: webhookData.repo,
      hook_id: 42,
      config: {
        url: webhookData.webhookUrl,
        content_type: webhookData.contentType,
        secret: webhookData.secret,
      },
      events: webhookData.events,
    });
  });

  it("throws when creating a webhook fails", async () => {
    const createWebhookMock = vi.fn().mockResolvedValue({
      status: 500,
      data: {},
    });

    const octokit = {
      rest: {
        repos: {
          createWebhook: createWebhookMock,
          updateWebhook: vi.fn(),
        },
      },
    } as unknown as Octokit;

    await expect(saveWebhook(octokit, webhookData)).rejects.toThrow(
      "Failed to create webhook for repo owner/repo. Status: 500",
    );
  });

  it("throws when updating a webhook fails", async () => {
    const existingWebhook = {
      id: 42,
      config: { url: "https://example.com/old" },
    } as WebhookItem;
    const updateWebhookMock = vi.fn().mockResolvedValue({
      status: 500,
      data: {},
    });

    const octokit = {
      rest: {
        repos: {
          createWebhook: vi.fn(),
          updateWebhook: updateWebhookMock,
        },
      },
    } as unknown as Octokit;

    await expect(
      saveWebhook(octokit, webhookData, existingWebhook),
    ).rejects.toThrow(
      "Failed to update webhook for repo owner/repo. Status: 500",
    );
  });
});
