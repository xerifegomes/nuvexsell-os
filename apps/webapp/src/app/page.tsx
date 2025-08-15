import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            NuvexSell OS
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-cyan-100">
            SaaS Unificado de Dropshipping com IA
          </p>
          <p className="text-lg mb-10 text-cyan-200 max-w-2xl mx-auto">
            Unifique scraping, análise de IA e automação de pedidos em uma única plataforma.
            Cloudflare Workers + Container IA para máxima performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8">
              Começar Gratuitamente
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white hover:text-cyan-600">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos e Funcionalidades
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para seu negócio de dropshipping
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* FREE Plan */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center">FREE</CardTitle>
                <CardDescription className="text-center">
                  Para iniciantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">R$ 0</div>
                  <div className="text-sm text-muted-foreground">/mês</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✅ 50 produtos</li>
                  <li>✅ 20 importações/dia</li>
                  <li>✅ Scraping básico</li>
                  <li>✅ Dashboard básico</li>
                </ul>
                <Button className="w-full">Começar</Button>
              </CardContent>
            </Card>

            {/* VIP Plan */}
            <Card className="border-2 border-primary hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center text-primary">VIP</CardTitle>
                <CardDescription className="text-center">
                  Com IA de preço/sentimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">R$ 97</div>
                  <div className="text-sm text-muted-foreground">/mês</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✅ 500 produtos</li>
                  <li>✅ 200 importações/dia</li>
                  <li>✅ Score IA</li>
                  <li>✅ Análise de sentimento</li>
                </ul>
                <Button className="w-full">Escolher VIP</Button>
              </CardContent>
            </Card>

            {/* CORPORATE Plan */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center">CORPORATE</CardTitle>
                <CardDescription className="text-center">
                  Automação completa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">R$ 297</div>
                  <div className="text-sm text-muted-foreground">/mês</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✅ 5.000 produtos</li>
                  <li>✅ 2.000 importações/dia</li>
                  <li>✅ Automação de pedidos</li>
                  <li>✅ Gestão de estoque</li>
                </ul>
                <Button className="w-full">Escolher Corporate</Button>
              </CardContent>
            </Card>

            {/* GODMODE Plan */}
            <Card className="border-2 border-yellow-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center text-yellow-600">GODMODE</CardTitle>
                <CardDescription className="text-center">
                  Poder máximo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">R$ 697</div>
                  <div className="text-sm text-muted-foreground">/mês</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✅ 20.000 produtos</li>
                  <li>✅ 10.000 importações/dia</li>
                  <li>✅ Todas as funcionalidades</li>
                  <li>✅ White-label</li>
                </ul>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">Escolher Godmode</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Arquitetura Moderna
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Construído com as melhores tecnologias para performance e escalabilidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Cloudflare Workers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  API ultra-rápida rodando na edge network global da Cloudflare.
                  D1, KV, R2 e Queues para máxima performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 Container IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ollama rodando em container anexado ao Worker.
                  Modelos locais para análise de preço e sentimento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Multi-tenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Arquitetura multi-tenant com planos e limites por request.
                  JWT, rate limiting e logs estruturados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">NuvexSell OS</div>
          <p className="text-muted-foreground mb-6">
            SaaS Unificado de Dropshipping com IA
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Documentação</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
            <a href="#" className="hover:text-primary transition-colors">Suporte</a>
            <a href="#" className="hover:text-primary transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}