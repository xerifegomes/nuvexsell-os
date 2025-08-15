# GitHub Secrets Setup - NuvexSell OS

Para configurar o CI/CD automatizado, você precisa adicionar estas secrets no GitHub.

## 🔐 Como Configurar

1. Acesse seu repositório no GitHub
2. Vá em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret abaixo:

## 📋 Secrets Obrigatórias

### Cloudflare
```
CLOUDFLARE_API_TOKEN = OgRUPV_ipdFehMaXDKZoUKXmxEJ85hWHe8BkE1cO
CLOUDFLARE_ACCOUNT_ID = 6938b9775448fabcdd8f0c07283f87c1
```

### JWT Secrets (Gere chaves diferentes para cada ambiente)
```
JWT_SECRET_STAGING = nuvexsell-jwt-secret-staging-2024-super-secure
JWT_SECRET_PRODUCTION = nuvexsell-jwt-secret-production-2024-ultra-secure
```

### Stripe (Substitua pelas suas chaves reais)
```
STRIPE_SECRET_STAGING = sk_test_sua_chave_stripe_de_teste_aqui
STRIPE_SECRET_PRODUCTION = sk_live_sua_chave_stripe_de_producao_aqui
```

### Ollama (Para IA)
```
OLLAMA_HOST_STAGING = http://sua-instancia-ollama-staging.com:11434
OLLAMA_HOST_PRODUCTION = http://sua-instancia-ollama-prod.com:11434
```

## 🚀 Verificação

Após configurar todas as secrets:

1. Faça um push para `main` 
2. Verifique a aba **Actions** no GitHub
3. O CI deve executar automaticamente
4. O deploy para staging deve acontecer automaticamente

## 📊 Status dos Recursos

Todos os recursos Cloudflare já estão configurados:

### D1 Databases
- **Development:** `nuvexsell-db` (6b00a85f-d539-49db-896c-8790b00448de)
- **Staging:** `nuvexsell-db-staging` (f3870eeb-0682-423f-921e-322801f6ed94)  
- **Production:** `nuvexsell-db-prod` (fd1a3141-b6c4-4460-9b13-b26e8d31f032)

### KV Namespaces
- **LOGS_KV (dev):** NUVEXSELL_CACHE (b72c4cbed214429b95fa9c85ddfb207f)
- **LOGS_KV (staging):** nuvexsell-cache-staging (7431e781fae74397bd7391b5d30d9138)
- **LOGS_KV (prod):** nuvexsell-cache (d5ddd4319f9f46ea8dd513005823224b)
- **SESSION_KV:** SESSIONS (a583151722b34841ba0f246b7df3d6df)
- **RATE_KV:** RATE_LIMIT (95a30f153bd44b0ab84aaeb44336bcd3)

### R2 Buckets
- **Development:** nuvexsell-assets
- **Staging:** nuvexsell-storage
- **Production:** nuvexsell-uploads

### Queues
- **SCRAPE_QUEUE:** product-processing (1c12941d79b440beb12a8d91ddad053b)
- **AI_SCORE_QUEUE:** ai-pipeline (1603e0a9cc9440a5ac4d40834f991f7e)
- **ORDER_QUEUE:** order-queue (5fa5a7a09b064031aea0da670e975cb6)

## ✅ Próximos Passos

1. Configure as secrets no GitHub
2. Teste o deploy local: `cd apps/worker && pnpm dev`
3. Faça o primeiro commit e push
4. Verifique se o CI/CD funciona
5. Acesse os endpoints em staging para validar