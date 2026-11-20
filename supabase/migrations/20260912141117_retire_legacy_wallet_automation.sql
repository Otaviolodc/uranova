BEGIN;

-- The final Uranova financial model is Stripe Connect + payments/orders.
-- The legacy internal wallet must not mutate production data anymore.

-- 1. Stop the daily wallet-release cron job.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'release-due-balances') THEN
    PERFORM cron.unschedule('release-due-balances');
  END IF;
END
$do$;

-- 2. Disable the temporary sale trigger created during the audit.
DROP TRIGGER IF EXISTS trg_financial_transaction_sale ON public.financial_transactions;

-- 3. Restore balances exactly to the pre-audit snapshot.
UPDATE public.balances b
SET
  available_balance = s.available_balance,
  pending_balance = s.pending_balance,
  total_earned = s.total_earned,
  total_withdrawn = s.total_withdrawn,
  updated_at = now()
FROM (
  SELECT DISTINCT ON (user_id)
    user_id,
    available_balance,
    pending_balance,
    total_earned,
    total_withdrawn
  FROM public.financial_balance_audit_snapshots
  ORDER BY user_id, captured_at ASC
) s
WHERE b.user_id = s.user_id;

-- 4. Remove only the synthetic releases created by the audit migration.
--    They were never Stripe payouts and are not part of the real ledger.
DELETE FROM public.balance_releases br
WHERE br.order_id IN (
  SELECT ft.order_id
  FROM public.financial_transactions ft
  WHERE ft.type='sale'
    AND ft.order_id IS NOT NULL
);

-- 5. The old RPCs remain as historical schema objects for now, but nobody
--    can execute them except service_role. The application must migrate away
--    from them before the final tables are removed.
REVOKE ALL ON FUNCTION public.process_financial_transaction(uuid, uuid, text, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_financial_sale(uuid, uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_due_balances() FROM PUBLIC, anon, authenticated;

-- 6. Keep service_role blocked from the old release scheduler as an extra
--    guard; Stripe Connect is the source of truth for real balances/payouts.
REVOKE ALL ON FUNCTION public.release_due_balances() FROM service_role;

COMMIT;
