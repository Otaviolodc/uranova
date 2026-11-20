-- Prepared locally. Standalone superset of V446; safe also after V446.
-- PostgreSQL 17 only: another major requires explicit re-homologation.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $audit$
DECLARE target record; before_rights jsonb; after_rights jsonb;
BEGIN
  IF current_setting('server_version_num')::integer NOT BETWEEN 170000 AND 179999 THEN
    RAISE EXCEPTION 'V448: PostgreSQL 17 required; no grants changed';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('profiles','products','products_checkout') AND c.relkind='r')<>3 THEN
    RAISE EXCEPTION 'V448: expected three ordinary tables';
  END IF;
  FOR target IN
    SELECT t,r,p FROM unnest(ARRAY['profiles','products','products_checkout']) t
    CROSS JOIN unnest(ARRAY['authenticated','anon']) r
    CROSS JOIN unnest(ARRAY['TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
    WHERE r='authenticated' OR (p='MAINTAIN' AND t IN ('products','products_checkout'))
  LOOP
    -- This also tests MAINTAIN support before any REVOKE.
    PERFORM pg_catalog.has_table_privilege(target.r,'public.'||target.t,target.p);
    IF EXISTS (
      SELECT 1 FROM pg_catalog.pg_class c
      CROSS JOIN LATERAL pg_catalog.aclexplode(coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
      WHERE c.oid=pg_catalog.to_regclass('public.'||target.t) AND a.privilege_type=target.p
        AND CASE WHEN a.grantee=0 THEN true
          WHEN a.grantee=(SELECT oid FROM pg_catalog.pg_roles WHERE rolname=target.r) THEN false
          ELSE pg_catalog.pg_has_role(target.r,a.grantee,'MEMBER') END
    ) THEN
      RAISE EXCEPTION 'V448: PUBLIC or membership grant requires separate review';
    END IF;
  END LOOP;
  -- Table-level revocation must not leave column-level REFERENCES rights behind.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_attribute att
    CROSS JOIN LATERAL pg_catalog.aclexplode(att.attacl) a
    WHERE att.attrelid IN ('public.profiles'::regclass,'public.products'::regclass,'public.products_checkout'::regclass)
      AND a.privilege_type='REFERENCES'
      AND CASE WHEN a.grantee=0 THEN true ELSE pg_catalog.pg_has_role('authenticated',a.grantee,'MEMBER') END
  ) THEN RAISE EXCEPTION 'V448: column REFERENCES requires separate review'; END IF;

  -- Preserve all effective non-target rights of app roles AND service_role.
  SELECT jsonb_agg(jsonb_build_array(t,r,p,pg_catalog.has_table_privilege(r,'public.'||t,p)) ORDER BY t,r,p)
  INTO before_rights FROM unnest(ARRAY['profiles','products','products_checkout']) t
  CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
  CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
  WHERE NOT ((r='authenticated' AND p IN ('TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'))
    OR (r='anon' AND p='MAINTAIN' AND t IN ('products','products_checkout')));

  REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE
    public.profiles, public.products, public.products_checkout FROM authenticated RESTRICT;
  REVOKE MAINTAIN ON TABLE public.products, public.products_checkout FROM anon RESTRICT;

  IF EXISTS (
    SELECT 1 FROM unnest(ARRAY['profiles','products','products_checkout']) t
    CROSS JOIN unnest(ARRAY['authenticated','anon']) r
    CROSS JOIN unnest(ARRAY['TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
    WHERE (r='authenticated' OR (p='MAINTAIN' AND t IN ('products','products_checkout')))
      AND pg_catalog.has_table_privilege(r,'public.'||t,p)
  ) THEN RAISE EXCEPTION 'V448: forbidden effective privilege remains'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['profiles','products','products_checkout']) t
    WHERE pg_catalog.has_any_column_privilege('authenticated','public.'||t,'REFERENCES')) THEN
    RAISE EXCEPTION 'V448: effective column REFERENCES remains';
  END IF;
  SELECT jsonb_agg(jsonb_build_array(t,r,p,pg_catalog.has_table_privilege(r,'public.'||t,p)) ORDER BY t,r,p)
  INTO after_rights FROM unnest(ARRAY['profiles','products','products_checkout']) t
  CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
  CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
  WHERE NOT ((r='authenticated' AND p IN ('TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'))
    OR (r='anon' AND p='MAINTAIN' AND t IN ('products','products_checkout')));
  IF before_rights IS DISTINCT FROM after_rights THEN
    RAISE EXCEPTION 'V448: non-target privileges changed';
  END IF;
END
$audit$;
COMMIT;
