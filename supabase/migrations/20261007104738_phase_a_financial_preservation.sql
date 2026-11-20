-- Phase A: preserve all existing financial rows. No production DELETE or UPDATE.
-- Transactional DDL: failure rolls back the entire migration.
SET LOCAL lock_timeout = '5s';
CREATE SCHEMA IF NOT EXISTS account_security;
REVOKE ALL ON SCHEMA account_security FROM PUBLIC, anon, authenticated;
CREATE TABLE public.financial_identities (
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_identities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.financial_identities FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.financial_identities TO service_role;
INSERT INTO public.financial_identities(id) SELECT id FROM public.profiles;
CREATE FUNCTION account_security.ensure_financial_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.financial_identities(id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION account_security.ensure_financial_identity() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER phase_a_financial_identity BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION account_security.ensure_financial_identity();

CREATE FUNCTION account_security.deny_hard_delete() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 RAISE EXCEPTION USING ERRCODE='23503', MESSAGE='Account deletion unavailable: preservation review required';
END $$;
REVOKE ALL ON FUNCTION account_security.deny_hard_delete() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER phase_a_deny_auth_delete BEFORE DELETE ON auth.users
FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_deny_profile_delete BEFORE DELETE ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_deny_identity_delete BEFORE DELETE ON public.financial_identities
FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
-- Fail the OLD non-atomic API at its FIRST destructive request, even before app deploy.
REVOKE DELETE ON public.analytics FROM service_role;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.balances'::regclass AND conname='balances_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: balances_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.balances DROP CONSTRAINT balances_user_id_fkey,
 ADD CONSTRAINT balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.financial_transactions'::regclass AND conname='financial_transactions_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: financial_transactions_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.financial_transactions DROP CONSTRAINT financial_transactions_user_id_fkey,
 ADD CONSTRAINT financial_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.financial_transactions'::regclass AND conname='financial_transactions_order_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL' )
 THEN RAISE EXCEPTION 'Unexpected constraint: financial_transactions_order_id_fkey'; END IF;
END $$;
ALTER TABLE public.financial_transactions DROP CONSTRAINT financial_transactions_order_id_fkey,
 ADD CONSTRAINT financial_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.financial_transactions'::regclass AND conname='financial_transactions_withdrawal_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (withdrawal_id) REFERENCES withdraw_requests(id) ON DELETE SET NULL' )
 THEN RAISE EXCEPTION 'Unexpected constraint: financial_transactions_withdrawal_id_fkey'; END IF;
END $$;
ALTER TABLE public.financial_transactions DROP CONSTRAINT financial_transactions_withdrawal_id_fkey,
 ADD CONSTRAINT financial_transactions_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES withdraw_requests(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.withdraw_requests'::regclass AND conname='withdraw_requests_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: withdraw_requests_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.withdraw_requests DROP CONSTRAINT withdraw_requests_user_id_fkey,
 ADD CONSTRAINT withdraw_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.withdrawals'::regclass AND conname='withdrawals_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: withdrawals_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.withdrawals DROP CONSTRAINT withdrawals_user_id_fkey,
 ADD CONSTRAINT withdrawals_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: profiles_id_fkey'; END IF;
END $$;
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey,
 ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.support_bugs'::regclass AND conname='support_bugs_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: support_bugs_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.support_bugs DROP CONSTRAINT support_bugs_user_id_fkey,
 ADD CONSTRAINT support_bugs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.support_feedback'::regclass AND conname='support_feedback_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: support_feedback_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.support_feedback DROP CONSTRAINT support_feedback_user_id_fkey,
 ADD CONSTRAINT support_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.support_messages'::regclass AND conname='support_messages_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: support_messages_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.support_messages DROP CONSTRAINT support_messages_user_id_fkey,
 ADD CONSTRAINT support_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.support_suggestions'::regclass AND conname='support_suggestions_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: support_suggestions_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.support_suggestions DROP CONSTRAINT support_suggestions_user_id_fkey,
 ADD CONSTRAINT support_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.customer_products'::regclass AND conname='customer_products_customer_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: customer_products_customer_id_fkey'; END IF;
END $$;
ALTER TABLE public.customer_products DROP CONSTRAINT customer_products_customer_id_fkey,
 ADD CONSTRAINT customer_products_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.customer_products'::regclass AND conname='customer_products_product_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: customer_products_product_id_fkey'; END IF;
END $$;
ALTER TABLE public.customer_products DROP CONSTRAINT customer_products_product_id_fkey,
 ADD CONSTRAINT customer_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.customer_products'::regclass AND conname='customer_products_order_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL' )
 THEN RAISE EXCEPTION 'Unexpected constraint: customer_products_order_id_fkey'; END IF;
END $$;
ALTER TABLE public.customer_products DROP CONSTRAINT customer_products_order_id_fkey,
 ADD CONSTRAINT customer_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.subscriptions'::regclass AND conname='subscriptions_user_id_fkey'
 AND pg_get_constraintdef(oid)='FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE' )
 THEN RAISE EXCEPTION 'Unexpected constraint: subscriptions_user_id_fkey'; END IF;
END $$;
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_user_id_fkey,
 ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.profiles ADD CONSTRAINT phase_a_profiles_identity_fk FOREIGN KEY (id) REFERENCES public.financial_identities(id) ON DELETE RESTRICT;
ALTER TABLE public.orders ADD CONSTRAINT phase_a_orders_identity_fk FOREIGN KEY (user_id) REFERENCES public.financial_identities(id) ON DELETE RESTRICT;
ALTER TABLE public.payments ADD CONSTRAINT phase_a_payments_identity_fk FOREIGN KEY (user_id) REFERENCES public.financial_identities(id) ON DELETE RESTRICT;
ALTER TABLE public.balance_releases ADD CONSTRAINT phase_a_balance_releases_identity_fk FOREIGN KEY (user_id) REFERENCES public.financial_identities(id) ON DELETE RESTRICT;
ALTER TABLE public.financial_balance_audit_snapshots ADD CONSTRAINT phase_a_financial_balance_audit_snapshots_identity_fk FOREIGN KEY (user_id) REFERENCES public.financial_identities(id) ON DELETE RESTRICT;
-- Ledger/evidence retention: deny even service-role accidental deletes in Phase A.
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.orders FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.payments FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.balances FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.financial_transactions FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.financial_balance_audit_snapshots FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.balance_releases FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.withdraw_requests FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.withdrawals FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.stripe_webhook_events FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.customer_products FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.support_messages FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.support_bugs FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.support_feedback FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
CREATE TRIGGER phase_a_preserve_rows BEFORE DELETE ON public.support_suggestions FOR EACH STATEMENT EXECUTE FUNCTION account_security.deny_hard_delete();
