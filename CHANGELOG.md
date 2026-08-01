# Changelog

## 0.1.0

Initial release.

- **Conversation**: Send Message (text and/or up to 10 binary attachments), Update (status, notes).
- **Opportunity**: Create, Get, Update — lookup by opportunity ID or contact phone, with tags,
  context metadata and contact fields.
- **Knowledge Table**: List Tables, List Columns, List Points (cursor pagination), Upsert Points,
  Delete Points.
- **Genudo API credential**: OAuth 2.0 personal access token sent as an `Authorization: Bearer`
  header, tested against `GET /api/user/knowledge-tables`.
