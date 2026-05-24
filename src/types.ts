import { Octokit } from "@octokit/rest";

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
