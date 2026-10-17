# n8n-nodes-genudo

[![npm version](https://img.shields.io/npm/v/n8n-nodes-genudo.svg)](https://www.npmjs.com/package/n8n-nodes-genudo)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-genudo.svg)](https://www.npmjs.com/package/n8n-nodes-genudo)
[![license](https://img.shields.io/npm/l/n8n-nodes-genudo.svg)](LICENSE)

This is an n8n community node. It lets you use [Genudo](https://genudo.ai) in your n8n workflows.

[Genudo](https://genudo.ai) is an AI sales and support agent platform. AI agents run conversations
with leads across messaging channels (WhatsApp, Messenger and more), qualify and move opportunities
through pipeline stages, and answer from managed knowledge tables. This node lets an n8n workflow
drive all three: push leads in, react to conversations, and keep the agent's knowledge current.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/)
workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) ·
[Usage](#usage) · [Compatibility](#compatibility) · [Resources](#resources) ·
[Version history](#version-history)

## Installation

### From the n8n UI (self-hosted)

1. Go to **Settings → Community nodes**.
2. Click **Install**.
3. Enter `n8n-nodes-genudo` as the npm package name.
4. Tick the box acknowledging the risks of installing community nodes, then click **Install**.

Full instructions live in the
[n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

### Manually (self-hosted)

```bash
mkdir -p ~/.n8n/nodes && cd ~/.n8n/nodes
npm install n8n-nodes-genudo
# restart n8n
```

For Docker, install into the mounted n8n data volume:

```bash
docker exec -u node <container> sh -c \
  'mkdir -p /home/node/.n8n/nodes && cd /home/node/.n8n/nodes && npm install n8n-nodes-genudo'
docker restart <container>
```

## Operations

### Conversation

| Operation | API call | Notes |
| --- | --- | --- |
| Send Message | `POST /api/user/{conversation}/messages` | Sends text, attachments, or both. Attachments are read from binary fields on the input item (up to 10 files, 25 MB each) and uploaded as `multipart/form-data`. Delivery is synchronous through the conversation's connected channel. |
| Update | `PUT /api/user/conversations/{id}` | Sets the conversation status (`active` / `paused`) and/or replaces its notes list. Pausing stops the AI agent from replying. |

### Opportunity

| Operation | API call | Notes |
| --- | --- | --- |
| Create | `POST /api/user/opportunities` | Pipeline ID is required. Optional stage, name, notes, status, context metadata, tags, test flag, and contact name / email / phone / priority. Give a contact email or phone to match-or-create the contact (returns that contact's current opportunity if it has one), or a **Contact ID** to open a *further* opportunity on an existing contact. |
| Get | `GET /api/user/opportunities/{identifier}` | Look up by opportunity ID **or** by contact phone (digits only, country code, no `+`). Use the **Pipeline ID** option to disambiguate a phone that exists in several pipelines. |
| Get by Contact | `GET /api/user/contacts/{identifier}/opportunities` | Every opportunity of a contact across all pipelines, newest first, one item each. Takes a contact ID or phone; **Pipeline ID** narrows it. Returns no items (not an error) when nothing matches. |
| Update | `PUT /api/user/opportunities/{identifier}` | Partial update — only the fields you set are sent. Adds tags by name and removes them by tag ID. |

### Knowledge Table

| Operation | API call | Notes |
| --- | --- | --- |
| List Tables | `GET /api/user/knowledge-tables` | Every knowledge table in the workspace. |
| List Columns | `GET /api/user/knowledge-tables/{id}/columns` | The table schema — run this to find the column names to send when upserting. |
| List Points | `GET /api/user/knowledge-tables/{id}/points` | Returns the rows. **Return All** follows the `next_page_offset` cursor automatically; otherwise use **Limit** and the **Next Page Offset** option to page manually. |
| Upsert Points | `PUT /api/user/knowledge-tables/{id}/points` | Bulk create/update. Rows are matched by `default_id` — an existing row with the same one is updated in place. |
| Delete Points | `DELETE /api/user/knowledge-tables/{id}/points` | Removes rows by `default_id`. |

### Genudo Web Channel

A separate node for [web channels](https://api.genudo.ai/docs/reference/web-channel/overview): your
backend drives the chat and you own the UI. It uses its own **Genudo Web Channel API** credential,
not the access token.

| Operation | API call | Notes |
| --- | --- | --- |
| Initiate Conversation | `POST /api/user/web-chat/initiate` | Optional. Opens or resumes a conversation (idempotent per contact ID), validates the channel, and registers name / email / phone. |
| Send Message | `POST {messages_webhook}` | Posts a customer message to the receiver host from the credential. Text and/or up to 10 binary attachments, 5 MB each. Returns the stored `message_id`; the AI reply arrives on your callback URL. |
| Get Messages | `GET /api/user/messages/webchat` | History for a contact ID or conversation ID, newest first. **Return All** pages through automatically. |

**Genudo Web Channel Trigger** receives the AI reply. Paste its Production URL into the channel's
Callback URL in the Genudo Console. Every request is verified against the
`X-Genudo-Signature` HMAC-SHA256 header and rejected with `403` if it is forged, malformed or older
than 5 minutes. The workflow receives `{ event, client_id, contact_id, message_id, text, timestamp }`.
Delivery is at-least-once, so make downstream handling idempotent on `message_id`.

Every operation returns the `data` payload of the Genudo response envelope rather than the raw
`{ status, code, message, data }` wrapper, so downstream nodes see the record directly.

The node is also available to AI Agents as a tool (`usableAsTool`).

## Credentials

Genudo authenticates with scoped personal access tokens sent as `Authorization: Bearer <token>`.

1. Sign in to the [Genudo Console](https://app.genudo.ai).
2. Open **Developer → API Keys & Tokens** in the sidebar (or go straight to
   [app.genudo.ai/tokens](https://app.genudo.ai/tokens)).
3. Click **Create token**, give it a name, pick the scopes and an expiry.
4. Copy the token — the full value is shown **only once at creation**; Genudo keeps only a hashed
   copy. If you lose it, create a new token and revoke the old one.
5. In n8n, create new **Genudo API** credentials and paste it into **Access Token**.

Scope each token for the operations you plan to run:

| Scope | Needed for |
| --- | --- |
| `messages:send` | Conversation → Send Message |
| `conversations:write` | Conversation → Update |
| `opportunities:read` | Opportunity → Get, Get by Contact |
| `opportunities:write` | Opportunity → Create, Update |
| `knowledge:read` | Knowledge Table → List Tables, List Columns, List Points |
| `knowledge:write` | Knowledge Table → Upsert Points, Delete Points |
| `mcp:use` | Not used by this node. Needed to connect Genudo's MCP server (see below). |

Tokens can be revoked from the same page at any time; a revoked token starts failing with `401` on
its next request.

> The credential's **Test** button calls `GET /api/user/knowledge-tables`, so a token without
> `knowledge:read` reports a `403` there even though it still works for the scopes it does have.

### Web Channel credentials

Web channels authenticate with HTTP Basic auth, separate from account tokens. Create the channel in
the Genudo Console (pipeline, callback URL, optional allowed origins / IPs), then create **Genudo Web
Channel API** credentials with its **Client ID** (`wc_…`), **Client Secret** and **Messages Webhook
URL**. The **Test** button calls Initiate with a fixed `n8n-credential-test` contact, so the channel
must be linked to a pipeline with an active subscription and credits.

## Genudo MCP in n8n

Genudo's MCP server (`https://api.genudo.ai/mcp`, 32 tools — pipelines, stages, actions, variables,
contacts, analytics) is not part of this node; use n8n's built-in **MCP Client Tool** on an AI Agent:

1. Endpoint URL `https://api.genudo.ai/mcp`, Server Transport **HTTP Streamable**.
2. Authentication **Bearer**, with a Genudo token that has the `mcp:use` scope plus the scopes of the
   tools you want the agent to call.

Use this node for deterministic steps (create a lead, send a message) and MCP when an AI agent should
decide what to do.

## Usage

**Push a web form lead into a pipeline.** Webhook → Genudo (Opportunity → Create). Set **Pipeline
ID**, then under **Additional Fields** add **Contact Name**, **Contact Phone** and **Tags**. Leave
**Stage ID** unset to drop it into the pipeline's first stage. The AI agent picks the conversation
up from there.

**Escalate to a human.** Genudo (Conversation → Update) with **Status** = `Paused` and a note
explaining why. The agent stops replying until you set it back to `Active`.

**Reply with an attachment.** HTTP Request (Response Format = *File*) → Genudo (Conversation →
Send Message). Turn on **Send Attachments** and set **Input Binary Fields** to the binary property
name, e.g. `data`. Comma-separate for several files.

**Keep the knowledge base in sync.** Schedule Trigger → your source (Sheets, Notion, Postgres) →
Genudo (Knowledge Table → Upsert Points). Run **List Columns** once to learn the column names, then
send a **Points** array where each entry has a stable `default_id` plus one key per column. Re-runs
update in place instead of duplicating.

### Error handling

Genudo returns a consistent envelope on failure, surfaced by the node as the HTTP error:

| Code | Meaning |
| --- | --- |
| `401` | Missing, invalid, expired, or revoked token |
| `403` | Valid token, but missing the scope the endpoint requires |
| `404` | Record not found in your workspace |
| `422` | Validation failed — check the `validation` object in the response |
| `429` | Rate limited — retry after the `Retry-After` header |

## Compatibility

Requires n8n 1.x or later, on Node.js 20 or newer. Built with
[`@n8n/node-cli`](https://www.npmjs.com/package/@n8n/node-cli) against nodes API version 1, in
strict mode for n8n Cloud eligibility.

The package declares **zero runtime dependencies** — only a peer dependency on `n8n-workflow`,
which your n8n instance already provides.

## Resources

- [Genudo](https://genudo.ai) · [Genudo Console](https://app.genudo.ai)
- [Genudo API reference](https://api.genudo.ai/docs) ·
  [Authentication guide](https://api.genudo.ai/docs/guide/authentication)
- [Genudo MCP server](https://api.genudo.ai/docs/mcp/overview) — for connecting Genudo to AI clients directly
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Report an issue](https://github.com/genudo-ai/n8n-nodes-genudo/issues)

## Version history

- **0.3.1** — Comma-separated Tags, Deleted Tags, Notes and Default IDs work again; multipart upload hardening.
- **0.3.0** — Opportunity → Get by Contact; Create accepts a Contact ID and the `pending` status. New Genudo Web Channel node and reply trigger. Docs for MCP and the full scope list.
- **0.2.0** — Array fields (Default IDs, Tags, Deleted Tags, Notes) now accept expressions from previous nodes.
- **0.1.2** — Package author set to the Genudo team address.
- **0.1.1** — Documentation and packaging fixes; first release published via npm trusted publishing.
- **0.1.0** — First release. Conversation (Send Message, Update), Opportunity (Create, Get, Update)
  and Knowledge Table (List Tables, List Columns, List Points, Upsert Points, Delete Points).

## License

[MIT](LICENSE)
