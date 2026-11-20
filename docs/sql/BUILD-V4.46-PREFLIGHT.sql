-- Read-only diagnostics. No financial RPC calls, no identifiers/customer rows emitted.
-- Execute only after separate authorization for the intended environment.
SELECT c.relname,coalesce(r.rolname,'PUBLIC') grantee,
  pg_catalog.pg_get_userbyid(a.grantor) grantor,a.privilege_type,a.is_grantable,
  CASE WHEN a.grantee=0 THEN true ELSE pg_catalog.pg_has_role('authenticated',a.grantee,'MEMBER') END reachable_by_membership,
  CASE WHEN a.grantee=0 THEN true ELSE pg_catalog.pg_has_role('authenticated',a.grantee,'USAGE') END inherited_now
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
LEFT JOIN pg_catalog.pg_roles r ON r.oid=a.grantee
WHERE n.nspname='public' AND c.relname IN ('profiles','products','products_checkout')
ORDER BY c.relname,grantee,a.privilege_type;

SELECT parent.rolname granted_role,child.rolname member_role,
       m.inherit_option,m.set_option,m.admin_option
FROM pg_catalog.pg_auth_members m
JOIN pg_catalog.pg_roles parent ON parent.oid=m.roleid
JOIN pg_catalog.pg_roles child ON child.oid=m.member
WHERE child.rolname='authenticated' OR pg_catalog.pg_has_role('authenticated',m.member,'MEMBER');

SELECT t,r,p,pg_catalog.has_table_privilege(r,'public.'||t,p) allowed
FROM unnest(ARRAY['profiles','products','products_checkout']) t
CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p
ORDER BY t,r,p;

-- Aggregate duplicate groups without exposing account IDs or profile IDs.
SELECT count(*) duplicate_groups,coalesce(sum(n),0) affected_profiles,
       coalesce(sum(n-1),0) excess_profiles
FROM (SELECT count(*) n FROM public.profiles WHERE stripe_account_id IS NOT NULL
      GROUP BY stripe_account_id HAVING count(*)>1) d;
SELECT count(*) FILTER (WHERE stripe_account_id IS NOT NULL AND stripe_account_id !~ '^acct_[A-Za-z0-9]+$') malformed_nonnull
FROM public.profiles;

SELECT count(*) duplicate_groups,coalesce(sum(n),0) affected_entitlements,
       coalesce(sum(n-1),0) excess_entitlements
FROM (SELECT count(*) n FROM public.customer_products
      GROUP BY customer_id,product_id HAVING count(*)>1) d;

SELECT i.indexrelid::regclass::text index_name,i.indisunique,i.indisvalid,i.indisready,
       pg_catalog.pg_get_indexdef(i.indexrelid) definition
FROM pg_catalog.pg_index i WHERE i.indrelid IN ('public.profiles'::regclass,'public.customer_products'::regclass);

-- Inspect existing FK/trigger dependencies; revocation does not drop them.
SELECT conrelid::regclass::text source,confrelid::regclass::text target,conname,convalidated
FROM pg_catalog.pg_constraint WHERE contype='f'
 AND confrelid IN ('public.profiles'::regclass,'public.products'::regclass,'public.products_checkout'::regclass);
SELECT tgrelid::regclass::text table_name,tgname,tgenabled,tgfoid::regprocedure::text function_name
FROM pg_catalog.pg_trigger WHERE NOT tgisinternal
 AND tgrelid IN ('public.profiles'::regclass,'public.products'::regclass,'public.products_checkout'::regclass,'public.customer_products'::regclass);

-- Review any additional privileged writer by name first (do not emit function source/secrets).
SELECT n.nspname,p.proname,pg_catalog.pg_get_function_identity_arguments(p.oid) arguments
FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname IN ('public','account_security') AND p.prokind='f'
 AND p.prosrc ILIKE '%customer_products%';
