# Validação da reconstrução financeira

## Resultado

- TypeScript (`node node_modules/typescript/bin/tsc --noEmit`): aprovado.
- Build de produção (`npm run build`, Next 16.2.4/Turbopack): aprovado; 33 páginas estáticas geradas, rotas financeiras dinâmicas. Permanece aviso anterior de depreciação de middleware em favor de proxy.
- Lint do escopo financeiro (`npm run lint:finance`): aprovado, sem erros.
- Lint global: já falhava antes da reconstrução (38 erros). Erros remanescentes fora do escopo financeiro estão listados abaixo; nenhum novo erro introduzido. Não desativei regras para ocultá-los.
- PostgreSQL local: migration executada em PGlite sobre fixture das tabelas auditadas; testes SQL e permissões aprovados. As chamadas concorrentes do teste passam por um único engine PGlite; a validação adicional com conexões PostgreSQL independentes foi concluída no remoto, com fixtures sintéticas removidas.
- Supabase remoto: migration official_finance aplicada uma vez, versão registrada 20260914204949. Histórico preservado e fixtures SQL removidas após testes reais de permissões, concorrência, lease e rollback.
- Stripe Live: não executado. Auditoria somente leitura recusou a configuração local por ausência de chave reconhecida como Live. Nenhuma compra/saque real foi feito.

## Testes automatizados

`npm run test:finance` cobre 14 testes, incluindo:

1. R$100,00 → R$10,00 Uranova + R$4,38 Stripe + R$85,62 produtor; composição real de fee_details.
2. Pedido, pagamento e acesso únicos em entrega duplicada; balance 85,62 após conciliação.
3. Pagamento falho/pendente não chama a RPC de liquidação; Test rejeitado sem crédito.
4. Produto/conta/moeda inválidos e taxa ausente não movimentam dinheiro.
5. Falha depois de inserir pedido/payment e antes de conceder acesso causa rollback integral.
6. Duas compras reais do mesmo produto geram dois pedidos e um acesso; duplicata conflitante é rejeitada.
7. Saque acima do disponível bloqueado; duas reservas competindo não tornam saldo negativo.
8. Reserva idempotente, payout duplicado e eventos fora de ordem; falha tardia só restaura disponibilidade após confirmação e conciliação.
9. Lease de webhook expirado pode ser retomado; snapshot de conciliação antigo não sobrescreve o novo.
10. Saldo legado negativo preservado em snapshot, sem promoção a disponível; histórico não verificado excluído dos totais.
11. Authenticated não executa RPC financeira nem escreve payments; role/conta Stripe do perfil protegidos.
12. Assinatura inválida é rejeitada com SDK Stripe real; erro de processamento retorna 500 e fica auditável para retry.

O fixture de testes é sintético e não contém dados pessoais ou segredos. Processor e webhook usam APIs externas simuladas; apenas o motor SQL e a assinatura do SDK são reais nesses testes. Consulte [operação e implantação](finance-operations.md) para validação Live e limitações de estornos/payouts.

## Inventário de alterações

Gerado a partir do diff local; inclui arquivos modificados, novos e removidos. O commit seletivo é identificado no relatório SUPABASE-OFFICIAL-FINANCE-UPDATE-RESULT.md.
