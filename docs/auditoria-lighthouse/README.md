# Evidências Lighthouse

Esta pasta guarda os screenshots das auditorias Lighthouse usadas como evidência no relatório final.

## Rotas auditadas

Auditoria executada em 02/11/2026 no build local da branch, com Lighthouse
focado na categoria `accessibility`. As três rotas públicas obtiveram 100:

- `caixa-login.png` e `caixa-login.html` — `/caixa-login` (100)
- `admin-login.png` e `admin-login.html` — `/admin-login` (100)
- `reserva-publica.png` e `reserva-publica.html` — `/reservas/demo` (100)

Os PNGs são screenshots do relatório Lighthouse completo e os HTMLs permitem
revisar os detalhes da auditoria posteriormente.

As rotas protegidas (`/`, `/vendas`, `/fichas`, `/admin-dashboard`,
`/admin-reservas`, `/admin-caixas`, `/admin-produtos`, `/admin-fichas` e
`/admin-movimentacoes`) exigem uma sessão válida de produção. Elas ficam
pendentes até que uma credencial de teste seja disponibilizada; não foram
simuladas para evitar registrar uma evidência inválida.
