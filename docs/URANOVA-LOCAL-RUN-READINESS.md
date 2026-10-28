# URANOVA — Prontidão para execução local

Data: 2026-10-27. **Status: BLOCKED para inspeção isolada e livre de efeitos externos na configuração atual.** O bloqueio é de destino/segurança, não uma falha comprovada de inicialização do Next.

## 1. Método e limites

Foi utilizada a resolução de ambiente do pacote local `@next/env`, em subprocessos descartáveis, separadamente para os modos development e production correspondentes a dev/build. Não foi iniciado Next, servidor, build ou conexão externa. A resolução altera somente a memória do subprocesso, encerrado após a classificação; não modifica arquivos, shell do proprietário ou configuração persistente.

Valores foram processados somente em memória para resolução e comparação de identificador. Não foram emitidos, copiados para arquivos ou registrados valores de credenciais, tokens, senhas, URLs completas ou strings de conexão. Logs do carregador foram silenciados; apenas nomes/origens, diagnósticos booleanos e classificações foram retidos. Não foram consultadas contas, assinaturas de chaves ou serviços remotos.

Evidência sanitizada: [URANOVA-LOCAL-RUN-ENV-METADATA.json](URANOVA-LOCAL-RUN-ENV-METADATA.json). A origem descrita é a do processo atual; um terminal futuro pode ter outras variáveis herdadas. Não foram examinados perfis de shell de outros processos, configurações globais de credenciais ou tokens.

## 2. Variáveis e origem efetiva

A resolução tanto de `npm run dev` quanto de `npm run build` encontrou somente `.env.local` entre os arquivos de ambiente carregados. Não houve diagnóstico de parsing. Nenhum override relevante do shell foi encontrado para os nomes abaixo.

| Nome | Origem efetiva em dev/build |
|---|---|
| NEXT_PUBLIC_APP_URL | .env.local |
| NEXT_PUBLIC_SITE_URL | .env.local |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | .env.local |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | .env.local |
| NEXT_PUBLIC_SUPABASE_URL | .env.local |
| OPENAI_API_KEY | .env.local |
| OWNER_EMAIL | .env.local |
| STRIPE_SECRET_KEY | .env.local |
| STRIPE_WEBHOOK_SECRET | .env.local |
| SUPABASE_SERVICE_ROLE_KEY | .env.local |

NODE_ENV é determinado pelo modo do comando na avaliação. AUTH_STAGING_MODE e FUNCTIONAL_STAGING_MODE não estavam ativos. O registro de projetos em código e next.config são outras fontes de política, não fontes de segredos. As variáveis genéricas do sistema operacional não são configurações de integração da aplicação e não foram listadas.

**Destino Supabase classificado: PRODUÇÃO**, nos dois comandos. A classificação compara o identificador do endpoint resolvido ao identificador de produção já registrado no código. Não depende do nome do arquivo nem do hostname localhost. Não comprova que as chaves correspondam a esse endpoint, estejam válidas ou possuam determinadas permissões. Não foi inspecionado o conteúdo de tokens para afirmar vínculo ou autenticação.

Stripe/OpenAI: nomes presentes; modo Live/Test, conta, validade e capacidade de uso **não verificados**. Sua presença não deve ser interpretada como segurança ou autorização para teste. APP_URL/SITE_URL não foram certificados para callbacks localhost.

## 3. Compatibilidade com localhost e guards

A função de validação existente aceitou os dois ambientes resolvidos como **modo normal, sem isolamento de staging**. Portanto, não foi encontrado um bloqueio do guard que proíba localhost nessa configuração. Isso não é teste de startup nem comprovação de que todas as páginas renderizam.

Os guards de sessão/permissão continuam existentes; porém assertIntegrationsEnabled não bloqueia integrações simplesmente porque a aplicação roda no computador do proprietário. O modo normal pode usar credenciais reais e serviços externos.

Ativar Auth-only não é solução automática: ele exige identidade Vercel Preview e hostname de deployment. FUNCTIONAL_STAGING_MODE continua não aprovado e rejeitado. Nenhuma flag, variável ou proteção foi alterada. Não é recomendado fabricar metadados Vercel para permitir localhost.

## 4. Efeitos da navegação examinada

| Página/ação | Comportamento observado no código | Classificação |
|---|---|---|
| `/` | Hero, TrustBar, Products e CTA são apresentação estática; Navbar/Footer não fazem consulta comercial direta. RootLayout inclui SpeedInsights fora de Auth-only. | Candidata a inspeção estritamente limitada; não certificada como zero rede/telemetria. |
| `/marketplace` | Consulta SELECT em public_checkouts, com filtros existentes; busca/ordenação local. Não encontrada escrita explícita no efeito da listagem. Imagens são carregadas de URLs dos produtos. | Leitura remota de PRODUÇÃO e acesso a imagens; requer autorização explícita, não é inspeção offline. |
| Clique de produto `/checkout/product/[slug]` | Consulta catálogo e insere evento product_view em analytics; depois carrega relacionados. | Não incluir em inspeção sem escritas. |
| Clique Comprar / `/checkout/**` | Entrada nos fluxos de checkout/tracking; pode alcançar serviços financeiros. | Excluído. Não testar. |
| Login/cadastro/recovery/dashboard | Middleware/cliente podem interagir com Auth; ações mudam sessão, enviam solicitações ou consultam dados privados/financeiros. | Excluídos da primeira inspeção limitada. |

Links Next podem causar prefetch de destinos, conforme modo e comportamento do framework; links não são uma barreira de segurança. Não se afirma que prefetch execute o efeito client de analytics: a inserção identificada ocorre na montagem da página de produto. O risco comprovado é abrir esse destino. Views/RLS e funções do banco por trás da leitura pública não foram inspecionadas remotamente, portanto a análise local não certifica ausência absoluta de efeitos no servidor de dados.

O build também pode avaliar módulos/configuração e prerenderizar rotas. Não é equivalente a abrir somente a homepage. Não há garantia de ausência de efeitos externos com a configuração de produção carregada.

## 5. Lista curta de inspeção

**Nenhuma página foi aprovada incondicionalmente para execução nesta tarefa.** Lista candidata, sujeita a autorização delimitada:

1. `/`: observar layout e responsividade, sem seguir ações de Auth/comércio. Não há chamada financeira direta identificada nesse caminho; permanece a presença de telemetria global e a exposição do servidor local a outras rotas.
2. `/marketplace`: somente após autorização expressa para leitura do catálogo público do Supabase de produção e carregamento das imagens existentes. Usar busca/filtros, sem abrir cards, loja do produtor ou dashboard.

Não adicionar páginas de produto, checkout, Auth, biblioteca, cursos, uploads, downloads, cupons, sync, Connect, payouts ou administração a essa lista sem revisão/autorização específica. “Não clicar em comprar” não equivale a desabilitar finanças no servidor.

## 6. Decisão sobre os comandos

| Comando | Pode ser autorizado agora como inspeção isolada? | Motivo |
|---|---|---|
| npm run dev | **Não** | Destino produção e modo normal, sem bloqueio global de integrações financeiras. Pode ser tecnicamente iniciável, mas requer aceitação explícita de um escopo conectado e dos riscos, não presumida nesta autorização de leitura. |
| npm run build | **Não** | Carrega configuração de produção e pode executar renderização/módulos. Não foi comprovado como operação sem serviços externos. |

**Comando recomendado na configuração atual: nenhum para execução imediata.** Não executar por inferência a partir de TypeScript/testes aprovados. Se o proprietário posteriormente autorizar uma inspeção conectada e estritamente delimitada, a inicialização pode ser restrita ao loopback, mas isso apenas reduz exposição de rede local: não bloqueia Supabase/Stripe nem substitui isolamento.

O próximo passo mínimo é o proprietário decidir explicitamente entre autorizar a leitura limitada descrita acima ou disponibilizar uma configuração já existente e apropriada, sem revelar segredos. Nenhuma dessas decisões foi tomada pelo agente. Não foram propostos novos ambientes nem alterações automáticas de configurações.

## 7. Preservação

Criados somente este relatório e o JSON sanitizado. Não foi executado Git, servidor, build, SQL, migration, Stripe, pagamento ou qualquer consulta remota. Não foram alterados .env.local, valores persistentes, guards ou aplicação. Não foram exibidos URLs completos de destino nem valores de credenciais. **BLOCKED para a execução segura isolada pretendida; aguardar autorização.**
