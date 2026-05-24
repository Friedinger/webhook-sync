import { describe, expect, it, vi } from "vitest";
import type { Octokit } from "@octokit/rest";
import type { WebhookItem } from "../src/types";
import { findExistingWebhook, listWebhooks } from "../src/webhookGet";

describe("listWebhooks", () => {
  it("returns the webhook list on success", async () => {
    const responseData = [
      {
        id: 1,
        config: { url: "https://example.com/webhook" },
      },
    ];

    const listWebhooksMock = vi.fn().mockResolvedValue({
      status: 200,
      data: responseData,
    });

    const octokit = {
      rest: {
        repos: {
          listWebhooks: listWebhooksMock,
        },
      },
    } as unknown as Octokit;

    await expect(listWebhooks(octokit, "owner", "repo")).resolves.toEqual(
      responseData,
    );
    expect(listWebhooksMock).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
    });
  });

  it("throws when the response status is not successful", async () => {
    const listWebhooksMock = vi.fn().mockResolvedValue({
      status: 500,
      data: [],
    });

    const octokit = {
      rest: {
        repos: {
          listWebhooks: listWebhooksMock,
        },
      },
    } as unknown as Octokit;

    await expect(listWebhooks(octokit, "owner", "repo")).rejects.toThrow(
      "Failed to list webhooks for repo owner/repo. Status: 500",
    );
  });
});

describe("findExistingWebhook", () => {
  it("returns the matching webhook by url", () => {
    const webhooks = [
      {
        id: 1,
        config: { url: "https://example.com/other" },
      },
      {
        id: 2,
        config: { url: "https://example.com/webhook" },
      },
    ] as WebhookItem[];

    expect(findExistingWebhook(webhooks, "https://example.com/webhook")).toBe(
      webhooks[1],
    );
  });

  it("returns undefined when no webhook matches", () => {
    const webhooks = [
      {
        id: 1,
        config: { url: "https://example.com/other" },
      },
    ] as WebhookItem[];

    expect(findExistingWebhook(webhooks, "https://example.com/webhook")).toBe(
      undefined,
    );
  });
});
