import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
export const baseline=JSON.parse(readFileSync(new URL('./fixtures/phase-a-baseline.json',import.meta.url),'utf8'));
export const A='10000000-0000-4000-8000-000000000001',B='20000000-0000-4000-8000-000000000002',P='30000000-0000-4000-8000-000000000003';
const q=s=>'"'+s.replaceAll('"','""')+'"';
export async function database(){
 const db=new PGlite();
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA auth; CREATE SCHEMA storage;
 CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid LANGUAGE sql VOLATILE AS $$ SELECT gen_random_uuid() $$;
 CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,owner uuid,owner_id text,user_metadata jsonb);
 CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array($1,'/') $$;
 GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;
 GRANT ALL ON storage.objects TO anon,authenticated,service_role;
 ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
 for(const table of new Set(baseline.schema.map(c=>c.table_name))){
  const cols=baseline.schema.filter(c=>c.table_name===table).map(c=>`${q(c.column_name)} ${c.type}${c.default_expr?' DEFAULT '+c.default_expr:''}${c.not_null?' NOT NULL':''}`);
  await db.exec(`CREATE TABLE public.${q(table)} (${cols.join(',')}); ALTER TABLE public.${q(table)} ENABLE ROW LEVEL SECURITY;`);
 }
 for(const c of [...baseline.constraints].sort((a,b)=>(a.contype==='f')-(b.contype==='f')))
  await db.exec(`ALTER TABLE public.${q(c.table_name)} ADD CONSTRAINT ${q(c.conname)} ${c.definition}`);
 for(const i of JSON.parse(readFileSync(new URL('./fixtures/phase-a-indexes.json',import.meta.url),'utf8')))
  if(!baseline.constraints.some(c=>c.conname===i.indexname))await db.exec(i.indexdef);
 for(const f of baseline.functions)await db.exec(f.definition);
 for(const p of baseline.policies)await db.exec(`CREATE POLICY ${q(p.policyname)} ON ${q(p.schemaname)}.${q(p.tablename)} AS ${p.permissive} FOR ${p.cmd} TO ${p.roles.slice(1,-1)}${p.qual?' USING ('+p.qual+')':''}${p.with_check?' WITH CHECK ('+p.with_check+')':''}`);
 for(const g of baseline.grants)if(g.table_schema==='public'||g.table_name==='objects')await db.exec(`GRANT ${g.privilege_type} ON ${q(g.table_schema)}.${q(g.table_name)} TO ${g.grantee}`);
 for(const t of baseline.triggers)if(t.table_name==='auth.users'||!t.table_name.includes('.'))await db.exec(t.definition);
 await db.query('INSERT INTO auth.users(id,email) VALUES ($1,$2),($3,$4)',[A,'a@example.invalid',B,'b@example.invalid']);
 await db.query('INSERT INTO products(id,user_id,title) VALUES($1,$2,$3)',[P,B,'Fixture']);
 await db.query("INSERT INTO payments(user_id,status,finance_verified,value) SELECT $1,'PAID',false,10 FROM generate_series(1,5)",[B]);
 return db;
}
export async function migrate(db){
 for(const name of ['20261007104738_phase_a_financial_preservation','20261007104751_phase_a_access_control'])
  await db.exec('BEGIN;'+readFileSync(new URL('../supabase/migrations/'+name+'.sql',import.meta.url),'utf8')+'COMMIT;');
}
export async function as(db,role,id,sql,params=[]){
 await db.exec('BEGIN');
 try {await db.exec('SET LOCAL ROLE '+role);await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[id??'']);const result=await db.query(sql,params);await db.exec('COMMIT');return result;}
 catch(e){await db.exec('ROLLBACK');throw e;}
}
