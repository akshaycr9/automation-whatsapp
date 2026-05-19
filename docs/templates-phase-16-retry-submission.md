# Templates Phase 16: Retry Submission

## Summary

Phase 16 adds a safe retry flow for templates that are saved locally with status `ERROR` after a failed or uncertain Meta submission.

## Endpoint

`POST /api/templates/:id/retry-submission`

The endpoint is admin-authenticated and tenant-scoped.

## Retry behavior

Retry is reconciliation-first:

1. Load the local template from the database.
2. Call Meta list templates.
3. Look for an existing Meta template with the same `name + languageCode`.
4. If found, attach/sync Meta-owned fields locally and do not create a duplicate.
5. If not found, rebuild the Meta create payload from stored local components, variables, and buttons, then submit to Meta.
6. If retry fails, keep the template in `ERROR`, store provider payload audit data, and create an `ERROR` event.

## Frontend behavior

Templates with status `ERROR` show a retry icon in the Actions column. Clicking it calls the retry endpoint and invalidates template queries after success.

## Known limitations

- Retry currently reconciles by `name + languageCode` within the configured WABA.
- There is no background retry queue yet.
- Duplicate ambiguity handling is minimal because Meta should enforce template name/language uniqueness within a WABA.
