"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  Building,
  Package,
  Zap,
  HelpCircle,
  ChevronRight,
  Check,
  X,
  Sparkles,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Configurações de planos
const plans = [
  {
    id: "free",
    name: "FREE",
    price: 0,
    limits: {
      products: 50,
      imports: 20,
      aiAnalysis: false,
      automation: false,
    },
    features: [
      "50 produtos",
      "20 importações/dia",
      "Dashboard básico",
      "Suporte por email",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    price: 97,
    limits: {
      products: 500,
      imports: 200,
      aiAnalysis: true,
      automation: false,
    },
    features: [
      "500 produtos",
      "200 importações/dia",
      "Análise IA completa",
      "Score de produtos",
      "Suporte prioritário",
    ],
  },
  {
    id: "corporate",
    name: "CORPORATE",
    price: 297,
    limits: {
      products: 5000,
      imports: 2000,
      aiAnalysis: true,
      automation: true,
    },
    features: [
      "5.000 produtos",
      "2.000 importações/dia",
      "Análise IA avançada",
      "Automação completa",
      "API access",
      "Suporte 24/7",
    ],
  },
  {
    id: "godmode",
    name: "GODMODE",
    price: 697,
    limits: {
      products: 20000,
      imports: 10000,
      aiAnalysis: true,
      automation: true,
    },
    features: [
      "20.000 produtos",
      "10.000 importações/dia",
      "Todas as funcionalidades",
      "White-label",
      "Consultoria dedicada",
      "SLA garantido",
    ],
  },
]

// Dados do usuário mockados
const userData = {
  name: "João Silva",
  email: "joao@empresa.com",
  phone: "(11) 98765-4321",
  company: "Minha Loja Online",
  plan: "vip",
  usage: {
    products: 287,
    productsLimit: 500,
    imports: 145,
    importsLimit: 200,
    storage: 2.8,
    storageLimit: 10,
  },
}

export default function SettingsPage() {
  const [currentPlan] = React.useState(plans.find(p => p.id === userData.plan))
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<typeof plans[0] | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências do sistema
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="billing">Cobrança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil e contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue={userData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userData.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue={userData.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" defaultValue={userData.company} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Sobre</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você e seu negócio..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Dispositivos Conectados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notificações por Email</h3>
                {[
                  {
                    id: "orders",
                    label: "Novos Pedidos",
                    description: "Receba um email quando houver novos pedidos",
                  },
                  {
                    id: "stock",
                    label: "Alertas de Estoque",
                    description: "Notificações quando o estoque estiver baixo",
                  },
                  {
                    id: "price",
                    label: "Mudanças de Preço",
                    description: "Alertas sobre variações significativas de preço",
                  },
                  {
                    id: "ai",
                    label: "Insights da IA",
                    description: "Recomendações e análises da inteligência artificial",
                  },
                ].map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <Label>{notification.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notificações Push</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ativar Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações em tempo real no navegador
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Frequência de Resumo</h3>
                <RadioGroup defaultValue="daily">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="realtime" id="realtime" />
                    <Label htmlFor="realtime">Tempo Real</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Resumo Diário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Resumo Semanal</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>
                Gerencie sua assinatura e uso de recursos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center",
                      currentPlan?.id === "vip" && "bg-purple-500/10 text-purple-500",
                      currentPlan?.id === "corporate" && "bg-blue-500/10 text-blue-500",
                      currentPlan?.id === "godmode" && "bg-yellow-500/10 text-yellow-500"
                    )}
                  >
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Plano {currentPlan?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      R$ {currentPlan?.price}/mês
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Fazer Upgrade
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Uso de Recursos</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Produtos</span>
                      <span>
                        {userData.usage.products} / {userData.usage.productsLimit}
                      </span>
                    </div>
                    <Progress
                      value={(userData.usage.products / userData.usage.productsLimit) * 100}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Importações (hoje)</span>
                      <span>
                        {userData.usage.imports} / {userData.usage.importsLimit}
                      </span>
                    </div>
                    <Progress
                      value={(userData.usage.imports / userData.usage.importsLimit) * 100}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Armazenamento</span>
                      <span>
                        {userData.usage.storage}GB / {userData.usage.storageLimit}GB
                      </span>
                    </div>
                    <Progress
                      value={(userData.usage.storage / userData.usage.storageLimit) * 100}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Histórico de Faturas</h3>
                <div className="space-y-2">
                  {[
                    { date: "01/01/2024", amount: "R$ 97,00", status: "paid" },
                    { date: "01/12/2023", amount: "R$ 97,00", status: "paid" },
                    { date: "01/11/2023", amount: "R$ 97,00", status: "paid" },
                  ].map((invoice, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Fatura de {invoice.date}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.amount}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Baixar PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Conecte sua conta com outras plataformas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Amazon",
                  description: "Importe produtos diretamente da Amazon",
                  connected: true,
                  icon: "🛒",
                },
                {
                  name: "AliExpress",
                  description: "Sincronize com sua conta AliExpress",
                  connected: true,
                  icon: "🏪",
                },
                {
                  name: "Stripe",
                  description: "Processe pagamentos com Stripe",
                  connected: false,
                  icon: "💳",
                },
                {
                  name: "Google Analytics",
                  description: "Acompanhe métricas avançadas",
                  connected: false,
                  icon: "📊",
                },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{integration.icon}</div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  {integration.connected ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-500">
                      Conectado
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Conectar
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API</CardTitle>
              <CardDescription>
                Gerencie suas chaves de acesso à API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Chave de Produção</p>
                  <Badge>Ativa</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-background text-sm">
                    nuvex_live_k3y_xxxxxxxxxxxxxxxxxxx
                  </code>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Limites de Taxa</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Requisições/hora:</span>
                    <span>1.000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Requisições/dia:</span>
                    <span>10.000</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Gerar Nova Chave
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Opções avançadas e configurações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Desenvolvedor</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativa logs detalhados e ferramentas de debug
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Análise Beta</Label>
                    <p className="text-sm text-muted-foreground">
                      Teste recursos experimentais de IA
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Backup diário dos seus dados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full justify-start text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Cache
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Resetar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fazer Upgrade do Plano</DialogTitle>
            <DialogDescription>
              Escolha o plano ideal para escalar seu negócio
            </DialogDescription>
          </DialogHeader>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-4 mt-6"
          >
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={item}>
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedPlan?.id === plan.id && "ring-2 ring-primary",
                    currentPlan?.id === plan.id && "opacity-50"
                  )}
                  onClick={() => {
                    if (currentPlan?.id !== plan.id) {
                      setSelectedPlan(plan)
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-center">{plan.name}</CardTitle>
                    <CardDescription className="text-center">
                      <span className="text-2xl font-bold">R$ {plan.price}</span>
                      <span className="text-sm">/mês</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedPlan || currentPlan?.id === selectedPlan?.id}
              onClick={() => {
                // Processar upgrade
                setUpgradeDialogOpen(false)
              }}
            >
              Confirmar Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Copy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  )
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  )
}