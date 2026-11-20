BEGIN;

-- ============================================================
-- 1. PRESERVA O ESTADO ATUAL ANTES DA CORREÇÃO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.financial_balance_audit_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  available_balance numeric NOT NULL,
  pending_balance numeric NOT NULL,
  total_earned numeric NOT NULL,
  total_withdrawn numeric NOT NULL,
  ledger_sales numeric NOT NULL,
  pending_releases numeric NOT NULL,
  released_releases numeric NOT NULL,
  withdrawal_transactions numeric NOT NULL
);

ALTER TABLE public.financial_balance_audit_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.financial_balance_audit_snapshots FROM PUBLIC, anon, authenticated;

INSERT INTO public.financial_balance_audit_snapshots (
  user_id,
  available_balance,
  pending_balance,
  total_earned,
  total_withdrawn,
  ledger_sales,
  pending_releases,
  released_releases,
  withdrawal_transactions
)
SELECT
  b.user_id,
  b.available_balance,
  b.pending_balance,
  b.total_earned,
  b.total_withdrawn,
  COALESCE((SELECT SUM(ft.amount) FROM public.financial_transactions ft WHERE ft.user_id=b.user_id AND ft.type='sale'),0),
  COALESCE((SELECT SUM(br.amount) FROM public.balance_releases br WHERE br.user_id=b.user_id AND br.status='pending'),0),
  COALESCE((SELECT SUM(br.amount) FROM public.balance_releases br WHERE br.user_id=b.user_id AND br.status='released'),0),
  COALESCE((SELECT SUM(ft.amount) FROM public.financial_transactions ft WHERE ft.user_id=b.user_id AND ft.type='withdrawal'),0)
FROM public.balances b;

-- ============================================================
-- 2. UMA VENDA SÓ PODE GERAR UMA TRANSAÇÃO FINANCEIRA
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS financial_transactions_sale_order_unique
  ON public.financial_transactions (order_id)
  WHERE type='sale' AND order_id IS NOT NULL;

-- ============================================================
-- 3. TRIGGER: TODA VENDA REGISTRADA NO LEDGER ATUALIZA SALDO
--    E CRIA SUA LIBERAÇÃO.
--
--    Prazo padrão atual: 7 dias.
--    O prazo fica centralizado aqui e pode ser alterado em
--    uma migration futura sem espalhar regra pelo frontend.
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_sale_financial_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  release_inserted boolean;
BEGIN
  IF NEW.type <> 'sale' THEN
    RETURN NEW;
  END IF;

  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Valor da venda deve ser maior que zero';
  END IF;

  INSERT INTO public.balances (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.balance_releases (
    user_id,
    order_id,
    amount,
    available_at,
    status
  )
  VALUES (
    NEW.user_id,
    NEW.order_id,
    NEW.amount,
    now() + interval '7 days',
    'pending'
  )
  ON CONFLICT (order_id) DO NOTHING;

  GET DIAGNOSTICS release_inserted = ROW_COUNT;

  IF release_inserted THEN
    UPDATE public.balances
    SET
      pending_balance = pending_balance + NEW.amount,
      total_earned = total_earned + NEW.amount,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_financial_transaction_sale ON public.financial_transactions;
CREATE TRIGGER trg_financial_transaction_sale
AFTER INSERT ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.sync_sale_financial_balance();

REVOKE ALL ON FUNCTION public.sync_sale_financial_balance() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_sale_financial_balance() TO service_role;

-- ============================================================
-- 4. NOVA FUNÇÃO EXPLÍCITA PARA REGISTRAR VENDA FINANCEIRA
--    O FRONTEND/SERVIDOR PODERÁ USÁ-LA NO FUTURO.
-- ============================================================
CREATE OR REPLACE FUNCTION public.record_financial_sale(
  p_user_id uuid,
  p_order_id uuid,
  p_amount numeric,
  p_description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_transaction_id uuid;
  v_order_user_id uuid;
  v_order_status text;
BEGIN
  IF p_user_id IS NULL OR p_order_id IS NULL THEN
    RAISE EXCEPTION 'Usuário e pedido são obrigatórios';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor da venda deve ser maior que zero';
  END IF;

  SELECT o.user_id, o.status
  INTO v_order_user_id, v_order_status
  FROM public.orders o
  WHERE o.id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado';
  END IF;

  IF v_order_user_id IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Pedido não pertence ao produtor informado';
  END IF;

  IF upper(COALESCE(v_order_status,'')) <> 'PAID' THEN
    RAISE EXCEPTION 'Pedido não está pago';
  END IF;

  SELECT ft.id
  INTO v_transaction_id
  FROM public.financial_transactions ft
  WHERE ft.order_id = p_order_id
    AND ft.type = 'sale'
  LIMIT 1;

  IF v_transaction_id IS NOT NULL THEN
    RETURN v_transaction_id;
  END IF;

  INSERT INTO public.financial_transactions (
    user_id,
    order_id,
    type,
    amount,
    description
  )
  VALUES (
    p_user_id,
    p_order_id,
    'sale',
    p_amount,
    p_description
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_financial_sale(uuid, uuid, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_financial_sale(uuid, uuid, numeric, text) TO service_role;

-- ============================================================
-- 5. TORNA A RPC ANTIGA SEGURA E COMPATÍVEL.
--    Ela passa a ser apenas uma porta de entrada para o ledger;
--    o trigger é quem atualiza o saldo.
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_financial_transaction(
  p_user_id uuid,
  p_order_id uuid,
  p_type text,
  p_amount numeric,
  p_description text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF p_type <> 'sale' THEN
    RAISE EXCEPTION 'A RPC financeira aceita somente vendas; use o fluxo específico para estorno/saque';
  END IF;

  PERFORM public.record_financial_sale(
    p_user_id,
    p_order_id,
    p_amount,
    p_description
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.process_financial_transaction(uuid, uuid, text, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_financial_transaction(uuid, uuid, text, numeric, text) TO service_role;

-- ============================================================
-- 6. LIBERAÇÃO SEGURA: LOCK + PROTEÇÃO CONTRA SALDO NEGATIVO
-- ============================================================
CREATE OR REPLACE FUNCTION public.release_due_balances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  release_record record;
  updated_rows integer;
BEGIN
  FOR release_record IN
    SELECT
      br.id,
      br.user_id,
      br.order_id,
      br.amount
    FROM public.balance_releases br
    WHERE br.status = 'pending'
      AND br.available_at <= now()
    ORDER BY br.available_at, br.created_at
    FOR UPDATE OF br SKIP LOCKED
  LOOP
    UPDATE public.balances b
    SET
      pending_balance = b.pending_balance - release_record.amount,
      available_balance = b.available_balance + release_record.amount,
      updated_at = now()
    WHERE b.user_id = release_record.user_id
      AND b.pending_balance >= release_record.amount;

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    IF updated_rows <> 1 THEN
      RAISE EXCEPTION 'Inconsistência de saldo ao liberar order_id=% user_id=% amount=%',
        release_record.order_id,
        release_record.user_id,
        release_record.amount;
    END IF;

    UPDATE public.balance_releases br
    SET
      status = 'released',
      released_at = now()
    WHERE br.id = release_record.id
      AND br.status = 'pending';
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION public.release_due_balances() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_due_balances() TO service_role;

-- ============================================================
-- 7. RECONCILIAÇÃO DO HISTÓRICO ATUAL
--
--    As 7 vendas existentes já têm mais de 7 dias.
--    Como não havia balance_releases para elas, criamos os
--    releases históricos como já liberados e recalculamos o
--    cache balances exclusivamente a partir do ledger.
-- ============================================================
INSERT INTO public.balance_releases (
  user_id,
  order_id,
  amount,
  available_at,
  status,
  released_at
)
SELECT
  ft.user_id,
  ft.order_id,
  ft.amount,
  ft.created_at + interval '7 days',
  'released',
  now()
FROM public.financial_transactions ft
WHERE ft.type='sale'
  AND ft.order_id IS NOT NULL
ON CONFLICT (order_id) DO NOTHING;

UPDATE public.balances b
SET
  pending_balance = COALESCE((
    SELECT SUM(br.amount)
    FROM public.balance_releases br
    WHERE br.user_id=b.user_id
      AND br.status='pending'
  ),0),
  available_balance = COALESCE((
    SELECT SUM(br.amount)
    FROM public.balance_releases br
    WHERE br.user_id=b.user_id
      AND br.status='released'
  ),0) - COALESCE((
    SELECT SUM(ft.amount)
    FROM public.financial_transactions ft
    WHERE ft.user_id=b.user_id
      AND ft.type='withdrawal'
  ),0),
  total_earned = COALESCE((
    SELECT SUM(ft.amount)
    FROM public.financial_transactions ft
    WHERE ft.user_id=b.user_id
      AND ft.type='sale'
  ),0),
  total_withdrawn = COALESCE((
    SELECT SUM(ft.amount)
    FROM public.financial_transactions ft
    WHERE ft.user_id=b.user_id
      AND ft.type='withdrawal'
  ),0),
  updated_at = now();

COMMIT;
