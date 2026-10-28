# URANOVA — Identificação do deployment atual

Data: 2026-10-27, America/Sao_Paulo. **Status: BLOCKED — acesso autenticado Vercel não disponível pelas ferramentas verificadas.** Nenhuma publicação autorizada por este relatório.

## 1. Escopo e verificações realizadas

Consultada a seção 6 de [URANOVA-EXISTING-DEPLOY-RECOVERY-REPORT.md](URANOVA-EXISTING-DEPLOY-RECOVERY-REPORT.md). A autorização limita a investigação remota a metadados dos projetos existentes, sem valores de variáveis, logs brutos ou alterações.

Nesta retomada:

- Não há ferramenta Vercel na lista de ferramentas conectadas disponíveis.
- `Get-Command vercel` não encontrou CLI no PATH do processo.
- `node_modules/.bin/vercel.cmd` não existe no projeto.
- Confirmado o HEAD local por `git rev-parse HEAD`, sem fetch.
- O arquivo de relatório solicitado ainda não existia; foi criado nesta tarefa.

Na tentativa anterior, o controle do navegador interrompeu o acesso por não conseguir determinar a URL atual com segurança para aplicar sua política. Esse bloqueio não foi contornado nem repetido por outro mecanismo de automação. Nenhuma busca de tokens, cookies, arquivos de autenticação ou valores de ambiente foi realizada.

**Não houve consulta autenticada à Vercel nesta retomada.** Não se afirma que o usuário esteja deslogado no computador: o que falta é um canal autenticado acessível e verificável para esta sessão. Não houve erro HTTP de autenticação, pois nenhuma chamada autenticada foi feita.

## 2. Resultados solicitados

| Item | Resultado atual |
|---|---|
| Projetos uranova e uranova-staging | UNVERIFIED remotamente; identificadores históricos abaixo. |
| Deployment associado a www.uranova.com.br | UNVERIFIED; não foi possível ler o vínculo atual do alias. |
| SHA, branch, origem, data e status publicados | UNVERIFIED; não inferidos pelo HEAD ou pela última entrada histórica. |
| Deployments recentes e respectivos commits | BLOCKED; listagem remota não disponível. |
| Framework, Node.js, rootDirectory e comandos efetivos | UNVERIFIED atualmente; histórico não substitui configuração corrente. |
| Push manual em main dispara deploy automático? | UNVERIFIED atualmente. Histórico indica integração Git/main; tratar push como potencial publicação até confirmação. |
| Variáveis: nomes, escopos, tipos e timestamps | BLOCKED; nenhuma listagem atual ou valor consultado. |
| Motivo do target Production no staging | UNVERIFIED; não foi determinada causa por metadados. |
| Deployment de rollback compatível | Não identificado/comprovado. Não executar rollback para um ID histórico sem validar disponibilidade e schema. |

## 3. Contexto histórico, não confirmação atual

O relatório de recuperação anterior reúne as fontes locais:

- Produção: `uranova`, ID `prj_mDBer36P7vACcz1oUWV4QobYNHI8`.
- Staging: `uranova-staging`, ID `prj_ArAaHDNgjtuwqJIbK4vV2kt0wUnn`.
- Scope histórico: `luis-otavios-projects-50436229`.
- Último vínculo explícito de produção encontrado nos relatórios de setembro: `dpl_29H5wTy4gw2yaxG8Vo267Sk4YGwg`, main, SHA `8b3a3002916d85980a02f898c840f97c53e2c371`, READY/production. **Não identificado como deployment atual.**
- A validação de 20/10 manteve UNVERIFIED o deployment/SHA efetivamente publicado, mesmo com resposta HTTP do domínio.
- A tentativa de staging em 19/10 registrou `dpl_3ELYzevhCjJfnKrurRd2q9fwYqNM`, target production apesar do pedido preview, posteriormente cancelado, sem alias atribuído. Não é um Preview aprovado nem um candidato de rollback.
- Produção foi historicamente descrita como Next.js, Node 24.x e integrada a GitHub/main. Staging foi posteriormente descrito como Next.js e Git desconectado. Estado atual desconhecido.

Não há evidência nova que permita concluir se houve promoção manual, auto-deploy, configuração de target incorreta ou outra causa para o incidente de staging. Nenhuma hipótese foi tratada como fato.

## 4. Comparação com Git local

HEAD confirmado nesta tarefa: `6ce3bf19a17b25c2fb59136df35364445f86a6f2`.

Sem SHA publicado atual, não é possível determinar igualdade, divergência ou quantos commits separam o deployment ativo do HEAD. A comparação histórica com 8b3a300 está no relatório anterior; não equivale a comparar com a versão servida hoje. As alterações não commitadas também não estão representadas pelo HEAD.

Não houve commit, push, fetch ou alteração de branch. Não preparar push para main antes de comprovar a política de Git deployments: a ausência de CLI local não impede que um push humano acione a integração remota.

## 5. Rollback

O ID histórico não está aprovado para rollback. Além de confirmar sua existência, retenção, READY e relação com o alias/código, é necessário comprovar compatibilidade com o schema atual. Relatórios anteriores registram instalação posterior do financeiro oficial; código OLD pode não ser compatível. Não reintroduzir checkout legado nem reverter banco para contornar esse bloqueio.

Metadados Vercel, quando disponíveis, poderão identificar candidatos; não bastam isoladamente para homologar compatibilidade financeira. Verificação de schema permanece sujeita a escopo/autorização próprios.

## 6. Intervenção manual necessária

O responsável deve disponibilizar uma integração Vercel autenticada acessível nesta sessão, uma sessão CLI utilizável pelo processo autorizado, ou fornecer um resumo sanitizado obtido manualmente no painel. Não enviar tokens, cookies, chaves, valores de variáveis ou logs brutos. Não ampliar ACLs ou copiar credenciais para o repositório para desbloquear o acesso.

Se optar por fornecer os metadados manualmente, incluir somente:

1. Para os dois projetos: ID/name/scope, framework, Node, rootDirectory, comandos build/install/output, paused, proteção, repositório/branch de produção e configuração de deployments automáticos/ignored build.
2. Para www.uranova.com.br: vínculo atual ao deployment e projeto, redirects/aliases, data da captura; confrontar com targets.production.
3. Para o deployment ativo: ID, URL imutável, target, READY/status, createdAt/readyAt, origem Git/CLI e SHA/ref/repositório. Se não houver SHA confiável, informar isso e a existência de manifesto do artefato, sem presumir equivalência ao Git.
4. Histórico recente e candidatos de rollback: IDs, target, status, SHA/ref, datas, promoções/aliases e disponibilidade.
5. Variáveis: apenas nomes, sensitive/tipo, escopos, branch/custom environment, herança e timestamps. Omitir integralmente campos de valores, mesmo cifrados.
6. Staging cancelado: metadados de target, source, projeto e eventos sanitizados de criação/cancelamento, sem refazer deploy para reproduzir o problema.

Não foi instalado software, iniciado login, criado token ou modificado qualquer serviço nesta tarefa. A intervenção é necessária por indisponibilidade de acesso, não por falta de autorização para a leitura já concedida.

## 7. Próximo passo mínimo para preparar o Git manual

Após obter os metadados, fixar a referência publicada comprovada e confirmar se main aciona deploy automático. Só então comparar a base com as alterações acumuladas e preparar um manifesto seletivo, com dependências de segurança e plano de rollback compatível, sem modificar a árvore existente ou executar publicação. Commit/push continuam dependendo de autorização separada.

Até lá, **BLOCKED / NO-GO para publicação**. Não criar outro ambiente, não desligar guards e não assumir que HEAD corresponde à produção.

## 8. Entrega e preservação

Único arquivo criado nesta tarefa: este relatório. Nenhum arquivo de aplicação foi alterado. Nenhum deploy, promote, rollback, operação Git de escrita, SQL, migration, pagamento, operação Stripe, consulta Supabase ou alteração Vercel foi realizado. Nenhum segredo foi procurado, lido ou exibido. Não foram repetidos testes/build porque não houve mudança de código.
