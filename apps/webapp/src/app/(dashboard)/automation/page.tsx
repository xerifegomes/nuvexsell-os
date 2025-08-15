"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
} from "reactflow"
import "reactflow/dist/style.css"
import {
  Zap,
  Package,
  ShoppingCart,
  Bell,
  Mail,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  Bot,
  Sparkles,
  GitBranch,
  Timer,
  Calendar,
  Users,
  Target,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Tipos de nós de automação
const TriggerNode = ({ data, selected }: NodeProps) => {
  const icons = {
    time: Clock,
    price: DollarSign,
    stock: Package,
    order: ShoppingCart,
    metric: TrendingUp,
  }
  const Icon = icons[data.type as keyof typeof icons] || Zap

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white min-w-[200px] transition-all",
        selected && "ring-2 ring-purple-500 ring-offset-2"
      )}
    >
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5" />
        <span className="font-semibold">Gatilho</span>
      </div>
      <div className="text-sm opacity-90">{data.label}</div>
      {data.config && (
        <div className="mt-2 text-xs opacity-75">
          {data.config}
        </div>
      )}
    </div>
  )
}

const ConditionNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "bg-card border-2 border-yellow-500 rounded-lg p-4 min-w-[180px] transition-all",
        selected && "ring-2 ring-yellow-500 ring-offset-2"
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="h-5 w-5 text-yellow-500" />
        <span className="font-medium">Condição</span>
      </div>
      <div className="text-sm">{data.label}</div>
      <div className="flex gap-2 mt-2">
        <Handle
          type="source"
          position={Position.Right}
          id="yes"
          style={{ top: "30%" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="no"
          style={{ top: "70%" }}
        />
      </div>
    </div>
  )
}

const ActionNode = ({ data, selected }: NodeProps) => {
  const icons = {
    email: Mail,
    notification: Bell,
    updatePrice: DollarSign,
    updateStock: Package,
    createOrder: ShoppingCart,
  }
  const Icon = icons[data.type as keyof typeof icons] || Zap

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 min-w-[180px] transition-all",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-5 w-5", data.color || "text-primary")} />
        <span className="font-medium">Ação</span>
      </div>
      <div className="text-sm text-muted-foreground">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
}

// Automações de exemplo
const automations = [
  {
    id: "1",
    name: "Reprecificação Automática",
    description: "Ajusta preços baseado na concorrência",
    status: "active",
    triggers: 24,
    lastRun: "5 min atrás",
    nodes: [
      {
        id: "1",
        type: "trigger",
        position: { x: 50, y: 100 },
        data: {
          label: "A cada 30 minutos",
          type: "time",
          config: "*/30 * * * *",
        },
      },
      {
        id: "2",
        type: "condition",
        position: { x: 250, y: 100 },
        data: {
          label: "Preço concorrente < nosso?",
        },
      },
      {
        id: "3",
        type: "action",
        position: { x: 500, y: 50 },
        data: {
          label: "Reduzir preço em 5%",
          type: "updatePrice",
          color: "text-green-500",
        },
      },
      {
        id: "4",
        type: "action",
        position: { x: 500, y: 150 },
        data: {
          label: "Manter preço atual",
          type: "updatePrice",
          color: "text-blue-500",
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", animated: true },
      {
        id: "e2-3",
        source: "2",
        sourceHandle: "yes",
        target: "3",
        label: "Sim",
      },
      { id: "e2-4", source: "2", sourceHandle: "no", target: "4", label: "Não" },
    ],
  },
  {
    id: "2",
    name: "Alerta de Estoque Baixo",
    description: "Notifica quando estoque está acabando",
    status: "active",
    triggers: 12,
    lastRun: "1 hora atrás",
  },
  {
    id: "3",
    name: "Processamento de Pedidos",
    description: "Automatiza pedidos para fornecedores",
    status: "paused",
    triggers: 0,
    lastRun: "3 dias atrás",
  },
]

export default function AutomationPage() {
  const [selectedAutomation, setSelectedAutomation] = React.useState(automations[0])
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState(
    selectedAutomation.nodes || []
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    selectedAutomation.edges || []
  )

  const onConnect = React.useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automação</h1>
          <p className="text-muted-foreground">
            Configure fluxos inteligentes para seu negócio
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Automação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Automação</DialogTitle>
              <DialogDescription>
                Configure um novo fluxo de automação para seu negócio
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Automação</Label>
                <Input placeholder="Ex: Reprecificação Automática" />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva o que esta automação faz..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Template Inicial</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      name: "Reprecificação",
                      icon: DollarSign,
                      description: "Ajusta preços automaticamente",
                    },
                    {
                      name: "Gestão de Estoque",
                      icon: Package,
                      description: "Monitora e atualiza estoque",
                    },
                    {
                      name: "Notificações",
                      icon: Bell,
                      description: "Envia alertas personalizados",
                    },
                    {
                      name: "Processamento de Pedidos",
                      icon: ShoppingCart,
                      description: "Automatiza pedidos",
                    },
                  ].map((template) => (
                    <Card
                      key={template.name}
                      className="cursor-pointer hover:border-primary transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <template.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Criar Automação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Automation List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-3"
      >
        {automations.map((automation) => (
          <motion.div key={automation.id} variants={item}>
            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedAutomation.id === automation.id &&
                  "ring-2 ring-primary"
              )}
              onClick={() => setSelectedAutomation(automation)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {automation.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Logs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>{automation.triggers} triggers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{automation.lastRun}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      automation.status === "active" ? "default" : "secondary"
                    }
                  >
                    {automation.status === "active" ? "Ativa" : "Pausada"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Automation Editor */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Editor de Fluxo</CardTitle>
                <CardDescription>
                  Arraste e conecte blocos para criar sua automação
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    selectedAutomation.status === "active" && "text-green-500"
                  )}
                >
                  {selectedAutomation.status === "active" ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ativar
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg border bg-muted/10">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background variant={BackgroundVariant.Dots} />
                <Controls />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        {/* Blocks Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Blocos Disponíveis</CardTitle>
            <CardDescription>
              Arraste para adicionar ao fluxo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="triggers">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="triggers">Gatilhos</TabsTrigger>
                <TabsTrigger value="conditions">Condições</TabsTrigger>
                <TabsTrigger value="actions">Ações</TabsTrigger>
              </TabsList>

              <TabsContent value="triggers" className="space-y-2">
                {[
                  { icon: Clock, label: "Tempo", description: "Intervalo ou horário" },
                  { icon: DollarSign, label: "Preço", description: "Mudança de preço" },
                  { icon: Package, label: "Estoque", description: "Nível de estoque" },
                  { icon: ShoppingCart, label: "Pedido", description: "Novo pedido" },
                ].map((trigger) => (
                  <div
                    key={trigger.label}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-move"
                    draggable
                  >
                    <trigger.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{trigger.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {trigger.description}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="conditions" className="space-y-2">
                {[
                  { icon: Filter, label: "Filtro", description: "Condição simples" },
                  { icon: GitBranch, label: "If/Else", description: "Condição complexa" },
                  { icon: Users, label: "Segmento", description: "Por tipo de cliente" },
                  { icon: Target, label: "Meta", description: "Baseado em objetivos" },
                ].map((condition) => (
                  <div
                    key={condition.label}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-move"
                    draggable
                  >
                    <condition.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{condition.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {condition.description}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="actions" className="space-y-2">
                {[
                  { icon: Mail, label: "Email", description: "Enviar email" },
                  { icon: Bell, label: "Notificação", description: "Push notification" },
                  { icon: DollarSign, label: "Atualizar Preço", description: "Mudar preço" },
                  { icon: Package, label: "Atualizar Estoque", description: "Ajustar estoque" },
                ].map((action) => (
                  <div
                    key={action.label}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-move"
                    draggable
                  >
                    <action.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Automation Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Execuções Hoje",
            value: "156",
            change: "+12%",
            icon: Play,
            color: "text-green-500",
          },
          {
            label: "Taxa de Sucesso",
            value: "98.5%",
            change: "+2.3%",
            icon: CheckCircle,
            color: "text-blue-500",
          },
          {
            label: "Tempo Médio",
            value: "1.2s",
            change: "-15%",
            icon: Timer,
            color: "text-purple-500",
          },
          {
            label: "Economia Gerada",
            value: "R$ 12.5k",
            change: "+25%",
            icon: DollarSign,
            color: "text-orange-500",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change} vs ontem</p>
                </div>
                <div className={cn("h-10 w-10 rounded-lg bg-card flex items-center justify-center", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}