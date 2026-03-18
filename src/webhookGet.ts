import { Octokit } from "@octokit/rest";
import { WebhookItem } from "./types";

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
