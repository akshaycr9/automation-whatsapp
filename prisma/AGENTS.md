# Prisma Agent Guide

- Keep the schema PostgreSQL-compatible.
- Do not implement final business models until the database design phase.
- Use enums for statuses later.
- Index external IDs later.
- Seed predefined automations later.
- Do not delete migrations manually.
- Avoid nullable fields unless required.
- Keep seed scripts idempotent when real data is introduced.
