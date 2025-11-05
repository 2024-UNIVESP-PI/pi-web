# Configuração para Deploy no Railway (Frontend)

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Railway:

1. **VITE_API_BASE_URL** (obrigatório)

   - URL base da API backend
   - Exemplo: `https://api-arraiatech.up.railway.app/`
   - Certifique-se de incluir a barra final `/`

2. **VITE_DEBUG** (opcional)
   - Defina como `false` para produção
   - Padrão: `false`

## Passos para Deploy

1. **Criar projeto no Railway**

   - Acesse https://railway.app
   - Crie um novo projeto
   - Selecione "Deploy from GitHub repo" ou "Deploy from local directory"

2. **Configurar variáveis de ambiente**

   - Adicione `VITE_API_BASE_URL` com a URL do seu backend
   - Adicione `VITE_DEBUG=false` se necessário

3. **Configurar build settings**

   - **Build Command**: `npm run build` ou `yarn build`
   - **Start Command**: `npm run start` ou `yarn start`
   - **Output Directory**: `dist`

4. **Build e Deploy**

   - O Railway executará automaticamente:
     - `npm install` ou `yarn install`
     - `npm run build` ou `yarn build`
     - `npm run start` ou `yarn start`

5. **Configurar domínio**
   - No Railway, vá em Settings > Networking
   - Gere um domínio customizado ou use o domínio `.railway.app` fornecido
   - Adicione o domínio nas configurações do backend (CORS)

## Configuração de CORS no Backend

Certifique-se de que o backend está configurado para aceitar requisições do frontend:

```python
CORS_ALLOWED_ORIGINS = [
    'https://arraia-tech.up.railway.app',
    'https://seu-dominio-frontend.railway.app',
]
```

Ou use `CORS_ALLOW_ALL_ORIGINS = True` para desenvolvimento (não recomendado para produção).

## Troubleshooting

### Erro de conexão com API

- Verifique se `VITE_API_BASE_URL` está configurada corretamente
- Verifique se o backend está rodando e acessível
- Verifique se o CORS está configurado corretamente no backend

### Erro de build

- Verifique se todas as dependências estão no `package.json`
- Verifique se há erros de TypeScript ou ESLint
- Execute `npm run build` localmente para verificar erros

### Erro de runtime

- Verifique se as variáveis de ambiente estão configuradas
- Verifique os logs do Railway para erros específicos
- Verifique se o servidor está rodando na porta correta

## Notas Importantes

- O frontend usa Vite, então as variáveis de ambiente devem começar com `VITE_`
- O build gera arquivos estáticos na pasta `dist/`
- O servidor usa `http-server-spa` para servir arquivos estáticos com SPA routing
- Certifique-se de que o backend está acessível via HTTPS em produção
