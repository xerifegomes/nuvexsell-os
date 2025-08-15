# NuvexSell OS

SaaS Unificado de Dropshipping com IA - Cloudflare Workers + Container IA

## 📋 Visão Geral

NuvexSell OS é uma plataforma completa que unifica **3 projetos** em um único SaaS multi-tenant:

1. **Scraper de Dropshipping** - Importação e normalização de produtos
2. **IA de Preço/Sentimento** - Score IA para otimização de produtos  
3. **Automação de Pedidos/Estoque** - Operação completa de dropshipping

### 🎯 Arquitetura

```
┌─ Base (FREE) ────────────────────┐
│ Scraper + Dashboard Básico       │
├─ Premium (VIP) ──────────────────┤
│ + Score IA + Análise Sentimento  │
├─ Enterprise (CORPORATE) ─────────┤
│ + Automação Pedidos + Estoque    │
└─ Godmode ───────────────────────┘
  + Todas funcionalidades + White-label
```

**Stack Tecnológico:**
- **Runtime:** Cloudflare Workers (edge computing)
- **Database:** D1 (SQLite distribuído)
- **Storage:** KV (cache), R2 (mídia), Queues (jobs)
- **IA:** Container Ollama anexado ao Worker
- **Frontend:** Next.js 14 + Tailwind + shadcn/ui
- **Monorepo:** pnpm + Turbo

## 🚀 Getting Started

### 1. Pré-requisitos

```bash
# Node.js 18+ LTS
node --version  # v18.x.x

# pnpm
npm install -g pnpm@8.15.0
```

### 2. Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd nuvexsell-os

# Instalar dependências
pnpm install

# Build packages
pnpm build
```

### 3. Desenvolvimento Local

```bash
# Cloudflare Worker (API)
cd apps/worker
cp .dev.vars.example .dev.vars
# Edite .dev.vars com suas chaves
pnpm dev

# Next.js WebApp (em outro terminal)
cd apps/webapp
cp .env.example .env.local
# Edite .env.local com as configurações
pnpm dev
```

### 4. Cloudflare Setup

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Login no Cloudflare
wrangler login

# Criar recursos (D1, KV, R2, Queues)
cd apps/worker
wrangler d1 create nuvexsell-db
wrangler kv:namespace create "LOGS_KV"
wrangler kv:namespace create "SESSION_KV"
wrangler kv:namespace create "RATE_KV"
wrangler r2 bucket create nuvexsell-media
wrangler queues create scrape-queue
wrangler queues create ai-score-queue
wrangler queues create order-queue

# Atualizar wrangler.toml com os IDs retornados
```

## 📦 Estrutura do Projeto

```
nuvexsell-os/
├── packages/
│   ├── core/                 # Tipos, schemas Zod, utils, errors
│   ├── scraper/             # Módulo de scraping (TODO)
│   ├── ai-scoring/          # IA de preço/sentimento (TODO)
│   └── ops-automation/      # Automação pedidos/estoque (TODO)
├── apps/
│   ├── worker/              # API Cloudflare Worker (Hono)
│   └── webapp/              # Dashboard Next.js
├── tooling/                 # Scripts, CI/CD, lint configs
└── .github/workflows/       # GitHub Actions
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia todos os apps em modo dev
pnpm build        # Build de todos os packages/apps
pnpm lint         # Lint em todo o monorepo
pnpm test         # Testes em todo o monorepo
pnpm type-check   # Type checking

# Worker específico
pnpm --filter @nuvexsell/worker dev
pnpm --filter @nuvexsell/worker deploy

# WebApp específico  
pnpm --filter @nuvexsell/webapp dev
pnpm --filter @nuvexsell/webapp build
```

## 📊 Planos e Funcionalidades

| Plano | Produtos | Imports/dia | Funcionalidades |
|-------|----------|-------------|-----------------|
| **FREE** | 50 | 20 | Scraper + Dashboard |
| **VIP** | 500 | 200 | + Score IA |
| **CORPORATE** | 5.000 | 2.000 | + Automação Completa |
| **GODMODE** | 20.000 | 10.000 | + White-label |

## 🔌 API Endpoints

### Scraping
```http
POST /v1/scrape/import
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "urls": ["https://example.com/product1", "https://example.com/product2"]
}
```

### IA Scoring (TODO)
```http
POST /v1/ai/score
{
  "productId": ["uuid1", "uuid2"]
}
```

### Orders Management (TODO)
```http
POST /v1/orders
{
  "items": [{"productId": "uuid", "quantity": 1, "price": 99.99}],
  "destination": {"street": "...", "city": "...", ...}
}
```

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Testes com coverage
pnpm test -- --coverage

# Testes específicos
pnpm --filter @nuvexsell/core test
```

## 🚀 Deploy

### Worker (API)
```bash
# Staging
pnpm --filter @nuvexsell/worker deploy:staging

# Production (manual)
pnpm --filter @nuvexsell/worker deploy:prod
```

### WebApp
- **Staging:** Auto-deploy via GitHub Actions no push para `main`
- **Production:** Manual via GitHub Actions workflow

## 🔒 Segurança

- **Auth:** JWT com refresh tokens
- **Rate Limiting:** Sliding window por IP/tenant
- **CORS:** Restrito por environment
- **Secrets:** Cloudflare environment bindings
- **Logs:** Estruturados em KV com TTL

## 📈 Observabilidade

- **Logs:** Estruturados em `LOGS_KV` (JSON + request ID)
- **Metrics:** Endpoint `/metrics` (Prometheus-style)
- **Health:** Endpoint `/healthz` com status dos serviços
- **Tracing:** Request ID em todas as operações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT © NuvexSell Team

## 🔗 Links Úteis

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Next.js 14](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Status:** 🚧 Bootstrap inicial completo - Implementação dos módulos em andamento