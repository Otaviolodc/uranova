BEGIN;

-- Remove apenas a automação criada na intervenção anterior.
DROP TRIGGER IF EXISTS trg_financial_transaction_sale ON public.financial_transactions;
DROP FUNCTION IF EXISTS public.sync_sale_financial_balance();
DROP FUNCTION IF EXISTS public.record_financial_sale(uuid, uuid, numeric, text);

-- Antes desta intervenção balance_releases estava vazio. Removemos somente
-- os releases criados pela intervenção anterior.
DELETE FROM public.balance_releases;

-- Restaura exatamente o snapshot capturado antes da intervenção.
UPDATE public.balances b
SET
  available_balance = s.available_balance,
  pending_balance = s.pending_balance,
  total_earned = s.total_earned,
  total_withdrawn = s.total_withdrawn,
  updated_at = now()
FROM public.financial_balance_audit_snapshots s
WHERE s.user_id = b.user_id
  AND s.captured_at = (
    SELECT MAX(s2.captured_at)
    FROM public.financial_balance_audit_snapshots s2
    WHERE s2.user_id = b.user_id
  );

-- O ledger antigo permanece somente como histórico por enquanto.
-- A RPC continua sem acesso público.
REVOKE ALL ON FUNCTION public.process_financial_transaction(uuid, uuid, text, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_financial_transaction(uuid, uuid, text, numeric, text) TO service_role;

-- A integridade de uma venda continua protegida contra duplicação.
CREATE UNIQUE INDEX IF NOT EXISTS financial_transactions_sale_order_unique
  ON public.financial_transactions (order_id)
  WHERE type='sale' AND order_id IS NOT NULL;

COMMIT;
