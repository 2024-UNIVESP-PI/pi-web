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

As rotas administrativas abaixo foram auditadas em produção com uma sessão
administrativa válida. O modo `Snapshot` foi usado para preservar a sessão,
com dispositivo `Desktop`, categoria `accessibility` e Lighthouse 13.4.1:

- `admin-dashboard.png` — `/admin-dashboard` (22/25): contraste, ordem de
  headings e alternativa textual de SVG.
- `admin-reservas.png` — `/admin-reservas` (19/20): contraste.
- `admin-caixas.png` — `/admin-caixas` (18/20): selects sem labels associados e
  contraste.
- `admin-produtos.png` — `/admin-produtos` (18/20): selects sem labels
  associados e alvos de toque pequenos.
- `admin-fichas.png` — `/admin-fichas` (18/20): selects sem labels associados e
  contraste.
- `admin-movimentacoes.png` — `/admin-movimentacoes` (18/19): contraste.

As rotas do caixa foram auditadas em produção com uma sessão de caixa válida,
também em `Snapshot`, `Desktop`, categoria `accessibility` e Lighthouse 13.4.1:

- `caixa-vendas-com-produtos.png` — `/vendas` (21/21), com os 12 produtos
  carregados: nenhuma falha automatizada e 10 verificações manuais.
- `caixa-fichas-com-produtos.png` — `/fichas` (20/21): contraste e 10
  verificações manuais.

Os PNGs são screenshots do relatório Lighthouse completo para referência no
relatório final. Nenhuma credencial foi salva nesta pasta. O Lighthouse é uma
verificação automatizada e não substitui a revisão manual completa de WCAG.
