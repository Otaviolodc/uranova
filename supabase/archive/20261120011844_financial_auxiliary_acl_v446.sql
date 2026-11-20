-- V4.46: prepared locally, NOT applied remotely.
-- PUBLIC/membership surprises abort instead of broadening the authorized change.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $audit$
DECLARE before_dml jsonb; after_dml jsonb;
BEGIN
  IF (SELECT count(*) FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('profiles','products','products_checkout')
        AND c.relkind='r') <> 3 THEN
    RAISE EXCEPTION 'V446: expected three ordinary tables';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    CROSS JOIN LATERAL pg_catalog.aclexplode(coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
    WHERE n.nspname='public' AND c.relname IN ('profiles','products','products_checkout')
      AND a.privilege_type IN ('TRUNCATE','REFERENCES','TRIGGER')
      AND (a.grantee=0 OR (a.grantee<>(SELECT oid FROM pg_catalog.pg_roles WHERE rolname='authenticated')
        AND pg_catalog.pg_has_role('authenticated',a.grantee,'MEMBER')))
  ) THEN
    RAISE EXCEPTION 'V446: PUBLIC or membership grants require separate review';
  END IF;
  SELECT jsonb_agg(jsonb_build_array(t,r,p,pg_catalog.has_table_privilege(r,'public.'||t,p)) ORDER BY t,r,p)
    INTO before_dml FROM unnest(ARRAY['profiles','products','products_checkout']) t
    CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
    CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) p;

  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE
    public.profiles, public.products, public.products_checkout FROM authenticated RESTRICT;

  IF EXISTS (SELECT 1 FROM unnest(ARRAY['profiles','products','products_checkout']) t
      CROSS JOIN unnest(ARRAY['TRUNCATE','REFERENCES','TRIGGER']) p
      WHERE pg_catalog.has_table_privilege('authenticated','public.'||t,p)) THEN
    RAISE EXCEPTION 'V446: forbidden effective privilege remains';
  END IF;
  SELECT jsonb_agg(jsonb_build_array(t,r,p,pg_catalog.has_table_privilege(r,'public.'||t,p)) ORDER BY t,r,p)
    INTO after_dml FROM unnest(ARRAY['profiles','products','products_checkout']) t
    CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
    CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) p;
  IF before_dml IS DISTINCT FROM after_dml THEN
    RAISE EXCEPTION 'V446: legitimate DML privileges changed';
  END IF;
END
$audit$;
COMMIT;
