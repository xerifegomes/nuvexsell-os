"use client"

import * as React from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from "reactflow"
import "reactflow/dist/style.css"
import { motion } from "framer-motion"
import {
  Brain,
  TrendingUp,
  DollarSign,
  Heart,
  ShoppingCart,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Package,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

// Custom Node Components
const AIAnalysisNode = ({ data }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-5 w-5" />
        <span className="font-semibold">Análise IA</span>
      </div>
      <div className="text-sm opacity-90">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const MetricNode = ({ data }: NodeProps) => {
  const icons = {
    price: DollarSign,
    sentiment: Heart,
    demand: TrendingUp,
    competition: Users,
  }
  const Icon = icons[data.type as keyof typeof icons] || Target

  return (
    <div className="bg-card border rounded-lg p-4 min-w-[180px]">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-5 w-5", data.color)} />
        <span className="font-medium">{data.label}</span>
      </div>
      <div className="text-2xl font-bold">{data.value}</div>
      <Progress value={data.progress} className="mt-2 h-2" />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const ResultNode = ({ data }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-4 text-white min-w-[200px]">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="h-5 w-5" />
        <span className="font-semibold">Resultado</span>
      </div>
      <div className="text-3xl font-bold">{data.score}/100</div>
      <div className="text-sm opacity-90">{data.recommendation}</div>
    </div>
  )
}

const nodeTypes = {
  aiAnalysis: AIAnalysisNode,
  metric: MetricNode,
  result: ResultNode,
}

// Dados da análise
const analysisResults = [
  {
    id: "1",
    product: "iPhone 15 Pro Max",
    score: 92,
    status: "excellent",
    metrics: {
      price: { value: 85, trend: "up" },
      sentiment: { value: 95, trend: "up" },
      demand: { value: 90, trend: "stable" },
      competition: { value: 88, trend: "down" },
    },
    insights: [
      "Alta demanda identificada para este produto",
      "Preço competitivo em relação ao mercado",
      "Sentimento extremamente positivo nas reviews",
    ],
    risks: ["Estoque limitado no fornecedor", "Competição crescente"],
  },
  {
    id: "2",
    product: "Nike Air Max 2024",
    score: 88,
    status: "good",
    metrics: {
      price: { value: 82, trend: "stable" },
      sentiment: { value: 88, trend: "up" },
      demand: { value: 92, trend: "up" },
      competition: { value: 85, trend: "stable" },
    },
    insights: [
      "Tendência de alta nas buscas",
      "Margem de lucro acima da média",
      "Produto sazonal com pico previsto",
    ],
    risks: ["Variação de tamanhos pode afetar vendas"],
  },
]

export default function AnalyticsPage() {
  const [selectedProduct, setSelectedProduct] = React.useState(analysisResults[0])
  const [analysisType, setAnalysisType] = React.useState("complete")
  const [priceWeight, setPriceWeight] = React.useState([70])
  const [sentimentWeight, setSentimentWeight] = React.useState([80])
  const [demandWeight, setDemandWeight] = React.useState([90])

  // ReactFlow setup
  const initialNodes: Node[] = [
    {
      id: "1",
      type: "aiAnalysis",
      position: { x: 50, y: 100 },
      data: { label: "Processando dados..." },
    },
    {
      id: "2",
      type: "metric",
      position: { x: 300, y: 50 },
      data: {
        label: "Análise de Preço",
        value: `${selectedProduct.metrics.price.value}%`,
        progress: selectedProduct.metrics.price.value,
        type: "price",
        color: "text-green-500",
      },
    },
    {
      id: "3",
      type: "metric",
      position: { x: 300, y: 150 },
      data: {
        label: "Sentimento",
        value: `${selectedProduct.metrics.sentiment.value}%`,
        progress: selectedProduct.metrics.sentiment.value,
        type: "sentiment",
        color: "text-pink-500",
      },
    },
    {
      id: "4",
      type: "metric",
      position: { x: 300, y: 250 },
      data: {
        label: "Demanda",
        value: `${selectedProduct.metrics.demand.value}%`,
        progress: selectedProduct.metrics.demand.value,
        type: "demand",
        color: "text-blue-500",
      },
    },
    {
      id: "5",
      type: "result",
      position: { x: 550, y: 150 },
      data: {
        score: selectedProduct.score,
        recommendation: "Recomendado para venda",
      },
    },
  ]

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: true,
      style: { stroke: "#8b5cf6" },
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      animated: true,
      style: { stroke: "#8b5cf6" },
    },
    {
      id: "e1-4",
      source: "1",
      target: "4",
      animated: true,
      style: { stroke: "#8b5cf6" },
    },
    {
      id: "e2-5",
      source: "2",
      target: "5",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e3-5",
      source: "3",
      target: "5",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e4-5",
      source: "4",
      target: "5",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = React.useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise IA</h1>
          <p className="text-muted-foreground">
            Insights inteligentes para otimizar suas vendas
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedProduct.id}
            onValueChange={(id) =>
              setSelectedProduct(analysisResults.find((p) => p.id === id)!)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {analysisResults.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Nova Análise
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Flow Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Análise IA</CardTitle>
            <CardDescription>
              Visualização do processo de análise e scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg border bg-muted/20">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        {/* Score Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Score Final</CardTitle>
            <CardDescription>Análise completa do produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={cn(
                  "inline-flex h-32 w-32 items-center justify-center rounded-full",
                  selectedProduct.score >= 90
                    ? "bg-green-500/20 text-green-500"
                    : selectedProduct.score >= 70
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-red-500/20 text-red-500"
                )}
              >
                <span className="text-5xl font-bold">{selectedProduct.score}</span>
              </motion.div>
              <Badge
                variant={
                  selectedProduct.status === "excellent"
                    ? "default"
                    : selectedProduct.status === "good"
                    ? "secondary"
                    : "destructive"
                }
                className="mt-4"
              >
                {selectedProduct.status === "excellent"
                  ? "Excelente"
                  : selectedProduct.status === "good"
                  ? "Bom"
                  : "Necessita Atenção"}
              </Badge>
            </div>

            <div className="space-y-3">
              {Object.entries(selectedProduct.metrics).map(([key, metric]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{metric.value}%</span>
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : metric.trend === "down" ? (
                        <TrendingUp className="h-3 w-3 rotate-180 text-red-500" />
                      ) : (
                        <span className="h-3 w-3">→</span>
                      )}
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights Principais</CardTitle>
            <CardDescription>
              Recomendações baseadas na análise IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selectedProduct.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Pontos de Atenção
              </h4>
              <div className="space-y-2">
                {selectedProduct.risks.map((risk, index) => (
                  <p key={index} className="text-sm text-muted-foreground pl-6">
                    • {risk}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Pesos</CardTitle>
            <CardDescription>
              Ajuste a importância de cada métrica na análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Peso do Preço
                </Label>
                <span className="text-sm font-medium">{priceWeight[0]}%</span>
              </div>
              <Slider
                value={priceWeight}
                onValueChange={setPriceWeight}
                max={100}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Peso do Sentimento
                </Label>
                <span className="text-sm font-medium">{sentimentWeight[0]}%</span>
              </div>
              <Slider
                value={sentimentWeight}
                onValueChange={setSentimentWeight}
                max={100}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Peso da Demanda
                </Label>
                <span className="text-sm font-medium">{demandWeight[0]}%</span>
              </div>
              <Slider
                value={demandWeight}
                onValueChange={setDemandWeight}
                max={100}
                step={10}
              />
            </div>

            <Button className="w-full">Recalcular Score</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, className, ...props }: any) {
  return (
    <label className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </label>
  )
}