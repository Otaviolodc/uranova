-- Read-only preflight AND postflight; capture results before application.
SELECT current_setting('server_version_num')::integer server_version_num,
       current_setting('server_version') server_version;

SELECT t,r,p,pg_catalog.has_table_privilege(r,'public.'||t,p) allowed,
 ((r='authenticated' AND p IN ('TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'))
  OR (r='anon' AND p='MAINTAIN' AND t IN ('products','products_checkout'))) target
FROM unnest(ARRAY['profiles','products','products_checkout']) t
CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
ORDER BY t,r,p;

SELECT c.relname,coalesce(r.rolname,'PUBLIC') grantee,pg_catalog.pg_get_userbyid(a.grantor) grantor,
 a.privilege_type,a.is_grantable
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
LEFT JOIN pg_catalog.pg_roles r ON r.oid=a.grantee
WHERE n.nspname='public' AND c.relname IN ('profiles','products','products_checkout')
ORDER BY 1,2,4;

SELECT parent.rolname granted_role,child.rolname member_role,m.inherit_option,m.set_option,m.admin_option
FROM pg_catalog.pg_auth_members m
JOIN pg_catalog.pg_roles parent ON parent.oid=m.roleid
JOIN pg_catalog.pg_roles child ON child.oid=m.member
WHERE child.rolname IN ('authenticated','anon')
 OR pg_catalog.pg_has_role('authenticated',m.member,'MEMBER')
 OR pg_catalog.pg_has_role('anon',m.member,'MEMBER');

SELECT att.attrelid::regclass::text table_name,att.attname,coalesce(r.rolname,'PUBLIC') grantee,
 a.privilege_type,a.is_grantable
FROM pg_catalog.pg_attribute att CROSS JOIN LATERAL pg_catalog.aclexplode(att.attacl) a
LEFT JOIN pg_catalog.pg_roles r ON r.oid=a.grantee
WHERE att.attrelid IN ('public.profiles'::regclass,'public.products'::regclass,'public.products_checkout'::regclass)
 AND a.privilege_type='REFERENCES';
