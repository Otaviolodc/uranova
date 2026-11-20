BEGIN;

-- Pedidos financeiros são criados/alterados exclusivamente pelo backend
-- após confirmação do Stripe. O cliente não pode fabricar, editar ou apagar
-- um pedido PAID diretamente via Supabase.
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;

-- Saques internos não fazem parte do modelo financeiro novo.
-- Bloqueia as operações públicas enquanto a tabela antiga permanece como
-- histórico/compatibilidade, sem apagar dados nem dependências.
DROP POLICY IF EXISTS "Users can create withdraw request" ON public.withdraw_requests;
DROP POLICY IF EXISTS "Users can view own withdraw requests" ON public.withdraw_requests;

COMMIT;
