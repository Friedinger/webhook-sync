import { Octokit } from "@octokit/rest";
import * as core from "@actions/core";

export interface WebhookData {
  owner: string;
  repo: string;
  webhookUrl: string;
  events: string[];
  secret: string;
  contentType: string;
}

type WebhookListResponse = Awaited<
  ReturnType<Octokit["rest"]["repos"]["listWebhooks"]>
>;
export type WebhookItem = WebhookListResponse["data"][number];

export async function listWebhooks(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<WebhookItem[]> {
  const response = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Failed to list webhooks for repo ${owner}/${repo}. Status: ${response.status}`,
    );
  }
  return response.data;
}

export function findExistingWebhook(
  webhooks: WebhookItem[],
  webhookUrl: string,
): WebhookItem | undefined {
  return webhooks.find((webhook) => webhook.config.url === webhookUrl);
}

export async function createWebhook(
  octokit: Octokit,
  webhookData: WebhookData,
): Promise<WebhookItem> {
  core.info(`🔧 Creating new webhook`);
  const response = await octokit.rest.repos.createWebhook({
    owner: webhookData.owner,
    repo: webhookData.repo,
    config: {
      url: webhookData.webhookUrl,
      content_type: webhookData.contentType,
      secret: webhookData.secret,
    },
    events: webhookData.events,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Failed to create webhook for repo ${webhookData.owner}/${webhookData.repo}. Status: ${response.status}`,
    );
  }
  return response.data;
}

export async function updateWebhook(
  octokit: Octokit,
  webhookData: WebhookData,
  webhookId: number,
): Promise<WebhookItem> {
  core.info(`🔧 Updating existing webhook ${webhookId}`);
  const response = await octokit.rest.repos.updateWebhook({
    owner: webhookData.owner,
    repo: webhookData.repo,
    hook_id: webhookId,
    config: {
      url: webhookData.webhookUrl,
      content_type: webhookData.contentType,
      secret: webhookData.secret,
    },
    events: webhookData.events,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Failed to update webhook for repo ${webhookData.owner}/${webhookData.repo}. Status: ${response.status}`,
    );
  }
  return response.data;
}
