// Local candidate checkout only: never touch the ORIGINAL Git index or create commits.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const git=(...args)=>execFileSync('git',args,{cwd:root});
const head=git('rev-parse','HEAD').toString().trim();
if(head!=='e4b0412802e2136ab281434673fbcd8d70a1a2be') throw Error('Review required: base HEAD changed');
const out=path.join(root,'.local/v451-candidate');
if(fs.existsSync(out))throw Error('Candidate already exists; do not overwrite reviewed evidence');
const tracked=git('ls-tree','-r','--name-only','HEAD').toString().trim().split('\n');
const dirty=git('status','--porcelain=v1','-uall').toString().trimEnd().split('\n').map(s=>({status:s.slice(0,2),file:s.slice(3).replaceAll('\\','/')}));
const old='supabase/migrations/20260913014834_official_finance.sql';
const additions=[
 'src/app/api/stripe/connect/webhook/route.ts','src/lib/security/stripe-webhook.ts',
 'tests/connect-v444.test.mjs','tests/finance-v434.test.mjs','tests/finance-v446.test.mjs',
 'tests/finance-v447-isolated.mjs','tests/finance-v448-isolated.mjs','tests/fixtures/stripe-connect-2026-04-22.mjs',
 'scripts/auth-staging-config.mjs','scripts/prepare-v451-candidate.mjs',
 'docs/phase-2.2a-foundation.sql','docs/BUILD-V4.34-STRIPE-WEBHOOK-ISOLATION.md',
 'docs/sql/BUILD-V4.46-PREFLIGHT.sql','docs/sql/BUILD-V4.48-CHECK.sql',
];
const modifications=['src/app/api/stripe/webhook/route.ts','src/lib/services/payment-processor.ts',
 'tests/processor.test.mjs','tests/staging-isolation.test.mjs','tests/webhook.test.mjs'];
const migrationNames=[
 '20260912141041_repair_financial_flow_foundation.sql','20260912141117_retire_legacy_wallet_automation.sql',
 '20260912141655_rollback_legacy_balance_intervention.sql','20260912141702_disable_legacy_balance_cron.sql',
 '20260912141719_lock_financial_mutation_policies.sql','20260914204949_official_finance.sql',
 '20261007104738_phase_a_financial_preservation.sql','20261007104751_phase_a_access_control.sql',
 '20261007171001_phase_a1_distributed_limits_and_advisors.sql',
];
additions.push(...migrationNames.map(n=>'supabase/migrations/'+n));
const drafts=['20261120011844_financial_auxiliary_acl_v446.sql','20261120013529_financial_auxiliary_acl_v448.sql'];
const canonical='20261120014444_financial_auxiliary_acl_v448.sql';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const privatePath=p=>/(^|\/)(?:\.env[^/]*|\.local|\.vercel|\.git|\.aws|\.codex|\.agents)(\/|$)|\.(?:pem|key|log)$/i.test(p);
const secret=b=>/(?:sk_live_|rk_live_|whsec_)[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(b.toString());
const candidate=new Map();
for(const p of tracked){if(privatePath(p))throw Error('Private tracked path requires review: '+p);candidate.set(p,git('show','HEAD:'+p));}
for(const p of [...additions,...modifications])candidate.set(p,fs.readFileSync(path.join(root,p)));
const original=candidate.get(old);
const replacement=candidate.get('supabase/migrations/20260914204949_official_finance.sql');
const normalize=s=>s.toString().replace(/^\uFEFF/,'').replace(/--[^\r\n]*/g,'').replace(/\s/g,'');
if(normalize(original)!==normalize(replacement))throw Error('Historical migration differs');
candidate.delete(old);
candidate.set('supabase/archive/'+path.basename(old),original);
for(const f of drafts)candidate.set('supabase/archive/'+f,fs.readFileSync('supabase/migrations/'+f));
candidate.set('supabase/migrations/'+canonical,fs.readFileSync('supabase/migrations/'+drafts[1]));
// Point regression tests at preserved drafts or the canonical applied migration.
for(const p of ['tests/finance-v446.test.mjs','tests/finance-v447-isolated.mjs','tests/finance-v448-isolated.mjs']){
 let s=candidate.get(p).toString();
 s=s.replaceAll('../supabase/migrations/'+drafts[0],'../supabase/archive/'+drafts[0]);
 s=s.replaceAll('../supabase/migrations/'+drafts[1],'../supabase/migrations/'+canonical);
 candidate.set(p,Buffer.from(s));
}
// Intentional CommonJS preload; isolated synthetic tests only.
candidate.set('scripts/v451-offline.cjs',Buffer.from('/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS preload requires built-ins synchronously. */\n'+fs.readFileSync('scripts/auth-p02a-offline.cjs','utf8')));
candidate.set('docs/BUILD-V4.51-RECONCILIATION.txt',Buffer.from(`V4.51 candidate, based on ${head}.
Local-only proposed history reconciliation; no remote state changed.
The ten active versions match the remote migration inventory read during V4.51.
All ten normalized SQL bodies matched (comments/whitespace/outer transaction ignored).
The old 20260913014834 finance file is preserved byte-for-byte in supabase/archive.
Its normalized SQL equals 20260914204949, the actual remote version.
V446 and the earlier-timestamp V448 draft are preserved in archive, not executable history.
Canonical applied V448: 20261120014444_financial_auxiliary_acl_v448.sql.
Other environments were NOT inventoried. Do not replay this history elsewhere without review.
No db push, repair, new index, deduplication or financial recovery is authorized.
This candidate has an independent Git checkout/branch at the base SHA, with uncommitted changes.
No commit is created. Review manifest before staging.
No .env or private directory is exported. Tests/build must use synthetic process-only config.
Dependencies for local checks may be shared from the existing node_modules; a fresh npm ci is a separate verification.
`));
const includedSources=new Set([...additions,...modifications,...drafts.map(f=>'supabase/migrations/'+f),'scripts/auth-p02a-offline.cjs']);
const audit=dirty.map(d=>{
 const excluded=privatePath(d.file)||!includedSources.has(d.file);
 const reason=d.file===old?'preserve-from-HEAD-in-archive':privatePath(d.file)?'private-or-log-excluded':includedSources.has(d.file)?'required-selected-source':d.file.startsWith('docs/')?'historical-evidence-or-unrelated-document-excluded':d.file.startsWith('scripts/')?'operational-script-not-required-excluded':d.file.startsWith('lint')?'temporary-lint-output-excluded':'unrelated-artifact-excluded';
 let bytes=null,digest=null,scan='not-read-private-or-binary';
 if(!privatePath(d.file)&&fs.existsSync(d.file)&&/\.(?:sql|ts|tsx|mjs|cjs|ps1|json|md|txt|patch)$/.test(d.file)){
  const b=fs.readFileSync(d.file);bytes=b.length;digest=sha(b);scan=secret(b)?'credential-pattern-review-required':'no-supported-credential-pattern';
  if(!excluded&&secret(b))throw Error('Selected source requires secret review: '+d.file);
 }
 return {...d,decision:reason,bytes,sha256:digest,scan};
});
for(const [p,b] of candidate){if(privatePath(p)||secret(b))throw Error('Candidate privacy gate: '+p);}
fs.mkdirSync(out,{recursive:true});
for(const [p,b] of candidate){const dest=path.join(out,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);}
// Independent repository metadata. Copy objects, no hardlinks and no remote network.
execFileSync('git',['clone','--bare','--no-hardlinks',root,path.join(out,'.git')]);
execFileSync('git',['--git-dir='+path.join(out,'.git'),'config','core.bare','false']);
execFileSync('git',['-C',out,'read-tree','HEAD']);
execFileSync('git',['-C',out,'branch','release/uranova-v451','HEAD']);
execFileSync('git',['-C',out,'symbolic-ref','HEAD','refs/heads/release/uranova-v451']);
const files=[...candidate].sort(([a],[b])=>a.localeCompare(b)).map(([file,b])=>({file,sha256:sha(b),bytes:b.length}));
const changes=[];
for(const {file,sha256} of files){if(!tracked.includes(file))changes.push({action:'add',file,sha256});else if(sha(git('show','HEAD:'+file))!==sha256)changes.push({action:'modify',file,sha256});}
for(const file of tracked)if(!candidate.has(file))changes.push({action:'archive-original',file,destination:'supabase/archive/'+path.basename(file)});
const manifest={baseBranch:git('branch','--show-current').toString().trim(),baseHead:head,
 proposedBranch:'release/uranova-v451',branchCreated:true,commitCreated:false,candidateDirectory:'.local/v451-candidate',
 sourceDigest:sha(Buffer.from(JSON.stringify(files))),commitChanges:changes,candidateFiles:files,
 activeMigrations:[...migrationNames,canonical],audit};
fs.mkdirSync('docs/v451',{recursive:true});
fs.writeFileSync('docs/v451/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({baseHead:head,candidate:out,files:files.length,changes:changes.length,
 auditEntries:audit.length,untrackedFiles:audit.filter(x=>x.status==='??').length,sourceDigest:manifest.sourceDigest}));
