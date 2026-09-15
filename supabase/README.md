# Official finance migration

Source: `migrations/20260913014834_official_finance.sql`.

Approved SHA-256: `df8ecf1682edd9449c5c50288aced0d5e386c959c524ad73d3ae83c624e9c038`.

Applied once through the versioned Supabase migration API on 2026-09-14. The API registered `20260914204949`, name `official_finance`. The source filename is retained unchanged; these are the same migration, not two migrations to execute.

Do not reapply this file or run an unreviewed `supabase db push` against the existing remote. Its older migration history is not fully represented in this checkout. Align migration history in a separate reviewed maintenance step before subsequent CLI database pushes. Application deployment does not apply SQL migrations.

The existing Live history remains unverified and excluded from official totals. Reconciliation requires a separate explicit review. No historical tables were deleted.
