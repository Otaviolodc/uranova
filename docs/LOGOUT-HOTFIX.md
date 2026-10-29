# Hotfix de logout — preparado, pendente de validação em produção

Base local: `f50e2e8`. Nenhum add, commit, push, deploy ou alteração de banco executado.

## Causa raiz

O GET de `src/app/auth/logout/route.ts` devolvia um formulário HTML nativo com
`Referrer-Policy: no-referrer`. Para POSTs de formulário (modo não CORS), essa
política faz o navegador serializar `Origin` como `null`. O POST chama
`sameOrigin` em `src/lib/security/request.ts`, que exige igualdade exata entre
Origin e `new URL(request.url).origin`. A comparação falha e lança `FORBIDDEN`.
`safeError` converte esse erro no HTTP 403 com a mensagem exata:
`Ação não autorizada. Confirme sua identidade.`

A rejeição acontece antes de criar o cliente Supabase ou chamar `signOut`.
Não é uma exigência de senha adicional do Supabase. Referer não é usado como
fallback de autorização e continuará não sendo usado.

Referências:
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy
- https://supabase.com/docs/reference/javascript/auth-signout

## Mudança mínima

- A confirmação passa a usar `Referrer-Policy: same-origin`: mantém a origem
  no POST legítimo e não envia Referer para outras origens.
- GET continua sem logout; formulário continua POST relativo para `/auth/logout`.
- `sameOrigin`, autenticação, adaptador SSR de cookies e POST ficam intactos.
- Confirmação com logo existente, fundo escuro, cartão responsivo, botão verde
  e foco visível. Sem dependências ou JavaScript. CSS estático autorizado por
  SHA-256 na CSP; scripts, frames, bases e destinos externos de formulário
  permanecem bloqueados. Apenas imagens da própria origem são autorizadas.
- Sucesso continua com 303 para `/auth/login` na mesma origem e `no-store`.

## Sessão, cookies, middleware e domínios

O `signOut()` mantém o escopo global preexistente. O SDK SSR instalado trata
SIGNED_OUT e remove os cookies da sessão, seus fragmentos e o verificador PKCE.
O adaptador existente usa `await cookies()` e `cookieStore.set`, suportados em
Route Handlers no Next 16.2.4. Não há exclusão genérica de cookies alheios.
Sem sessão, o logout legítimo é idempotente: redireciona ao login sem chamada
de revogação. Falha do provedor retorna 503 genérico, sem sucesso aparente.

O middleware atual atualiza a sessão nas rotas `/auth`; não contém
redirecionamento de produção entre www e sem www. As regras especiais de
redirecionamento observadas são de staging. Não foi alterado.

`https://uranova.com.br` e `https://www.uranova.com.br` são origens distintas.
Cada uma passa quando Origin é igual à URL recebida; POST entre elas continua
rejeitado. A ação relativa evita trocar domínio no formulário. Nenhum domínio
foi acrescentado a allowlist; nenhum cabeçalho encaminhado é confiado pelo patch.
Cookies host-only de uma origem não podem ser limpos na outra. A configuração
canônica e os redirecionamentos efetivos da Vercel ainda precisam ser observados.

## Verificação local

- `npx tsc --noEmit --incremental false`: aprovado.
- `npx eslint src/app/auth/logout/route.ts tests/logout.test.mjs`: aprovado.
- `node --experimental-test-module-mocks --import ./tests/register.mjs --test tests/logout.test.mjs tests/phase-6.test.mjs`: 15 aprovados, zero falhas.
- `git diff --check`: aprovado (aviso de CRLF referente ao arquivo financeiro
  previamente modificado, que não foi editado).

Os cinco testes novos verificam GET sem mutação, política de referência e hash
CSP, POST legítimo nas duas origens oficiais, 303 e no-store, expiração dos
fragmentos e PKCE, preservação de cookies alheios, origens inválidas/nulas/ausentes,
domínio irmão, protocolo/porta diferentes, Referer e forwarded host incapazes de
contornar Origin, sessão ausente e erro do provedor.
Usam os SDKs Supabase reais instalados e o adaptador de servidor real, substituindo
somente o cookie store do Next, a política de staging e o endpoint HTTP de Auth.
Não comprovam os cabeçalhos Set-Cookie efetivos após passar pela Vercel/middleware.

Uma tentativa adicional de reprodução com Chrome headless e perfil temporário
não respondeu ao controle automatizado e expirou. Não conta como teste aprovado;
o experimento foi retirado do conjunto de arquivos do hotfix. Não houve inspeção
visual automatizada concluída. Consultas HTTP aos domínios oficiais falharam por
conectividade neste ambiente. A leitura do changelog Supabase também ficou
indisponível; foram consultados a documentação de signOut e os SDKs instalados.

## Validação obrigatória após publicação autorizada

1. Observar GET e eventual redirecionamento de ambos os domínios; identificar
   a origem final/canônica antes da confirmação.
2. Com sessão real, abrir Meu Perfil → Sair da Conta; conferir identidade visual,
   foco/teclado e tela estreita. GET/prefetch não deve encerrar sessão.
3. Conferir `Referrer-Policy: same-origin` na resposta e Origin oficial no POST.
   Confirmar ausência de redirecionamento para outro domínio durante o POST.
4. Confirmar revogação no Auth, cookies de sessão/PKCE expirados na resposta,
   HTTP 303 para `/auth/login` e impossibilidade de acessar área protegida após
   recarregar. Conferir que o middleware não reintroduz cookies da sessão antiga.
5. Repetir sem sessão e verificar rejeição 403 de Origin ausente, null e externo.
6. Testar navegação de volta e outra aba, levando em conta o escopo global existente.

Limitações preservadas: access tokens já emitidos pelo Supabase podem permanecer
válidos até expirar; logout global revoga refresh tokens e limpa a sessão do
navegador, não revoga retroativamente cada JWT. Não houve mudança desse contrato.

## Lista exata para futuro commit seletivo

1. `src/app/auth/logout/route.ts`
2. `tests/logout.test.mjs`
3. `docs/LOGOUT-HOTFIX.md`

As alterações locais anteriores em migrations, teste financeiro e demais arquivos
não rastreados foram preservadas e não integram este hotfix.
