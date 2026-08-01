# Changelog

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
