import { Octokit } from "@octokit/rest";
import * as core from "@actions/core";
import { WebhookData, WebhookItem } from "./types";

export async function saveWebhook(
  octokit: Octokit,
  webhookData: WebhookData,
  existingWebhook?: WebhookItem,
): Promise<WebhookItem> {
  return existingWebhook
    ? await updateWebhook(octokit, webhookData, existingWebhook.id)
    : await createWebhook(octokit, webhookData);
}

async function createWebhook(
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

async function updateWebhook(
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
