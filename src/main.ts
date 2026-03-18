import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import packageJson from "../package.json";

export async function main(): Promise<void> {
  const token = core.getInput("github-token", { required: true });
  const webhookUrl = core.getInput("webhook-url", { required: true });
  const events = core
    .getInput("events", { required: true })
    .split(",")
    .map((e) => e.trim());
  const secret = core.getInput("secret", { required: false });
  const contentType = core.getInput("content-type", { required: true });

  const octokit = new Octokit({ auth: token });
  core.info(`🛠️ Running Friedinger/webhook-sync@v${packageJson.version}`);

  const { owner, repo } = github.context.repo;
  const webhookData: WebhookData = {
    owner,
    repo,
    webhookUrl,
    events,
    secret,
    contentType,
  };

  const webhooks = await listWebhooks(octokit, owner, repo);
  core.info(
    `📦 Found ${webhooks.data.length} webhooks for repo ${owner}/${repo}`,
  );

  const existingWebhook = webhooks.data.find(
    (wh) => wh.config.url === webhookUrl,
  );
  const result = existingWebhook
    ? await updateWebhook(octokit, webhookData, existingWebhook.id)
    : await createWebhook(octokit, webhookData);
  if (result.status >= 200 && result.status < 300) {
    core.info(
      `✅ Webhook is set up for repo ${owner}/${repo} with id ${result.data.id}`,
    );
  } else {
    core.setFailed(
      `❌ Failed to set up webhook for repo ${owner}/${repo}. Status: ${result.status}`,
    );
  }
}

interface WebhookData {
  owner: string;
  repo: string;
  webhookUrl: string;
  events: string[];
  secret: string;
  contentType: string;
}

async function createWebhook(octokit: Octokit, webhookData: WebhookData) {
  core.info(`🔧 Creating new webhook`);
  return await octokit.rest.repos.createWebhook({
    owner: webhookData.owner,
    repo: webhookData.repo,
    config: {
      url: webhookData.webhookUrl,
      content_type: webhookData.contentType,
      secret: webhookData.secret,
    },
    events: webhookData.events,
  });
}

async function updateWebhook(
  octokit: Octokit,
  webhookData: WebhookData,
  webhookId: number,
) {
  core.info(`🔧 Updating existing webhook ${webhookId}`);
  return await octokit.rest.repos.updateWebhook({
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
}

async function listWebhooks(octokit: Octokit, owner: string, repo: string) {
  return await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });
}
