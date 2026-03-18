import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import packageJson from "../package.json";
import { findExistingWebhook, listWebhooks } from "./webhookGet";
import { parseInputs } from "./inputs";
import { WebhookData } from "./types";
import { saveWebhook } from "./webhookSave";

export async function main(): Promise<void> {
  const { token, webhookUrl, events, secret, contentType } = parseInputs();

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
  core.info(`📦 Found ${webhooks.length} webhooks for repo ${owner}/${repo}`);

  const existingWebhook = findExistingWebhook(webhooks, webhookUrl);
  core.info(`🔍 Existing webhook ${existingWebhook ? "found" : "not found"}`);

  const newWebhook = await saveWebhook(octokit, webhookData, existingWebhook);
  core.info(
    `✅ Webhook is set up for repo ${owner}/${repo} with id ${newWebhook.id}`,
  );
}
