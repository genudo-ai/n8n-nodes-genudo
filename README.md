# n8n-nodes-genudo

This is an n8n community node. It lets you use [Genudo](https://genudo.ai) in your n8n workflows.

Genudo is an AI sales and support agent platform: AI agents run conversations with leads across messaging channels, qualify and move opportunities through pipeline stages, and answer from managed knowledge tables.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. Search for `n8n-nodes-genudo`.

## Operations

- **Conversation**
  - Send Message
  - Update
- **Opportunity**
  - Create
  - Get
  - Update
- **Knowledge Table**
  - List Tables
  - List Columns
  - List Points
  - Upsert Points
  - Delete Points

## Credentials

1. Sign in to your [Genudo Console](https://genudo.ai) account.
2. Create an API key (see the [authentication guide](https://api.genudo.ai/docs/guide/authentication)).
3. In n8n, create new **Genudo API** credentials and paste the key.

## Compatibility

Requires n8n version 1.x or later. Built and tested against recent n8n releases.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Genudo API reference](https://api.genudo.ai/docs)

## Version history

- **0.1.0** — Initial scaffold.
