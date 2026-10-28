# URANOVA — Recuperação do fluxo de deploy existente

Data: 2026-10-27. **Decisão: NO-GO para publicação neste momento.** O próximo passo recomendado é recuperar metadados do deployment existente, mediante autorização de leitura, e não criar outro ambiente.

Investigação exclusivamente local. Nenhum deploy, commit, push, fetch Git, SQL, migration, pagamento ou consulta remota foi realizado. Valores de credenciais não foram acessados. Nenhum código ou configuração foi alterado nesta tarefa.

## 1. Evidência e confiabilidade

Os relatórios locais registram inspeções remotas feitas em datas anteriores. Nesta tarefa, eles são **evidência histórica documental**, não recaptura do estado atual. Um commit com “deploy” na mensagem, uma branch origin/main local ou uma resposta HTTP do domínio não comprovam qual código está publicado hoje.

### Cronologia identificada

| Data / fonte local | Evidência registrada | Limite |
|---|---|---|
| 14/09 — VERCEL-DEPLOYMENT-DISCOVERY-RESULT.md | targets.production e alias www.uranova.com.br apontavam a `dpl_29H5wTy4gw2yaxG8Vo267Sk4YGwg`, READY/production, gitSource main, SHA `8b3a3002916d85980a02f898c840f97c53e2c371`. Criado em 12/09. | Última associação explícita deployment/alias/SHA encontrada nos documentos de produção; não é confirmação atual. |
| 14/09 — CONTROLLED-CUTOVER-RESULT.md | Mesmo deployment/SHA recapturado. Tentativa abortada antes de pausa/migration por falta de validação Stripe. | Não demonstra publicação do financeiro novo. |
| 14/09 — SUPABASE-OFFICIAL-FINANCE-UPDATE-RESULT.md | Etapa posterior registra banco oficial instalado, produção pausada com código OLD, commit local `1c1d694135ab9a9f55d74ee049f5892fb49b875d`; nenhum push/deploy nessa retomada. | O estado “não pausado” do cutover abortado foi sucedido por outro registro. Não mesclar snapshots como se fossem simultâneos. |
| 06/10 — Git | Commit `6ce3bf19a17b25c2fb59136df35364445f86a6f2` de responsividade, filho direto de 1c1d694. | Não comprova deployment. |
| 13/10 — STAGING-PROJECT-ID-RESULT.md | Projeto staging identificado; naquele momento framework Other e nenhuma variável Preview listada. | Configuração histórica, posteriormente descrita de outra forma. |
| 19/10 — STAGING-FINAL-PREDEPLOY-RESULT.md | Bloqueios de vínculo de chave anon e confirmação de configuração; nenhuma publicação nessa etapa. | Valores atuais não foram consultados. |
| 19/10 — FIRST-STAGING-PREVIEW-RESULT.md | Projeto staging então descrito como Next.js, Git desconectado. Tentativa CLI com target preview retornou target production; deployment `dpl_3ELYzevhCjJfnKrurRd2q9fwYqNM` cancelado, aliasAssigned=false. | **Não é um Preview aprovado**. A causa da seleção de target não foi comprovada. |
| 20/10 — FINAL-PRODUCTION-VALIDATION.md | Domínio respondeu; GitHub/main e HEAD identificados como 6ce3bf1; banco oficial inspecionado. Deployment atual, SHA publicado e processor em produção continuaram UNVERIFIED. | Relatório conclui NOT READY FOR LIVE SALE; não fornece ponte comprovada entre commit e domínio. |

**Último deployment historicamente identificado:** dpl_29H5wTy4gw2yaxG8Vo267Sk4YGwg, com SHA 8b3a300. **Última versão atualmente publicada e funcional de ponta a ponta: não identificável com a evidência local disponível.** Não é seguro escolher esse deployment antigo como rollback apenas por seu READY histórico.

Fontes: [descoberta](VERCEL-DEPLOYMENT-DISCOVERY-RESULT.md), [cutover](CONTROLLED-CUTOVER-RESULT.md), [banco oficial](SUPABASE-OFFICIAL-FINANCE-UPDATE-RESULT.md), [validação de produção](FINAL-PRODUCTION-VALIDATION.md), [tentativa staging](FIRST-STAGING-PREVIEW-RESULT.md).

## 2. Infraestrutura existente

| Item | Identificação local/histórica |
|---|---|
| Projeto produção | uranova / `prj_mDBer36P7vACcz1oUWV4QobYNHI8` |
| Projeto staging | uranova-staging / `prj_ArAaHDNgjtuwqJIbK4vV2kt0wUnn` |
| Scope Vercel | luis-otavios-projects-50436229 |
| Produção | www.uranova.com.br; uranova.com.br redirecionava para www |
| Deployment histórico imutável | uranova-usid0g1k0-luis-otavios-projects-50436229.vercel.app |
| Repositório historicamente vinculado | Otaviolodc/uranova, branch main |
| Supabase produção registrado | opdjpdjettgfndctjcnj |
| Supabase staging registrado | unkupjzifylpredkenvj |

IDs e URLs são identificadores, não credenciais; não comprovam configuração corrente. Não foi necessário criar projetos para identificá-los.

`.vercel/project.json`, `vercel.json` e diretório `.github` estão ausentes no workspace. O histórico Git rastreado não contém configuração Vercel/workflows identificável, além do asset public/vercel.svg. Não existe vínculo CLI local a assumir. Relatórios anteriores utilizaram projeto e scope explicitamente.

Build local: `package.json` usa `next build`; Next 16.2.4, React 19.2.4. package.json e package-lock.json não têm diff contra HEAD. Configurações remotas podem sobrescrever comandos/framework/root directory: precisam ser recapturadas. O último registro de produção informa Next.js, Node 24.x e região iad1. Isso não prova configurações atuais de build/install/output.

O fluxo histórico combinava integração GitHub/main em produção e tentativas CLI explícitas para staging. Não há prova de qual mecanismo publicou uma versão posterior a 8b3a300. Um futuro push em main pode acionar auto-deploy; não deve ser utilizado como simples armazenamento do trabalho antes da decisão de release.

O relatório de setembro listava nomes de variáveis Supabase/Stripe/URLs/OWNER_EMAIL presentes tanto em Production quanto Preview, sem filtro de branch. Portanto **Preview no projeto existente não equivale automaticamente a sandbox**. Nenhum valor foi lido nesta investigação. O staging separado já existe; sua reutilização depende da resolução do incidente de target e das pendências de configuração, não da criação de outro projeto.

## 3. Git e comparação de versões

HEAD local e referência local origin/main: `6ce3bf19a17b25c2fb59136df35364445f86a6f2`. A referência remota local não foi atualizada por fetch. Branches locais adicionais: auth-refactor em 4b75f1c e backup-home-antiga em 27d3403; nenhuma foi comprovada como branch de deployment. Reflog confirma commits locais 1c1d694/6ce3bf1 e pull anterior para 8b3a300; não registra sucesso Vercel.

| Comparação | Diferença comprovada localmente | Interpretação |
|---|---|---|
| 8b3a300 → 1c1d694 | 54 arquivos, +1701/-4829 linhas | Reconstrução financeira oficial; não é atualização apenas visual. |
| 1c1d694 → 6ce3bf1 | 41 arquivos, +235/-622 linhas | Responsividade distribuída inclusive em páginas comerciais; sem prova de publicação. |
| 8b3a300 → HEAD | 87 arquivos, +1931/-5446 linhas | Distância Git em relação ao último deployment historicamente associado a um SHA, não diff do deployment atual desconhecido. |
| HEAD → working tree | 89 caminhos rastreados alterados/removidos, +1285/-3621 linhas; 216 arquivos não rastreados antes deste relatório | Trabalho acumulado de várias fases, não um release pronto. O diff Git não inclui conteúdo dos não rastreados. |

Não existe base comprovada para nomear o diff “desde a última versão funcional atual”. As comparações acima mantêm referências explícitas e não substituem o SHA publicado faltante.

### Grupos relevantes

- **Não financeiros candidatos:** tipagem/lint, efeitos de listagens, acessibilidade, responsividade e apresentação, filtros de catálogo course/mentoring/legados, contrato async de params. Podem ser considerados seletivamente, com imports completos e testes; não são automaticamente independentes de schema.
- **Segurança acumulada:** sessão/autorização, proteção de perfil e administração, callback/logout, rate limit distribuído, autorização de downloads, validação de entradas e isolamento Auth-only. Não retirar esses controles para fazer páginas antigas funcionarem. Auth/password e entrega dependem de RPCs/policies específicas.
- **Financeiro ativo alterado na árvore:** guards nas rotas Stripe/finance, clients lazy, serviços Connect/payout/processor e apresentação financeira. A existência de mudanças pequenas de guard não torna seguro publicar todo o conjunto nem removê-las de uma seleção sem revisar dependências.
- **Experimentos:** checkout-foundation B2, propostas de persistência D1/D2 e product-foundation 2.2A. D2 continua PARTIAL; writer v2 não está autorizado. Propostas de SQL e testes locais não homologam produção. Rotas product-drafts permanecem indisponíveis.
- **Staging:** next.config, middleware e políticas novas não existiam dessa forma no HEAD. Auth-only é restrito; o flag funcional está reservado e rejeita ativação. Não criar um ambiente novo nem desligar esses guards como atalho para release.

## 4. Schema e risco de rollback

`supabase/README.md` e o relatório de instalação mapeiam o arquivo original `20260913014834_official_finance.sql` à versão remota `20260914204949 official_finance`: são descritos como a mesma instalação, não duas migrations a aplicar. O primeiro arquivo está removido na árvore atual e há nove SQLs não rastreados, incluindo o nome correspondente ao registro remoto. Preservados sem execução ou restauração.

A validação de 20/10 relata o schema oficial instalado e funções antigas removidas. Por isso, promover de volta o código OLD de 8b3a300 pode ser incompatível com o banco. **Rollback não pode ser “voltar ao último ID conhecido” sem testar compatibilidade.** Não se propõe reverter schema ou reintroduzir checkout legado.

As migrations de segurança A/A.1 e funções phase_a1_consume_rate_limit/phase_a_file_owned precisam ser confrontadas com o schema do destino antes de incluir as correções dependentes. Estado remoto atual desconhecido nesta tarefa. Não executar db push, SQL histórico ou proposta de fundação para desbloquear publicação parcial.

## 5. Possibilidade de publicação parcial

**Possível em princípio, não aprovada agora.** O menor caminho é usar o projeto existente e uma base identificada do deployment atual, preparando um pacote seletivo sem mudanças de schema, contratos financeiros ou experimentos. Não usar o working tree inteiro e não presumir que um cherry-pick de 1c1d694 é necessário: ele pode já estar publicado ou ser incompatível com a versão corrente.

Auth e catálogo podem acompanhar esse pacote somente se seus contratos atuais com o banco forem compatíveis e os controles de segurança forem preservados. Caso um controle indispensável dependa de RPC ausente, bloquear esse pacote e planejar a dependência separadamente. Não publicar uma versão vulnerável para manter a aparência de funcionamento.

Não é obrigatório implementar staging funcional novo para iniciar a recuperação do fluxo. Primeiro identificar deployment/schema/configuração existentes. Para homologação, avaliar o staging já criado, corrigindo por procedimento autorizado o target inesperado; ou um Preview no projeto existente **somente após** comprovar isolamento de envs e impedir side effects. As duas opções estão bloqueadas no estado de evidência atual.

## 6. Metadados remotos exatos a consultar — aguardando autorização

Consulta Vercel exclusivamente de leitura, limitada aos dois projetos conhecidos e deployments associados. Não solicitar valores de env, env pull/run, logs brutos potencialmente sensíveis ou credenciais.

1. Projeto produção: id/name/team, framework, nodeVersion, rootDirectory, buildCommand/installCommand/outputDirectory, estado paused, integração Git (provider/repo/production branch), configuração de deployments automáticos e proteção de deployments.
2. targets.production e aliases atuais www.uranova.com.br/uranova.com.br/aliases principais: deployment ID e vínculo ao projeto, incluindo redirects. Não inferir pelo deployment mais recente.
3. Deployment referenciado pelo alias: id, URL imutável, createdAt/readyAt, readyState, target, source (Git/CLI), gitSource SHA/ref/repo e metadados de origem. Se CLI publicou árvore sem commit, solicitar manifesto/hash dos arquivos desse artefato ou registrar impossibilidade de reconstrução exata.
4. Histórico recente dos deployments desse projeto: IDs, target, status, SHA/ref, criação, promoção/rollback e alias assignment, buscando sucessores de dpl_29H5wTy4gw2yaxG8Vo267Sk4YGwg e possível publicação de 1c1d694/6ce3bf1.
5. Candidato a rollback: existência, disponibilidade/retenção e status, vínculo ao código e configurações de build/runtime, sem valores secretos. Ainda requer compatibilidade com schema; metadados Vercel sozinhos não bastam.
6. Variáveis: **somente nomes, tipo/sensitive, target, gitBranch/custom environment e timestamps**, incluindo herança de shared envs. Essa consulta não comprova modo Live/Test nem project ref dos valores e não deve tentar descriptografá-los.
7. Projeto staging: os mesmos campos de build/Git/target/environment; metadados do deployment cancelado dpl_3ELYzevhCjJfnKrurRd2q9fwYqNM e histórico de target/alias. Determinar a causa do target Production por metadados/audit trail sanitizado, sem nova tentativa de deploy.

Nenhuma dessas consultas foi executada. Evidências de schema Supabase e configuração Stripe poderão ser necessárias em outra autorização; não estão implicitamente incluídas nessa futura leitura Vercel. Não é necessário enviar segredos no chat.

## 7. Plano mínimo de atualização

1. Autorizar e obter os metadados Vercel acima, reutilizando infraestrutura existente. Fixar deployment ativo/alias/SHA ou manifesto e registrar data da captura.
2. Comparar a base publicada comprovada com HEAD e working tree em checkout isolado futuro, sem reset/clean/restauração da árvore atual. Montar manifesto seletivo de mudanças não financeiras e seus imports/guards.
3. Confirmar compatibilidade do destino com as dependências já existentes, por evidências sanitizadas e autorização própria; nenhuma migration automática. Se não houver base reproduzível, bloquear o release até recuperar artefato ou snapshot confiável.
4. Reexecutar lint, TS, regressões, build com o comando efetivo da Vercel e testes negativos sobre o pacote exato. Os resultados locais anteriores não validam um pacote seletivo ainda não montado.
5. Resolver o caminho de homologação na infraestrutura existente, sem herdar finanças de produção em Preview. Preparar rollback para deployment comprovado e compatível; se nenhum existir, definir contenção de tráfego separada, sem reabrir o código OLD.
6. Submeter manifesto, evidências e plano à aprovação explícita antes de qualquer commit/push/deploy. Verificar antes do push se a integração main dispararia publicação.
7. Após futura publicação autorizada: conferir alias → deployment → versão, Auth/callback/logout, catálogo/perfis/estados vazios, e manutenção dos bloqueios de integrações experimentais. Testes sem dinheiro; nenhum pagamento ou reenvio de webhook como smoke test.

## 8. Conclusão

**NO-GO**, por falta de identificação atual do artefato publicado e de rollback compatível, histórico de target inesperado no staging, risco de Preview herdar produção e dependências de schema não recapturadas. Não por falta de um novo projeto Vercel.

As últimas validações locais já registradas (156 testes, TS e build Auth-only aprovados; zero erros de lint e três warnings) permanecem evidências locais de outra etapa. Não foram repetidas porque esta tarefa apenas criou este documento; não certificam o deployment existente nem o pacote futuro.

Arquivo criado nesta tarefa: `docs/URANOVA-EXISTING-DEPLOY-RECOVERY-REPORT.md`. Todos os arquivos de aplicação, histórico Git e mudanças acumuladas foram preservados. Aguardar autorização para consultar os metadados Vercel especificados; nenhuma infraestrutura adicional foi desenvolvida.
