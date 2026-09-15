# Auditoria financeira — Uranova

Auditoria do código e do Supabase `opdjpdjettgfndctjcnj`, somente leitura, em 12/09/2026. Diagnóstico impresso no terminal antes de editar código.

## Encontrado

- Next 16.2.4, Supabase, Stripe 22.3.0; sem migrations versionadas no checkout inicial.
- Checkout autenticado cria **Direct Charge** na conta Connect, comissão `application_fee_amount=10%`. Preservar este modelo e o onboarding V2.
- Webhook assinado chama `payment-processor.ts`. Pedido e acesso são gravados antes de payments, fora de transação. Retry depende de acesso existente; uma segunda compra pode reutilizar pedido antigo. Unique somente em payment_provider_id não protege pedidos/acessos.
- `balance_transaction.fee` inclui aplicação + Stripe em Direct Charges. Descontá-la junto com platform_fee reduz produtor duas vezes. Erros engolidos e ausência de livemode/conta no caminho checkout também precisam de correção.
- `balance.ts` e `financial.ts` leem payments sem paginação. Admin e dashboard somam orders. TopProducts e SalesChart calculam receita no navegador; simulador usa taxas estimadas. Nenhuma API de saque ativa encontrada.
- `api/account/delete` apaga orders/payments; profiles permite atualizar role e stripe_account_id via Data API.

## Banco observado

payments: 9 PAID, total bruto 163,00, nove IDs distintos; orders: 9. Esses registros não têm evidência de modo Live no schema. Não inferir autenticidade pelo prefixo do ID.

Legado: balances (2), financial_transactions (7), balance_releases (0), withdrawals (0), withdraw_requests (0), financial_balance_audit_snapshots. Totais antigos: available 171,24; pending **-121,82**; earned 49,42. Nunca promover estes valores a saldo oficial.

RPC `process_financial_transaction` chama `record_financial_sale`, ausente. `release_due_balances` ainda existe; nenhum cron ativo. Nenhum trigger de venda/saldo, apenas updated_at em balances e withdraw_requests. RLS habilitado; tabelas financeiras sem políticas públicas de escrita. customer_products sem unique comprador/produto.

## Decisão

Achado adicional: o onboarding antigo usa `fees_collector=application` e dashboard Express; portanto a plataforma paga as taxas Stripe, contrariando o modelo proposto. Novas contas usam dashboard completo e `fees_collector/losses_collector=stripe`. Contas antigas não são trocadas automaticamente. A documentação Stripe informa que o responsável pelas taxas é definido na criação. O script de auditoria Stripe somente leitura não pôde confirmar o histórico: `.env.local` não disponibiliza uma chave reconhecida como Live. Nenhum segredo foi exibido.

Stripe Live → webhook → processor único → RPC atômica orders/payments/customer_products → balances como projeção conciliada → withdrawals como registro de payouts Connect. Sem transfers adicionais ou carteira independente. Dinheiro em centavos na aplicação; NUMERIC exato nas colunas históricas compatíveis e BIGINT nas evidências novas.

Preservar todo histórico, não converter saldo legado e não aplicar alterações manuais em produção. Pagamentos anteriores precisam de reconciliação explícita de conta, modo, sessão, pedido e taxa real antes de entrar nos totais oficiais. Não associar automaticamente por e-mail/valor/produto.

Remover shim processSale sem consumidores, cálculos financeiros do navegador e RPCs financeiras antigas (sem CASCADE). financial_transactions, balance_releases, withdraw_requests e snapshots são candidatos a arquivo/remoção posterior, somente após verificar dependências externas e retenção. Nenhuma tabela é excluída nesta reconstrução.

Referências: [Direct Charges](https://docs.stripe.com/connect/direct-charges?platform=web&ui=stripe-hosted), [BalanceTransaction](https://docs.stripe.com/api/balance_transactions/object), [webhooks](https://docs.stripe.com/webhooks), [funções Postgres](https://supabase.com/docs/guides/database/functions). Guias Next consultados localmente em node_modules/next/dist/docs.
