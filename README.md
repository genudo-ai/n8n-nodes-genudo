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

### Conversation

| Operation | API call | Notes |
| --- | --- | --- |
| Send Message | `POST /api/user/{conversation}/messages` | Sends text, attachments, or both. Attachments are taken from binary fields on the input item (up to 10 files, 25 MB each) and uploaded as `multipart/form-data`. |
| Update | `PUT /api/user/conversations/{id}` | Sets the conversation status (`active` / `paused`) and/or replaces its notes list. |

### Opportunity

| Operation | API call | Notes |
| --- | --- | --- |
| Create | `POST /api/user/opportunities` | Pipeline ID is required. Optional stage, name, notes, status, context, tags, test flag, and contact name / email / phone / priority. |
| Get | `GET /api/user/opportunities/{identifier}` | Look up by opportunity ID or by contact phone. Set the **Pipeline ID** option to disambiguate a phone that exists in several pipelines. |
| Update | `PUT /api/user/opportunities/{identifier}` | Partial update — only the fields you set are sent. Supports adding tags and removing them by tag ID. |

### Knowledge Table

| Operation | API call | Notes |
| --- | --- | --- |
| List Tables | `GET /api/user/knowledge-tables` | Every knowledge table in the workspace. |
| List Columns | `GET /api/user/knowledge-tables/{id}/columns` | The table schema — run this to find the column names to send when upserting. |
| List Points | `GET /api/user/knowledge-tables/{id}/points` | Returns the rows. **Return All** follows the `next_page_offset` cursor automatically; otherwise use **Limit** and the **Next Page Offset** option to page manually. |
| Upsert Points | `PUT /api/user/knowledge-tables/{id}/points` | Bulk create/update. Rows are matched by `default_id`. |
| Delete Points | `DELETE /api/user/knowledge-tables/{id}/points` | Removes rows by `default_id`. |

Every operation returns the `data` payload of the Genudo response envelope rather than the raw
`{ status, code, message, data }` wrapper.

## Credentials

Genudo authenticates with OAuth 2.0 personal access tokens sent as `Authorization: Bearer <token>`.

1. Sign in to the [Genudo Console](https://genudo.ai).
2. Open **Settings → Developer → API Tokens**, click **Create Token**, pick the scopes and an
   expiry, and copy the token — it is shown only once.
3. In n8n, create new **Genudo API** credentials and paste it into **Access Token**.

Scope each token for the operations you plan to run:

| Scope | Needed for |
| --- | --- |
| `messages:send` | Conversation → Send Message |
| `conversations:write` | Conversation → Update |
| `opportunities:read` | Opportunity → Get |
| `opportunities:write` | Opportunity → Create, Update |
| `knowledge:read` | Knowledge Table → List Tables, List Columns, List Points |
| `knowledge:write` | Knowledge Table → Upsert Points, Delete Points |

The credential's **Test** button calls `GET /api/user/knowledge-tables`, so a token without
`knowledge:read` reports a 403 there even though it still works for the scopes it does have.

## Compatibility

Requires n8n version 1.x or later. Built and tested against recent n8n releases.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Genudo API reference](https://api.genudo.ai/docs)

## Version history

- **0.1.0** — First release: Conversation, Opportunity and Knowledge Table resources.
