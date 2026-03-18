import * as core from "@actions/core";

export function parseInputs() {
  const token = core.getInput("github-token", { required: true });
  const webhookUrl = core.getInput("webhook-url", { required: true });
  const events = core
    .getInput("events", { required: true })
    .split(",")
    .map((e) => e.trim());
  const secret = core.getInput("secret", { required: false });
  const contentType = core.getInput("content-type", { required: true });

  if (!["json", "form"].includes(contentType)) {
    throw new Error(
      `Invalid content type: ${contentType}. Must be either "json" or "form".`,
    );
  }
  if (events.length === 0) {
    throw new Error(`At least one event must be specified.`);
  }

  return {
    token,
    webhookUrl,
    events,
    secret,
    contentType,
  };
}
