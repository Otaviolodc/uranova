# BUILD V4.34 — isolamento de destinos Stripe

Implementação exclusivamente local. Esta configuração substitui a proposta de URL compartilhada da BUILD V4.32. Nenhum segredo, destino Stripe, banco remoto ou projeto Vercel foi modificado. Nenhuma migration ou recuperação financeira foi executada.

## Rotas e autenticação

| Destino | URL futura | Segredo exclusivo | Escopo obrigatório |
| --- | --- | --- | --- |
| Sua conta | `https://<dominio-publico>/api/stripe/webhook` | `STRIPE_WEBHOOK_SECRET` | Campo `event.account` ausente |
| Contas conectadas | `https://<dominio-publico>/api/stripe/connect/webhook` | `STRIPE_CONNECT_WEBHOOK_SECRET` | String `acct_` seguida de caracteres alfanuméricos |

O domínio deve ser o domínio HTTPS efetivamente publicado e aprovado na futura fase operacional; não foi inferido de credenciais locais.

Cada rota escolhe o segredo pelo código da rota, lê o corpo bruto uma vez e usa `constructEvent`. Não tenta o segredo da outra rota. O escopo só é consultado após autenticação. Assinaturas inválidas, cruzadas, ausentes, expiradas ou corpo adulterado retornam 400 antes da persistência. Escopo incorreto retorna 400, inclusive em eventos Test ou tipos não suportados.

Segredo necessário ausente/vazio retorna 503, sem fallback. Segredos iguais (inclusive diferença apenas de espaços nas extremidades) tornam ambas as rotas indisponíveis com 503. A ausência do segredo Connect não impede o funcionamento independente da rota principal. Não há exposição de segredos ou payloads nos logs de autenticação.

A rota principal preserva a URL e o reconhecimento dos eventos válidos da plataforma: HTTP 200 com `ignored`, sem liquidação financeira. Eventos Connect passam a ser rejeitados nessa URL. Isso é intencional e exige usar a nova URL para o futuro destino Connect.

## Autorização e liquidação

Um identificador com formato válido não basta para autorizar liquidação. A rota Connect usa `sellerForAccount`; sem produtor associado, retorna 500 com `pending_recovery`, sem chamar o processador financeiro. O serviço existente valida produtor, produto e comprador, compara a conta do perfil e consulta objetos Stripe no contexto da conta conectada. Objetos da conta principal não são consultados no contexto da plataforma como fallback.

Os handlers da BUILD V4.32 foram transferidos para a rota Connect. Direct Charges, comissão de 10%, cálculo em centavos, `settle_stripe_sale`, demais RPCs e controles idempotentes não foram modificados. A mesma identificação de evento continua sendo usada no claim; eventos anteriormente concluídos não são reiniciados por trocar a URL.

`pending_recovery` mantém HTTP 500 para falha de processamento, ou 409 para lease ocupado. Após claim, erros usam `failed` e `last_error` existentes. Eventos ignorados são identificados em resposta/log; não foi criado um estado SQL novo. Uma falha após liquidação pode ser repetida sem novo crédito, desde que as RPCs/constraints existentes estejam corretamente instaladas.

## Configuração futura Live — não executada

1. Em fase autorizada, disponibilizar a versão validada e conferir o esquema/RPCs efetivos. Preservar o destino atual “Sua conta”, sua URL e seu segredo.
2. Criar destino **Live / Contas conectadas** na nova URL `/api/stripe/connect/webhook`.
3. Selecionar eventos **snapshot**, compatíveis com `Stripe.Event`, `event.account` e `event.data.object`. Thin notifications não estão implementadas. Conferir compatibilidade da versão do destino com a versão atual do cliente: `2026-06-24.dahlia`.
4. Configurar exclusivamente o segredo desse novo destino em `STRIPE_CONNECT_WEBHOOK_SECRET`, no servidor, distinto de `STRIPE_WEBHOOK_SECRET`. Não usar `NEXT_PUBLIC_`, não substituir o segredo atual e não registrar valores em logs ou documentos.
5. Selecionar os 14 eventos abaixo. Na validação operacional, conferir resultado e registros; HTTP 200 com `ignored` não comprova uma venda liquidada.

| Eventos | Tratamento |
| --- | --- |
| `checkout.session.completed`, `checkout.session.async_payment_succeeded` | Liquidação por Checkout |
| `payment_intent.succeeded` | Localiza Checkout e liquida |
| `charge.succeeded`, `charge.updated` | Liquidação quando elegível e/ou conciliação |
| `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `balance.available` | Conciliação de registros existentes |
| `payout.created`, `payout.updated`, `payout.paid`, `payout.failed`, `payout.canceled` | Registro de payout e conciliação |

Eventos como `account.updated`, `application_fee.created`, falhas de pagamento, expiração de Checkout e eventos v2 de conta não têm handlers de negócio nesta implementação. Estornos/disputas acionam revisão; não há lançamento reverso completo automático.

Não recuperar a compra anterior ao configurar esta fase. Criar o destino não importa vendas antigas. Qualquer recuperação posterior exige verificar os objetos Stripe e os registros locais e reutilizar o serviço de liquidação, sem nova cobrança ou crédito manual.

Referências: [escopos Connect](https://docs.stripe.com/connect/webhooks?accounts-namespace=v1), [assinaturas](https://docs.stripe.com/events/manage-webhook-endpoints#signature-errors).

## Verificações e resultado

- **PASS:** 30 testes focados de webhook, processador, Checkout e cálculo financeiro. Incluem assinatura cruzada nos dois sentidos, escopo ausente/malformado, segredos iguais/ausentes, assinatura inválida/adulterada/expirada, conta desconhecida, duplicatas e pendências recuperáveis.
- **PASS:** 10 testes de isolamento de staging, incluindo a nova rota e a nova variável.
- **PASS:** teste financeiro existente `centavos:` executado isoladamente. Os demais testes desse arquivo aplicam migrations e não foram executados.
- **PASS:** typecheck sem emissão, ESLint dos arquivos desta fase e build Next.js, com ambas as rotas presentes.
- **PARTIAL:** idempotência SQL real e estado remoto. As RPCs e índices não foram alterados, mas os testes de webhook usam mocks, sem executar migrations ou consultar banco real.

Comandos utilizados:

```text
node --require ./scripts/auth-p02a-offline.cjs --experimental-test-module-mocks --import ./tests/register.mjs --test tests/webhook.test.mjs tests/processor.test.mjs tests/checkout-observability.test.mjs tests/finance-v434.test.mjs
node --require ./scripts/auth-p02a-offline.cjs --experimental-test-module-mocks --import ./tests/register.mjs --test tests/staging-isolation.test.mjs
node --require ./scripts/auth-p02a-offline.cjs --import ./tests/register.mjs --test --test-name-pattern ^centavos: tests/finance.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/eslint/bin/eslint.js src/app/api/stripe/webhook/route.ts src/app/api/stripe/connect/webhook/route.ts src/lib/security/stripe-webhook.ts tests/webhook.test.mjs tests/finance-v434.test.mjs tests/staging-isolation.test.mjs
node node_modules/next/dist/bin/next build
```

Build executado com `NODE_OPTIONS=--require ./scripts/auth-p02a-offline.cjs` e `NEXT_TELEMETRY_DISABLED=1` no processo local, sem editar arquivos de ambiente. Aviso preexistente: depreciação de `middleware` em favor de `proxy`.

Riscos restantes: instalação/ACLs do esquema remoto não conferidas; autorização depende dos vínculos protegidos em `profiles`; sincronização financeira permanece síncrona; retries Stripe são limitados; não há recuperação automática de vendas ausentes ou de eventos antigos já marcados `processed`.
