-- Generated migration content; moved into migrations after CLI scaffolding.
BEGIN;
DO $$
DECLARE old_job boolean;
BEGIN
  IF to_regclass('cron.job') IS NOT NULL THEN
    EXECUTE 'SELECT EXISTS(SELECT 1 FROM cron.job WHERE active AND command ~ ''release_due_balances|process_financial_transaction|record_financial_sale'')' INTO old_job;
    IF old_job THEN RAISE EXCEPTION 'Active legacy financial cron: review before cutover'; END IF;
  END IF;
END $$;

-- No inferred backfill. Existing financial records remain untouched and unverified.
ALTER TABLE public.payments
  ADD COLUMN finance_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN stripe_account_id text,
  ADD COLUMN stripe_checkout_session_id text,
  ADD COLUMN stripe_charge_id text,
  ADD COLUMN stripe_balance_transaction_id text,
  ADD COLUMN order_id uuid REFERENCES public.orders(id),
  ADD COLUMN customer_id uuid REFERENCES public.profiles(id),
  ADD COLUMN product_id uuid REFERENCES public.products(id),
  ADD COLUMN gross_cents bigint,
  ADD COLUMN platform_fee_cents bigint,
  ADD COLUMN stripe_fee_cents bigint,
  ADD COLUMN producer_net_cents bigint,
  ADD COLUMN currency text,
  ADD COLUMN available_on timestamptz,
  ADD COLUMN paid_at timestamptz,
  ADD COLUMN stripe_evidence jsonb,
  ADD COLUMN reconciliation_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.payments ADD CONSTRAINT verified_payment_integrity CHECK (
  NOT finance_verified OR (
    stripe_account_id IS NOT NULL AND stripe_checkout_session_id IS NOT NULL AND
    payment_provider_id IS NOT NULL AND stripe_charge_id IS NOT NULL AND
    stripe_balance_transaction_id IS NOT NULL AND order_id IS NOT NULL AND customer_id IS NOT NULL AND
    product_id IS NOT NULL AND currency IS NOT NULL AND currency = 'brl' AND
    gross_cents IS NOT NULL AND gross_cents > 0 AND
    platform_fee_cents IS NOT NULL AND platform_fee_cents = (gross_cents + 5) / 10 AND
    stripe_fee_cents IS NOT NULL AND stripe_fee_cents >= 0 AND
    producer_net_cents IS NOT NULL AND producer_net_cents >= 0 AND
    gross_cents = platform_fee_cents + stripe_fee_cents + producer_net_cents AND
    stripe_evidence IS NOT NULL AND coalesce(stripe_evidence->>'livemode' = 'true',false) AND
    coalesce(status='PAID' AND value*100=gross_cents AND original_value*100=gross_cents AND
      final_value*100=producer_net_cents AND platform_fee*100=platform_fee_cents AND
      stripe_fee*100=stripe_fee_cents AND net_value*100=platform_fee_cents,false) AND
    available_on IS NOT NULL AND paid_at IS NOT NULL));
CREATE UNIQUE INDEX payments_session_unique ON public.payments(stripe_checkout_session_id);
CREATE UNIQUE INDEX payments_order_unique ON public.payments(order_id);
CREATE UNIQUE INDEX payments_charge_unique ON public.payments(stripe_charge_id);
CREATE UNIQUE INDEX payments_transaction_unique ON public.payments(stripe_balance_transaction_id);
CREATE INDEX payments_verified_seller ON public.payments(user_id,paid_at) WHERE finance_verified;
ALTER TABLE public.orders ADD COLUMN stripe_payment_intent_id text UNIQUE,
  ADD COLUMN stripe_checkout_session_id text UNIQUE;

-- Snapshot incompatible legacy projections before replacing their meaning.
ALTER TABLE public.balances ADD COLUMN legacy_snapshot jsonb,
  ADD COLUMN stripe_account_id text,
  ADD COLUMN pending_payout numeric NOT NULL DEFAULT 0,
  ADD COLUMN stripe_available_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN sync_token uuid,
  ADD COLUMN sync_until timestamptz,
  ADD COLUMN synced_at timestamptz,
  ADD COLUMN reconciliation_required boolean NOT NULL DEFAULT true;
UPDATE public.balances SET legacy_snapshot = jsonb_build_object(
  'available_balance',available_balance,'pending_balance',pending_balance,
  'total_earned',total_earned,'total_withdrawn',total_withdrawn,'captured_at',now()),
  available_balance=0,pending_balance=0,total_earned=0,total_withdrawn=0;
ALTER TABLE public.balances ADD CONSTRAINT nonnegative_finance_balance CHECK (
  available_balance >= 0 AND pending_balance >= 0 AND pending_payout >= 0 AND total_withdrawn >= 0);
ALTER TABLE public.withdrawals ADD COLUMN stripe_payout_id text UNIQUE,
  ADD COLUMN stripe_account_id text,
  ADD COLUMN request_key uuid UNIQUE,
  ADD COLUMN amount_cents bigint,
  ADD COLUMN stripe_status text,
  ADD COLUMN stripe_evidence jsonb,
  ADD COLUMN last_synced_at timestamptz;
CREATE INDEX withdrawals_seller_status ON public.withdrawals(user_id,status);
ALTER TABLE public.withdrawals ADD CONSTRAINT payout_cents_valid CHECK (amount_cents IS NULL OR amount_cents > 0);
ALTER TABLE public.stripe_webhook_events ADD COLUMN stripe_account_id text,
  ADD COLUMN lease_token uuid, ADD COLUMN lease_until timestamptz,
  ADD COLUMN attempts integer NOT NULL DEFAULT 0, ADD COLUMN last_error text;

-- Old RPCs must not move balances after the cutover. No CASCADE.
DROP FUNCTION IF EXISTS public.process_financial_transaction(uuid,uuid,text,numeric,text);
DROP FUNCTION IF EXISTS public.release_due_balances();

-- All mutations and internal RPCs are service_role-only, even if RLS policies drift.
REVOKE ALL ON public.payments,public.balances,public.withdrawals,public.stripe_webhook_events,
  public.financial_transactions,public.balance_releases,public.withdraw_requests FROM PUBLIC,anon,authenticated;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.orders,public.customer_products FROM PUBLIC,anon,authenticated;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.payments,public.orders,public.customer_products,public.balances,public.withdrawals,public.stripe_webhook_events TO service_role;

-- Prevent owner-editable profile fields from changing authorization or money routing.
CREATE FUNCTION public.guard_financial_profile() RETURNS trigger LANGUAGE plpgsql
SET search_path = '' AS $$
BEGIN
  IF current_user IN ('anon','authenticated') THEN
    IF TG_OP='INSERT' THEN
      IF coalesce(NEW.role,'user') <> 'user' OR NEW.stripe_account_id IS NOT NULL OR
         coalesce((to_jsonb(NEW)->>'is_pro')::boolean,false) OR
         to_jsonb(NEW)->>'stripe_customer_id' IS NOT NULL OR
         coalesce(to_jsonb(NEW)->>'subscription_plan','free') <> 'free' OR
         coalesce(to_jsonb(NEW)->>'subscription_status','free') <> 'free' OR
         to_jsonb(NEW)->>'subscription_end_date' IS NOT NULL THEN
        RAISE EXCEPTION 'Protected profile fields';
      END IF;
    ELSIF NEW.id IS DISTINCT FROM OLD.id OR NEW.role IS DISTINCT FROM OLD.role OR
          NEW.stripe_account_id IS DISTINCT FROM OLD.stripe_account_id OR
          to_jsonb(NEW)->'is_pro' IS DISTINCT FROM to_jsonb(OLD)->'is_pro' OR
          to_jsonb(NEW)->'stripe_customer_id' IS DISTINCT FROM to_jsonb(OLD)->'stripe_customer_id' OR
          to_jsonb(NEW)->'subscription_plan' IS DISTINCT FROM to_jsonb(OLD)->'subscription_plan' OR
          to_jsonb(NEW)->'subscription_status' IS DISTINCT FROM to_jsonb(OLD)->'subscription_status' OR
          to_jsonb(NEW)->'subscription_end_date' IS DISTINCT FROM to_jsonb(OLD)->'subscription_end_date' THEN
      RAISE EXCEPTION 'Protected profile fields';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER financial_profile_guard BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_financial_profile();

CREATE FUNCTION public.claim_stripe_event(p_id text,p_type text,p_account text,p_token uuid)
RETURNS text LANGUAGE plpgsql SET search_path='' AS $$
DECLARE e public.stripe_webhook_events;
BEGIN
  INSERT INTO public.stripe_webhook_events(event_id,event_type,stripe_account_id,status)
    VALUES(p_id,p_type,p_account,'processing') ON CONFLICT(event_id) DO NOTHING;
  SELECT * INTO e FROM public.stripe_webhook_events WHERE event_id=p_id FOR UPDATE;
  IF e.status='processed' THEN RETURN 'processed'; END IF;
  IF e.lease_until > now() THEN RETURN 'busy'; END IF;
  UPDATE public.stripe_webhook_events SET lease_token=p_token,lease_until=now()+interval '3 minutes',
    attempts=attempts+1,status='processing',last_error=NULL WHERE event_id=p_id;
  RETURN 'claimed';
END $$;

CREATE FUNCTION public.finish_stripe_event(p_id text,p_token uuid,p_error text DEFAULT NULL)
RETURNS void LANGUAGE sql SET search_path='' AS $$
  UPDATE public.stripe_webhook_events SET status=CASE WHEN p_error IS NULL THEN 'processed' ELSE 'failed' END,
    processed_at=CASE WHEN p_error IS NULL THEN now() ELSE NULL END,
    last_error=left(p_error,1000),lease_until=NULL
    WHERE event_id=p_id AND lease_token=p_token;
$$;

CREATE FUNCTION public.settle_stripe_sale(p jsonb) RETURNS uuid LANGUAGE plpgsql SET search_path='' AS $$
DECLARE
  seller uuid := (p->>'seller_id')::uuid;
  buyer uuid := (p->>'customer_id')::uuid;
  product uuid := (p->>'product_id')::uuid;
  gross bigint := (p->>'gross')::bigint;
  fee bigint := (p->>'platform_fee')::bigint;
  stripe_fee bigint := (p->>'stripe_fee')::bigint;
  net bigint := (p->>'producer_net')::bigint;
  payment public.payments;
  order_uuid uuid;
  payment_uuid uuid;
BEGIN
  IF p->>'livemode' IS DISTINCT FROM 'true' OR p->>'currency' IS DISTINCT FROM 'brl' OR
     gross IS NULL OR gross <= 0 OR fee IS NULL OR fee <= 0 OR fee <> (gross+5)/10 OR
     stripe_fee IS NULL OR stripe_fee < 0 OR net IS NULL OR net < 0 OR gross <> fee+stripe_fee+net THEN
    RAISE EXCEPTION 'Invalid verified settlement';
  END IF;
  -- Same seller lock also serializes access grants, projections, and payout reservations.
  PERFORM pg_advisory_xact_lock(hashtextextended(seller::text,0));
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=seller AND stripe_account_id=p->>'account_id') OR
     NOT EXISTS(SELECT 1 FROM public.products_checkout c JOIN public.products pr ON pr.id=c.product_id
       WHERE c.id=(p->>'checkout_id')::uuid AND c.product_id=product AND c.user_id=seller AND pr.user_id=seller) OR
     NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=buyer) THEN
    RAISE EXCEPTION 'Invalid product, buyer or account';
  END IF;
  SELECT * INTO payment FROM public.payments WHERE payment_provider_id=p->>'intent_id'
    OR stripe_checkout_session_id=p->>'session_id';
  IF FOUND THEN
    IF NOT payment.finance_verified THEN RAISE EXCEPTION 'Legacy payment requires explicit reconciliation'; END IF;
    IF payment.user_id IS DISTINCT FROM seller OR payment.customer_id IS DISTINCT FROM buyer OR
       payment.product_id IS DISTINCT FROM product OR payment.stripe_account_id IS DISTINCT FROM p->>'account_id' OR
       payment.stripe_checkout_session_id IS DISTINCT FROM p->>'session_id' OR
       payment.payment_provider_id IS DISTINCT FROM p->>'intent_id' OR payment.gross_cents IS DISTINCT FROM gross OR
       payment.platform_fee_cents IS DISTINCT FROM fee OR payment.stripe_fee_cents IS DISTINCT FROM stripe_fee OR
       payment.stripe_charge_id IS DISTINCT FROM p->>'charge_id' OR
       payment.stripe_balance_transaction_id IS DISTINCT FROM p->>'transaction_id' THEN
      RAISE EXCEPTION 'Conflicting duplicate payment';
    END IF;
    RETURN payment.id;
  END IF;
  INSERT INTO public.orders(user_id,product_id,amount,customer_name,customer_email,status,
    stripe_payment_intent_id,stripe_checkout_session_id)
  VALUES(seller,product,gross::numeric/100,p->>'customer_name',p->>'customer_email','PAID',p->>'intent_id',p->>'session_id')
  RETURNING id INTO order_uuid;
  INSERT INTO public.payments(user_id,payment_provider_id,status,value,original_value,final_value,platform_fee,
    platform_fee_percent,stripe_fee,net_value,customer_name,customer_email,finance_verified,stripe_account_id,
    stripe_checkout_session_id,stripe_charge_id,stripe_balance_transaction_id,order_id,customer_id,product_id,
    gross_cents,platform_fee_cents,stripe_fee_cents,producer_net_cents,currency,available_on,paid_at,stripe_evidence)
  VALUES(seller,p->>'intent_id','PAID',gross::numeric/100,gross::numeric/100,net::numeric/100,fee::numeric/100,
    10,stripe_fee::numeric/100,fee::numeric/100,p->>'customer_name',p->>'customer_email',true,p->>'account_id',
    p->>'session_id',p->>'charge_id',p->>'transaction_id',order_uuid,buyer,product,gross,fee,stripe_fee,net,'brl',
    (p->>'available_on')::timestamptz,(p->>'paid_at')::timestamptz,p) RETURNING id INTO payment_uuid;
  -- Serialize grants for the same buyer even when buying different sellers' products.
  PERFORM pg_advisory_xact_lock(hashtextextended(buyer::text||product::text,1));
  IF NOT EXISTS(SELECT 1 FROM public.customer_products WHERE customer_id=buyer AND product_id=product) THEN
    INSERT INTO public.customer_products(customer_id,product_id,order_id,status) VALUES(buyer,product,order_uuid,'active');
  ELSE
    UPDATE public.customer_products SET status='active',expires_at=NULL
      WHERE customer_id=buyer AND product_id=product;
  END IF;
  INSERT INTO public.balances(user_id,stripe_account_id,total_earned,pending_balance)
    VALUES(seller,p->>'account_id',net::numeric/100,net::numeric/100)
  ON CONFLICT(user_id) DO UPDATE SET total_earned=public.balances.total_earned+net::numeric/100,
    pending_balance=public.balances.pending_balance+net::numeric/100,synced_at=NULL;
  RETURN payment_uuid;
END $$;

-- A reconciliation is a projection, never a new sale. Stripe caps spendable money.
CREATE FUNCTION public.sync_finance_balance(p_user uuid,p_account text,p_available bigint,p_pending bigint,p_started timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path='' AS $$
DECLARE earned bigint; matured bigint; paid bigint; reserved bigint; blocked boolean;
BEGIN
  IF p_available IS NULL OR p_pending IS NULL OR p_started IS NULL THEN RAISE EXCEPTION 'Stripe balance snapshot required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user AND stripe_account_id=p_account) THEN
    RAISE EXCEPTION 'Account mismatch'; END IF;
  INSERT INTO public.balances(user_id,stripe_account_id) VALUES(p_user,p_account) ON CONFLICT(user_id) DO NOTHING;
  IF EXISTS(SELECT 1 FROM public.balances WHERE user_id=p_user AND synced_at>p_started) THEN RETURN; END IF;
  SELECT coalesce(sum(producer_net_cents),0),coalesce(sum(producer_net_cents) FILTER(WHERE available_on<=now()),0)
    INTO earned,matured FROM public.payments WHERE user_id=p_user AND finance_verified;
  SELECT coalesce(sum(amount_cents) FILTER(WHERE status='paid'),0),
    coalesce(sum(amount_cents) FILTER(WHERE status IN ('pending','approved')),0)
    INTO paid,reserved FROM public.withdrawals WHERE user_id=p_user AND amount_cents IS NOT NULL;
  blocked := p_available < 0 OR p_pending < 0 OR paid+reserved>earned OR
    EXISTS(SELECT 1 FROM public.payments WHERE user_id=p_user AND (NOT finance_verified OR reconciliation_required)) OR
    EXISTS(SELECT 1 FROM public.withdrawals WHERE user_id=p_user AND amount_cents IS NULL);
  UPDATE public.balances SET stripe_account_id=p_account,total_earned=earned::numeric/100,
    total_withdrawn=paid::numeric/100,pending_payout=reserved::numeric/100,
    available_balance=CASE WHEN blocked THEN 0 ELSE greatest(0,least(matured-paid-reserved,p_available))::numeric/100 END,
    pending_balance=greatest(0,least(earned-matured,p_pending))::numeric/100,
    stripe_available_cents=greatest(0,p_available),synced_at=p_started,reconciliation_required=blocked,updated_at=now()
    WHERE user_id=p_user;
END $$;

CREATE FUNCTION public.claim_finance_sync(p_user uuid,p_token uuid) RETURNS boolean LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  INSERT INTO public.balances(user_id) VALUES(p_user) ON CONFLICT(user_id) DO NOTHING;
  IF EXISTS(SELECT 1 FROM public.balances WHERE user_id=p_user AND sync_until>now()) THEN RETURN false; END IF;
  UPDATE public.balances SET sync_token=p_token,sync_until=now()+interval '3 minutes',synced_at=NULL,available_balance=0 WHERE user_id=p_user;
  RETURN true;
END $$;

CREATE FUNCTION public.complete_finance_sync(p_user uuid,p_token uuid,p_account text,p_available bigint,p_pending bigint,p_started timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  IF NOT EXISTS(SELECT 1 FROM public.balances WHERE user_id=p_user AND sync_token=p_token AND sync_until>now()) THEN
    RAISE EXCEPTION 'Sync lease expired'; END IF;
  PERFORM public.sync_finance_balance(p_user,p_account,p_available,p_pending,p_started);
  UPDATE public.balances SET sync_token=NULL,sync_until=NULL WHERE user_id=p_user;
END $$;

CREATE FUNCTION public.reserve_stripe_payout(p_user uuid,p_key uuid,p_amount bigint)
RETURNS public.withdrawals LANGUAGE plpgsql SET search_path='' AS $$
DECLARE b public.balances; w public.withdrawals;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  SELECT * INTO w FROM public.withdrawals WHERE request_key=p_key;
  IF FOUND THEN
    IF w.user_id<>p_user OR w.amount_cents<>p_amount THEN RAISE EXCEPTION 'Idempotency conflict'; END IF;
    RETURN w;
  END IF;
  SELECT * INTO b FROM public.balances WHERE user_id=p_user FOR UPDATE;
  IF NOT FOUND OR b.reconciliation_required OR b.synced_at IS NULL OR b.synced_at<now()-interval '2 minutes' OR
    b.sync_until>now() OR p_amount IS NULL OR p_amount<=0 OR p_amount::numeric>b.available_balance*100 OR
    p_amount>b.stripe_available_cents OR
    EXISTS(SELECT 1 FROM public.withdrawals WHERE user_id=p_user AND status IN ('pending','approved')) THEN
    RAISE EXCEPTION 'Insufficient available balance or reconciliation required';
  END IF;
  INSERT INTO public.withdrawals(user_id,amount,amount_cents,request_key,stripe_account_id,status,pix_key,pix_type)
    VALUES(p_user,p_amount::numeric/100,p_amount,p_key,b.stripe_account_id,'pending','stripe','stripe') RETURNING * INTO w;
  UPDATE public.balances SET available_balance=available_balance-p_amount::numeric/100,
    pending_payout=pending_payout+p_amount::numeric/100,stripe_available_cents=stripe_available_cents-p_amount,
    synced_at=NULL WHERE user_id=p_user;
  RETURN w;
END $$;

CREATE FUNCTION public.record_stripe_payout(p_user uuid,p_account text,p jsonb,p_started timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path='' AS $$
DECLARE w public.withdrawals; new_status text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  IF p->>'livemode' IS DISTINCT FROM 'true' OR p->>'currency' IS DISTINCT FROM 'brl' OR
     p->>'id' IS NULL OR p->>'amount' IS NULL OR (p->>'amount')::bigint<=0 OR
     NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user AND stripe_account_id=p_account) THEN
    RAISE EXCEPTION 'Invalid payout'; END IF;
  new_status := CASE p->>'status' WHEN 'paid' THEN 'paid' WHEN 'failed' THEN 'rejected'
    WHEN 'canceled' THEN 'rejected' WHEN 'pending' THEN 'pending' WHEN 'in_transit' THEN 'approved' ELSE NULL END;
  IF new_status IS NULL THEN RAISE EXCEPTION 'Unknown payout status'; END IF;
  SELECT * INTO w FROM public.withdrawals WHERE stripe_payout_id=p->>'id' OR
    (p->'metadata'->>'uranova_withdrawal_id' IS NOT NULL AND id::text=p->'metadata'->>'uranova_withdrawal_id') FOR UPDATE;
  IF FOUND THEN
    IF w.user_id<>p_user OR w.stripe_account_id<>p_account OR w.amount_cents<>(p->>'amount')::bigint OR
       (w.stripe_payout_id IS NOT NULL AND w.stripe_payout_id<>p->>'id') THEN RAISE EXCEPTION 'Payout mismatch'; END IF;
    IF w.last_synced_at>p_started THEN RETURN; END IF;
    UPDATE public.withdrawals SET stripe_payout_id=p->>'id',status=new_status,stripe_status=p->>'status',
      stripe_evidence=p,last_synced_at=p_started,processed_at=CASE WHEN new_status IN ('paid','rejected') THEN now() ELSE NULL END
      WHERE id=w.id;
  ELSE
    INSERT INTO public.withdrawals(user_id,amount,amount_cents,stripe_account_id,stripe_payout_id,status,
      stripe_status,stripe_evidence,last_synced_at,pix_key,pix_type)
    VALUES(p_user,(p->>'amount')::numeric/100,(p->>'amount')::bigint,p_account,p->>'id',new_status,
      p->>'status',p,p_started,'stripe','stripe');
  END IF;
  UPDATE public.balances SET synced_at=NULL,available_balance=0 WHERE user_id=p_user;
END $$;

-- Aggregate in SQL, independent of PostgREST row limits. No unverified orders enter GMV.
CREATE FUNCTION public.finance_summary(p_user uuid DEFAULT NULL) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$
 SELECT jsonb_build_object(
   'gross_cents',coalesce(sum(gross_cents),0), 'platform_fee_cents',coalesce(sum(platform_fee_cents),0),
   'stripe_fee_cents',coalesce(sum(stripe_fee_cents),0),'producer_net_cents',coalesce(sum(producer_net_cents),0),
   'approved_sales',count(*),
   'available_cents',(SELECT coalesce(sum(available_balance*100),0) FROM public.balances WHERE (p_user IS NULL OR user_id=p_user) AND NOT reconciliation_required AND synced_at>now()-interval '5 minutes'),
   'pending_cents',(SELECT coalesce(sum(pending_balance*100),0) FROM public.balances WHERE p_user IS NULL OR user_id=p_user),
   'withdrawn_cents',(SELECT coalesce(sum(amount_cents),0) FROM public.withdrawals WHERE status='paid' AND (p_user IS NULL OR user_id=p_user)),
   'pending_payout_cents',(SELECT coalesce(sum(amount_cents),0) FROM public.withdrawals WHERE status IN ('pending','approved') AND (p_user IS NULL OR user_id=p_user)),
   'unverified_payments',(SELECT count(*) FROM public.payments WHERE NOT finance_verified AND (p_user IS NULL OR user_id=p_user)),
   'failed_events',(SELECT count(*) FROM public.stripe_webhook_events WHERE status='failed' AND (p_user IS NULL OR stripe_account_id=(SELECT stripe_account_id FROM public.profiles WHERE id=p_user))),
   'pending_events',(SELECT count(*) FROM public.stripe_webhook_events WHERE status='processing' AND (p_user IS NULL OR stripe_account_id=(SELECT stripe_account_id FROM public.profiles WHERE id=p_user))),
   'reconciliation_required',EXISTS(SELECT 1 FROM public.balances WHERE (p_user IS NULL OR user_id=p_user) AND (reconciliation_required OR synced_at IS NULL OR synced_at<now()-interval '5 minutes'))
 ) FROM public.payments WHERE finance_verified AND (p_user IS NULL OR user_id=p_user);
$$;

REVOKE ALL ON FUNCTION public.guard_financial_profile(),public.claim_stripe_event(text,text,text,uuid),
  public.finish_stripe_event(text,uuid,text),public.settle_stripe_sale(jsonb),
  public.sync_finance_balance(uuid,text,bigint,bigint,timestamptz),public.reserve_stripe_payout(uuid,uuid,bigint),
  public.record_stripe_payout(uuid,text,jsonb,timestamptz),public.finance_summary(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.claim_finance_sync(uuid,uuid),
  public.complete_finance_sync(uuid,uuid,text,bigint,bigint,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_finance_sync(uuid,uuid),
  public.complete_finance_sync(uuid,uuid,text,bigint,bigint,timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_stripe_event(text,text,text,uuid),public.finish_stripe_event(text,uuid,text),
  public.settle_stripe_sale(jsonb),public.sync_finance_balance(uuid,text,bigint,bigint,timestamptz),
  public.reserve_stripe_payout(uuid,uuid,bigint),public.record_stripe_payout(uuid,text,jsonb,timestamptz),
  public.finance_summary(uuid) TO service_role;
CREATE FUNCTION public.finance_chart(p_user uuid,p_period text DEFAULT '7d') RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$
  WITH series AS (
    SELECT day FROM generate_series(
      CASE WHEN p_period='12m' THEN date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo')-interval '11 months'
      ELSE date_trunc('day',now() AT TIME ZONE 'America/Sao_Paulo') -
        (CASE p_period WHEN '90d' THEN 89 WHEN '30d' THEN 29 ELSE 6 END)*interval '1 day' END,
      now() AT TIME ZONE 'America/Sao_Paulo',CASE WHEN p_period='12m' THEN interval '1 month' ELSE interval '1 day' END) day
  ) SELECT coalesce(jsonb_agg(x ORDER BY x.date),'[]'::jsonb) FROM (
    SELECT to_char(s.day,'YYYY-MM-DD') date,to_char(s.day,CASE WHEN p_period='12m' THEN 'MM/YY' ELSE 'DD/MM' END) label,
      coalesce(sum(p.gross_cents),0)::numeric/100 revenue,count(p.id) sales
    FROM series s LEFT JOIN public.payments p ON p.user_id=p_user AND p.finance_verified AND
      date_trunc(CASE WHEN p_period='12m' THEN 'month' ELSE 'day' END,p.paid_at AT TIME ZONE 'America/Sao_Paulo')=s.day
    GROUP BY s.day
  ) x;
$$;
CREATE FUNCTION public.finance_top_product(p_user uuid) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$
  SELECT to_jsonb(x) FROM (
    SELECT pr.id,pr.title,pr.type,pr.price,count(*) sales,sum(p.gross_cents)::numeric/100 revenue
    FROM public.payments p JOIN public.products pr ON pr.id=p.product_id
    WHERE p.user_id=p_user AND p.finance_verified GROUP BY pr.id ORDER BY count(*) DESC,sum(p.gross_cents) DESC LIMIT 1
  ) x;
$$;
REVOKE ALL ON FUNCTION public.finance_chart(uuid,text),public.finance_top_product(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finance_chart(uuid,text),public.finance_top_product(uuid) TO service_role;
CREATE FUNCTION public.finance_customers(p_user uuid) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$
  SELECT jsonb_build_object('count',(SELECT count(DISTINCT customer_id) FROM public.payments WHERE user_id=p_user AND finance_verified),
    'customers',coalesce((SELECT jsonb_agg(x) FROM (
      SELECT customer_id id,coalesce(max(customer_name),'Cliente') name,coalesce(max(customer_email),'') email,
        count(*) purchases,sum(gross_cents)::numeric/100 total,max(paid_at) "lastPurchase"
      FROM public.payments WHERE user_id=p_user AND finance_verified
      GROUP BY customer_id ORDER BY max(paid_at) DESC LIMIT 500
    )x),'[]'::jsonb));
$$;
REVOKE ALL ON FUNCTION public.finance_customers(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finance_customers(uuid) TO service_role;
COMMIT;

