-- Phase A.1: additive counters only; no existing user, finance or Storage writes.
SET lock_timeout = '5s';
CREATE TABLE account_security.rate_limit_buckets (
 scope text NOT NULL,
 principal text NOT NULL,
 minute_start timestamptz NOT NULL,
 minute_count integer NOT NULL CHECK (minute_count >= 0),
 hour_start timestamptz NOT NULL,
 hour_count integer NOT NULL CHECK (hour_count >= 0),
 expires_at timestamptz NOT NULL,
 PRIMARY KEY(scope,principal)
);
ALTER TABLE account_security.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON account_security.rate_limit_buckets FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA account_security TO service_role;
GRANT SELECT,INSERT,UPDATE,DELETE ON account_security.rate_limit_buckets TO service_role;
CREATE INDEX rate_limit_buckets_expiry ON account_security.rate_limit_buckets(expires_at);

CREATE FUNCTION public.phase_a1_consume_rate_limit(p_scope text,p_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $fn$
DECLARE m integer; h integer; t timestamptz := clock_timestamp();
 ms timestamptz := date_trunc('minute',t); hs timestamptz := date_trunc('hour',t);
 row_count account_security.rate_limit_buckets; retry integer := 0;
BEGIN
 CASE p_scope
 WHEN 'checkout' THEN m:=10;h:=60;
 WHEN 'payout' THEN m:=5;h:=20;
 WHEN 'connect' THEN m:=3;h:=12;
 WHEN 'password' THEN m:=5;h:=20;
 WHEN 'upload' THEN m:=10;h:=100;
 WHEN 'download' THEN m:=30;h:=300;
 WHEN 'ai' THEN m:=5;h:=50;
 WHEN 'sync' THEN m:=5;h:=30;
 WHEN 'tracking' THEN m:=30;h:=300;
 WHEN 'admin' THEN m:=120;h:=1000;
 WHEN 'support' THEN m:=5;h:=30;
 ELSE RAISE EXCEPTION 'Unknown rate scope' USING ERRCODE='22023';
 END CASE;
 IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$' THEN
  RAISE EXCEPTION 'Invalid rate principal' USING ERRCODE='22023';
 END IF;
 -- Bounded pruning is restricted to this new, ephemeral counter table.
 DELETE FROM account_security.rate_limit_buckets WHERE (scope,principal) IN
  (SELECT scope,principal FROM account_security.rate_limit_buckets
   WHERE expires_at<t ORDER BY expires_at LIMIT 32 FOR UPDATE SKIP LOCKED);
 INSERT INTO account_security.rate_limit_buckets AS b
  (scope,principal,minute_start,minute_count,hour_start,hour_count,expires_at)
 VALUES(p_scope,p_key,ms,1,hs,1,t+interval '2 hours')
 ON CONFLICT(scope,principal) DO UPDATE SET
  minute_start=ms,
  minute_count=CASE WHEN b.minute_start=ms THEN least(b.minute_count+1,m+1) ELSE 1 END,
  hour_start=hs,
  hour_count=CASE WHEN b.hour_start=hs THEN least(b.hour_count+1,h+1) ELSE 1 END,
  expires_at=t+interval '2 hours'
 RETURNING * INTO row_count;
 IF row_count.minute_count>m THEN retry:=ceil(extract(epoch FROM ms+interval '1 minute'-t)); END IF;
 IF row_count.hour_count>h THEN retry:=greatest(retry,ceil(extract(epoch FROM hs+interval '1 hour'-t))); END IF;
 RETURN jsonb_build_object('allowed',retry=0,'retry_after',retry);
END
$fn$;
REVOKE ALL ON FUNCTION public.phase_a1_consume_rate_limit(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.phase_a1_consume_rate_limit(text,text) TO service_role;

-- Direct PostgREST support inserts cannot bypass the shared quota.
-- This private trigger needs definer rights only to update the private counters.
CREATE FUNCTION account_security.limit_support_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE verdict jsonb; uid uuid:=auth.uid();
BEGIN
 IF current_setting('role',true) IN ('anon','authenticated') THEN
  IF uid IS NULL OR NEW.user_id IS DISTINCT FROM uid THEN
   RAISE EXCEPTION 'Support ownership required' USING ERRCODE='42501';
  END IF;
  verdict:=public.phase_a1_consume_rate_limit('support',md5(uid::text)||md5('support:'||uid::text));
  IF NOT (verdict->>'allowed')::boolean THEN
   -- PostgREST emits the explicit status and Retry-After header.
   RAISE sqlstate 'PGRST' USING
    message='{"code":"RATE_LIMITED","message":"Too many support requests","details":null,"hint":null}',
    detail=jsonb_build_object('status',429,'headers',jsonb_build_object('Retry-After',verdict->>'retry_after','Cache-Control','no-store'))::text;
  END IF;
 END IF;
 RETURN NEW;
END
$fn$;
REVOKE ALL ON FUNCTION account_security.limit_support_insert() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER phase_a1_support_limit BEFORE INSERT ON public.support_feedback FOR EACH ROW EXECUTE FUNCTION account_security.limit_support_insert();
CREATE TRIGGER phase_a1_support_limit BEFORE INSERT ON public.support_bugs FOR EACH ROW EXECUTE FUNCTION account_security.limit_support_insert();
CREATE TRIGGER phase_a1_support_limit BEFORE INSERT ON public.support_suggestions FOR EACH ROW EXECUTE FUNCTION account_security.limit_support_insert();
CREATE TRIGGER phase_a1_support_limit BEFORE INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION account_security.limit_support_insert();

ALTER FUNCTION public.update_updated_at() SET search_path='';
ALTER FUNCTION public.handle_new_user() SET search_path='';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.increment_clicks(link_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $fn$
BEGIN UPDATE public.links SET clicks=clicks+1 WHERE id=link_id; END
$fn$;
REVOKE EXECUTE ON FUNCTION public.increment_clicks(uuid) FROM PUBLIC,anon,authenticated;
-- public_profiles/public_checkouts retain their reviewed minimal, read-only
-- security_barrier projections. Base-table RLS is intentionally not loosened.
