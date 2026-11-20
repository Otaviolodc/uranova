import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const migration=readFileSync(new URL('../supabase/archive/20261120011844_financial_auxiliary_acl_v446.sql',import.meta.url),'utf8');
async function database() {
  const db=new PGlite();
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role;
    GRANT USAGE ON SCHEMA public TO authenticated,anon,service_role;
    CREATE TABLE profiles(id integer PRIMARY KEY);
    CREATE TABLE products(id integer PRIMARY KEY);
    CREATE TABLE products_checkout(id integer PRIMARY KEY,product_id integer REFERENCES products(id),touched boolean DEFAULT false);
    GRANT ALL ON profiles,products,products_checkout TO authenticated,service_role;
    REVOKE DELETE ON profiles FROM authenticated;
    GRANT SELECT ON products TO anon;
    CREATE FUNCTION public.mark_checkout() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN NEW.touched=true; RETURN NEW; END $$;
    CREATE TRIGGER mark_checkout BEFORE INSERT ON products_checkout FOR EACH ROW EXECUTE FUNCTION public.mark_checkout();`);
  return db;
}
const privilege=(db,role,table,p)=>db.query('SELECT has_table_privilege($1,$2,$3) allowed',[role,table,p]).then(r=>r.rows[0].allowed);
async function dml(db) {
  return (await db.query(`SELECT t,r,p,has_table_privilege(r,t,p) allowed
    FROM unnest(ARRAY['profiles','products','products_checkout']) t
    CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
    CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) p ORDER BY t,r,p`)).rows;
}
test('V446: only nine target privileges removed, DML and service role preserved; repeat safe',async()=>{
  const db=await database();
  try {
    const before=await dml(db);
    await db.exec(migration);await db.exec(migration);
    assert.deepEqual(await dml(db),before);
    for(const table of ['profiles','products','products_checkout']) for(const p of ['TRUNCATE','REFERENCES','TRIGGER']) {
      assert.equal(await privilege(db,'authenticated',table,p),false);
      assert.equal(await privilege(db,'service_role',table,p),true);
    }
    await db.exec('SET ROLE authenticated; INSERT INTO products VALUES(1); INSERT INTO products_checkout(id,product_id) VALUES(1,1); RESET ROLE;');
    assert.equal((await db.query('SELECT touched FROM products_checkout')).rows[0].touched,true);
    await assert.rejects(db.exec('INSERT INTO products_checkout(id,product_id) VALUES(2,999)'),/foreign key/i);
  } finally {await db.close();}
});
for(const source of ['public','inherited','set-role-only']) test(`V446: ${source} grant aborts atomically`,async()=>{
  const db=await database();
  try {
    if(source==='public') await db.exec('GRANT TRUNCATE ON products TO PUBLIC');
    else {
      await db.exec('CREATE ROLE legacy_writer; GRANT TRUNCATE ON products TO legacy_writer');
      await db.exec(source==='inherited'?'GRANT legacy_writer TO authenticated':'GRANT legacy_writer TO authenticated WITH INHERIT FALSE');
    }
    const before=await dml(db);
    await assert.rejects(db.exec(migration),/PUBLIC or membership/);
    await db.exec('ROLLBACK');
    assert.deepEqual(await dml(db),before);
    assert.equal(await privilege(db,'authenticated','profiles','TRIGGER'),true);
  } finally {await db.close();}
});
test('V446: dependent grant prevents cascade and preserves original rights',async()=>{
  const db=await database();
  try {
    await db.exec('CREATE ROLE downstream; GRANT TRIGGER ON products TO authenticated WITH GRANT OPTION; SET ROLE authenticated; GRANT TRIGGER ON products TO downstream; RESET ROLE;');
    await assert.rejects(db.exec(migration),/dependent privileges/i);
    await db.exec('ROLLBACK');
    assert.equal(await privilege(db,'authenticated','products','TRIGGER'),true);
    assert.equal(await privilege(db,'downstream','products','TRIGGER'),true);
  } finally {await db.close();}
});
test('V446: inherited legitimate DML does not block targeted revocation',async()=>{
  const db=await database();
  try {
    await db.exec('CREATE ROLE reader; GRANT SELECT ON products TO reader; GRANT reader TO authenticated');
    const before=await dml(db);await db.exec(migration);
    assert.deepEqual(await dml(db),before);
  } finally {await db.close();}
});
test('V446: read-only preflight detects synthetic duplicates without emitting identifiers',async()=>{
  const db=new PGlite();
  try {
    await db.exec(readFileSync(new URL('./fixtures/finance-schema.sql',import.meta.url),'utf8'));
    await db.exec(`INSERT INTO profiles(id,stripe_account_id) VALUES
      ('00000000-0000-4000-8000-000000000005','acct_seller'),
      ('00000000-0000-4000-8000-000000000006',NULL),
      ('00000000-0000-4000-8000-000000000007','');
      INSERT INTO customer_products(customer_id,product_id) VALUES
      ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003'),
      ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003');`);
    const query=readFileSync(new URL('../docs/sql/BUILD-V4.46-PREFLIGHT.sql',import.meta.url),'utf8');
    await db.exec('BEGIN READ ONLY');
    const results=await db.exec(query);
    await db.exec('ROLLBACK');
    const duplicateResults=results.filter(r=>r.rows[0]?.duplicate_groups!==undefined);
    assert.equal(duplicateResults.length,2);
    for(const result of duplicateResults) {
      assert.equal(Number(result.rows[0].duplicate_groups),1);
      assert.equal(Number(Object.values(result.rows[0])[1]),2);
      assert.equal(Number(Object.values(result.rows[0])[2]),1);
    }
    assert.equal(Number(results.find(r=>r.rows[0]?.malformed_nonnull!==undefined).rows[0].malformed_nonnull),1);
  } finally {await db.close();}
});
