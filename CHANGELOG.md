# Changelog

## 0.2.0

### Fixed
- **Array fields could not be mapped from previous nodes.** `Default IDs`, `Tags`, `Deleted Tags`
  and `Notes` were declared as `multipleValues` string lists. n8n stores those as fixed lists, so an
  expression returning an array — the normal way to feed data from an upstream node — was split
  character by character instead of being used as a list. In practice this made bulk Delete Points
  and dynamic tagging impossible in a real workflow.

  These are now plain string fields that accept **either** a comma-separated list typed by hand
  **or** an expression returning an array. Existing manually-entered values keep working.

## 0.1.2

- Package author is now `Genudo <genudo.tech@gmail.com>`, replacing the address carried over from
  the project scaffold. This is the address the n8n Creator Portal mails its ownership
  verification code to.

## 0.1.1

- Docs: state compatibility accurately — built against nodes API version 1 in strict mode, with
  zero runtime dependencies behind the `n8n-workflow` peer dependency.
- Packaging: publish as public with provenance, and exclude `dist/tsconfig.tsbuildinfo` from the
  tarball (73.8 kB → 17.2 kB packed).
- First release published through npm trusted publishing (OIDC), with no long-lived token.

## 0.1.0

Initial release.

- **Conversation**: Send Message (text and/or up to 10 binary attachments), Update (status, notes).
- **Opportunity**: Create, Get, Update — lookup by opportunity ID or contact phone, with tags,
  context metadata and contact fields.
- **Knowledge Table**: List Tables, List Columns, List Points (cursor pagination), Upsert Points,
  Delete Points.
- **Genudo API credential**: OAuth 2.0 personal access token sent as an `Authorization: Bearer`
  header, tested against `GET /api/user/knowledge-tables`.
