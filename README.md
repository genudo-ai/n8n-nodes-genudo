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
| Create | `POST /api/user/opportunities` | Pipeline ID is required. Optional stage, name, notes, status, context metadata, tags, test flag, and contact name / email / phone / priority. A contact email or phone must be given. |
| Get | `GET /api/user/opportunities/{identifier}` | Look up by opportunity ID **or** by contact phone (digits only, country code, no `+`). Use the **Pipeline ID** option to disambiguate a phone that exists in several pipelines. |
| Update | `PUT /api/user/opportunities/{identifier}` | Partial update — only the fields you set are sent. Adds tags by name and removes them by tag ID. |

### Knowledge Table

| Operation | API call | Notes |
| --- | --- | --- |
| List Tables | `GET /api/user/knowledge-tables` | Every knowledge table in the workspace. |
| List Columns | `GET /api/user/knowledge-tables/{id}/columns` | The table schema — run this to find the column names to send when upserting. |
| List Points | `GET /api/user/knowledge-tables/{id}/points` | Returns the rows. **Return All** follows the `next_page_offset` cursor automatically; otherwise use **Limit** and the **Next Page Offset** option to page manually. |
| Upsert Points | `PUT /api/user/knowledge-tables/{id}/points` | Bulk create/update. Rows are matched by `default_id` — an existing row with the same one is updated in place. |
| Delete Points | `DELETE /api/user/knowledge-tables/{id}/points` | Removes rows by `default_id`. |

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
| `opportunities:read` | Opportunity → Get |
| `opportunities:write` | Opportunity → Create, Update |
| `knowledge:read` | Knowledge Table → List Tables, List Columns, List Points |
| `knowledge:write` | Knowledge Table → Upsert Points, Delete Points |

Tokens can be revoked from the same page at any time; a revoked token starts failing with `401` on
its next request.

> The credential's **Test** button calls `GET /api/user/knowledge-tables`, so a token without
> `knowledge:read` reports a `403` there even though it still works for the scopes it does have.

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

- **0.2.0** — Array fields (Default IDs, Tags, Deleted Tags, Notes) now accept expressions from previous nodes.
- **0.1.2** — Package author set to the Genudo team address.
- **0.1.1** — Documentation and packaging fixes; first release published via npm trusted publishing.
- **0.1.0** — First release. Conversation (Send Message, Update), Opportunity (Create, Get, Update)
  and Knowledge Table (List Tables, List Columns, List Points, Upsert Points, Delete Points).

## License

[MIT](LICENSE)
