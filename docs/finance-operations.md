# Financeiro oficial — operação e implantação

## Arquitetura

Stripe **Live**, cobrança direta Connect → webhook assinado → `payment-processor.ts` → RPC `settle_stripe_sale` → orders + payments + customer_products + projeção inicial balances, em uma transação PostgreSQL → conciliação Stripe → produtor/admin → payout Connect registrado em withdrawals.

Não há transfer adicional nem saldo criado pelo navegador. O ledger de vendas é a própria tabela payments. balances é uma projeção descartável/recalculável, nunca uma segunda fonte de vendas. withdrawals representa reservas locais e payouts reais (inclusive automáticos/externos). As antigas colunas NUMERIC continuam compatíveis; centavos BIGINT e evidência Stripe identificam registros oficiais.

Uma venda de 10000 centavos gera comissão 1000, Stripe 438, produtor 8562. Em Direct Charges a taxa total da BalanceTransaction inclui a application fee; o processor separa fee_details e confere fee/net. Não estima taxa ausente: responde com erro recuperável, aguardando evidência completa. Retentativas e eventos diferentes convergem para o mesmo processor/RPC. A transação cria pedido, pagamento, acesso e crédito pendente juntos, ou não cria nada.

## Antes de implantar

1. Revisar [auditoria](finance-audit.md) e migration; obter backup e validar num banco isolado com cópia do schema real. Os testes PGlite usam fixture do schema observado, não um clone de produção, e não substituem teste com múltiplas conexões PostgreSQL.
2. Configurar chave **Live** no servidor e segredo do webhook Live de **contas conectadas**. O `.env.local` desta execução não passou no requisito de chave Live; não houve cobrança, saque ou consulta de pagamentos Live reais. Nunca copiar chaves para logs, documentos ou variáveis NEXT_PUBLIC.
3. Executar a auditoria somente leitura: `node --env-file=.env.local scripts/audit-stripe-finance.mjs`. Ela informa contagens e inconsistências, sem modificar nada. Verificar a conta Stripe da plataforma e sua compatibilidade com o modelo BRL/Connect brasileiro.
4. O onboarding antigo usava `fees_collector=application`. Essa propriedade não é trocada automaticamente. Novas contas usam dashboard completo e fees/losses collector Stripe. Revisar as contas existentes com a Stripe; não substituir IDs enquanto houver pagamentos, disputas, saldos ou payouts vinculados. Novos checkouts em contas incompatíveis são bloqueados para não cobrar taxas da Uranova indevidamente.
5. Interromper temporariamente novos checkouts no processo de implantação; aplicar **a migration versionada**, por pipeline/CLI, e publicar o código em sequência. A migration foi aplicada em 14/09/2026 e registrada como 20260914204949; não reaplicar. Consulte supabase/README.md. Ela verifica cron legado, remove RPCs antigas sem CASCADE, preserva todos os pedidos/payments e captura os balances anteriores em legacy_snapshot antes de zerar a projeção inválida. Se detectar dependência/conflito, interrompe integralmente.
6. Reconciliar, em etapa separada autorizada, os cinco pagamentos Live históricos preservados. Para cada um, confirmar conta e modo Live, PaymentIntent, Charge, Session, taxa real, cliente, produto e pedido já existente. Criar migration específica de reconciliação com associações explícitas e evidência Stripe; **não** relacionar por e-mail, valor ou proximidade de datas, nem reenviar indiscriminadamente eventos antigos. O processor recusa promover registros antigos automaticamente. Totais oficiais inicialmente excluem esses registros; contadores de histórico pendente mostram isso.
7. Assinar eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.succeeded`, `charge.updated`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `balance.available`, `payout.created`, `payout.updated`, `payout.paid`, `payout.failed`, `payout.canceled`.
8. Reprocessar eventos com erro após corrigir sua causa. claim/finish usam token e lease de três minutos; uma execução encerrada não deixa o evento preso indefinidamente. Não marcar evento manualmente como processado para ocultar erro financeiro.
9. Atualizar a conciliação em Financeiro. Conferir Stripe, pedidos, acesso, commission, fee e saldo. Fazer validação controlada Live antes de reabrir vendas. Esta etapa envolve dinheiro real e não foi executada aqui.

## Disponibilidade e saques

- Venda aprovada entra primeiro como pendente. Disponibilidade é limitada simultaneamente pela soma de vendas verificadas com available_on vencido, menos reservas/payouts, e pelo saldo BRL disponível retornado pela Stripe.
- A conciliação lê todos os payouts da conta, incluindo automáticos, e revisa Charges verificadas para estornos/disputas. A paginação evita limites de 1000 registros do PostgREST. Vendas externas à Uranova não geram crédito; payouts externos são deduzidos de modo conservador. Inconsistência bloqueia saque.
- O dashboard só mostra disponível de snapshots com menos de cinco minutos. Reserva exige snapshot de menos de dois minutos, bloqueio no banco, valor positivo, saldo suficiente e nenhuma solicitação pendente. Conciliações concorrentes têm lease e token para impedir sobrescrita por snapshot antigo.
- Saque pela Uranova exige `payouts_enabled`, calendário **manual**, e permissão da plataforma na conta. Contas com calendário automático continuam sendo pagas pela Stripe; os payouts são apenas registrados. O código não muda o calendário nem cria transferência de venda.
- A reserva reduz available_balance e aumenta pending_payout antes da chamada Stripe. O ID persistido da reserva é a chave de idempotência do payout. Retry do mesmo pedido usa os mesmos parâmetros; pedido diferente enquanto há pendência é recusado.
- Erro de transporte/Stripe mantém a reserva: a resposta pode ter sido perdida após um saque real. Mesmo ID só é reenviado por até 23 horas, antes da janela mínima de retenção da chave Stripe. Depois disso, consultar Stripe e reconciliar via migration/revisão; nunca liberar e reenviar às cegas. Eventos/listagem de payouts podem resolver a pendência por `uranova_withdrawal_id`.
- Payout failed/canceled confirmado libera a dedução na próxima conciliação; paid contabiliza total sacado. O estado é obtido da API atual para tolerar eventos fora de ordem.
- Estornos/disputas marcam pagamentos para conciliação e bloqueiam saque. **Não há automação contábil de estornos parciais, disputa e devolução de application fee nesta entrega**. Os totais preservam vendas históricas brutas; é necessária revisão de ajustes antes de remover o bloqueio. Não tratar esses totais como receita líquida após estornos.
- Conciliação completa é síncrona e segura para o volume auditado. Para volumes altos, mover o trabalho para fila/job com checkpoint, mantendo as mesmas RPCs e leases; não aumentar indiscriminadamente o tempo do webhook.

## Segurança e retenção

As RPCs são SECURITY INVOKER, com search_path fechado e EXECUTE exclusivo de service_role. Financeiro privado é lido por serviços server-only com getUser e verificação de proprietário/admin. Admin mantém papel protegido e OWNER_EMAIL. RLS e revogação de privilégios impedem escrita financeira pelo Data API; trigger impede o usuário de trocar role/stripe_account_id.

Exclusão de conta com vínculo Connect, vendas ou compras é bloqueada e direcionada ao suporte. Não remover dados financeiros como parte de limpeza de conta. customer_products e payments têm vínculo com pedido; pagamentos oficiais não são inferidos de orders históricos.

Tabelas candidatas a arquivamento futuro: financial_transactions, balance_releases, withdraw_requests e financial_balance_audit_snapshots. Verificar FK (financial_transactions referencia withdraw_requests), consumidores externos, funções, jobs, políticas e retenção antes de qualquer remoção. **Nenhuma tabela foi excluída.** withdrawals e balances foram reutilizadas; nenhuma nova tabela financeira foi criada.

## Verificação local

`npm run test:finance` executa testes SQL com PGlite e testes do processor/webhook com fixtures e APIs externas simuladas. A verificação de assinatura usa o SDK Stripe real. Nenhum teste cria transação Live. `npx tsc --noEmit` e `npm run build` validam a aplicação. Consulte [validação](finance-validation.md) para resultados e lint preexistente.

Referências técnicas: [taxas em Direct Charges](https://docs.stripe.com/connect/direct-charges-fee-payer-behavior), [configuração Accounts V2](https://docs.stripe.com/connect/accounts-v2/connected-account-configuration), [idempotência Stripe](https://docs.stripe.com/api/idempotent_requests).
