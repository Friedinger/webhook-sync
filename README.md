# Webhook Sync

[![Release](https://img.shields.io/github/v/release/Friedinger/webhook-sync?style=flat-square&color=blue)](https://github.com/Friedinger/webhook-sync/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Friedinger/webhook-sync/build-test.yml?style=flat-square&label=Build%20and%20Test&color=lime)](https://github.com/Friedinger/webhook-sync/actions/workflows/build-test.yml)
[![Last Commit](https://img.shields.io/github/last-commit/Friedinger/webhook-sync?style=flat-square&color=orange)](https://github.com/Friedinger/webhook-sync/commits/main)
[![License: MIT](https://img.shields.io/github/license/Friedinger/webhook-sync?style=flat-square&color=yellow)](LICENSE)

A GitHub Action to automatically set up a webhook for your repository. It checks if a webhook with the specified URL already exists and updates it if necessary, or creates a new one if it doesn't exist.

## Features

- Automatically creates or updates a webhook for your repository.
- Configurable events, secret, and content type for the webhook.

## Usage

Add the following step to your workflow:

```yaml
- name: Webhook Sync
  uses: Friedinger/webhook-sync@v1
  with:
    github-token: ${{ secrets.WEBHOOK_TOKEN }}
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    events: "push, pull_request"
    secret: ${{ secrets.WEBHOOK_SECRET }}
```

**Note:** You need to provide a GitHub token with read and write access to webhooks for your repository. The default `github.token` is not sufficient for this action, so you must create a personal access token or use a github app token.

## Inputs

| Name         | Description                                                               | Required | Default |
| ------------ | ------------------------------------------------------------------------- | -------- | ------- |
| github-token | GitHub token to use for authentication                                    | true     |         |
| webhook-url  | The URL of the webhook to create or update                                | true     |         |
| events       | Comma-separated list of events to subscribe to (e.g. 'push,pull_request') | true     |         |
| secret       | The secret for the webhook (optional)                                     | false    |         |
| content-type | Content type for the webhook payload (either 'json' or 'form')            | false    | `json`  |

## Example Workflow

```yaml
name: Webhook Sync

on:
  workflow_dispatch:

jobs:
  webhook-sync:
    runs-on: ubuntu-latest

    steps:
      - name: Webhook Sync
        uses: Friedinger/webhook-sync@v1
        with:
          github-token: ${{ secrets.WEBHOOK_TOKEN }}
          webhook-url: ${{ secrets.WEBHOOK_URL }}
          events: "push, pull_request"
          secret: ${{ secrets.WEBHOOK_SECRET }}
          content-type: "json"
```

## Development

Build the action:

```sh
npm install
npm run build
```

## License

[MIT License](LICENSE) © 2026 Friedinger
