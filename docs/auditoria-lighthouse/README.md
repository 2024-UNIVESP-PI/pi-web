# Evidências Lighthouse

Esta pasta guarda os screenshots das auditorias Lighthouse usadas como evidência no relatório final.

## Rotas

Salvar um screenshot do relatório completo para cada rota, usando o ambiente de produção ou o preview aprovado:

- `login-admin.png` — `/admin/login`
- `login-caixa.png` — `/caixa/login`
- `dashboard.png` — `/admin/dashboard`
- `caixa-vendas.png` — `/vendas`
- `fichas.png` — `/fichas`
- `reservas.png` — `/reservas`
- `reserva-publica.png` — `/reserva/<qr_code>`

Para cada imagem, registrar no relatório final a data, URL/ambiente, estado de autenticação e a pontuação de acessibilidade. Rotas protegidas devem ser auditadas com uma sessão válida; a rota pública deve usar um QR code de teste.

Os screenshots ainda não são gerados pelos testes Vitest: Lighthouse precisa executar a aplicação em um navegador. Não usar imagens fictícias como evidência.
