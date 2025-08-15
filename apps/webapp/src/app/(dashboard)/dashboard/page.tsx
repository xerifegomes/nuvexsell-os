"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Target,
  Zap,
  Bot,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

// Dados mockados
const salesData = [
  { month: "Jan", vendas: 4000, lucro: 2400, produtos: 240 },
  { month: "Fev", vendas: 3000, lucro: 1398, produtos: 180 },
  { month: "Mar", vendas: 5000, lucro: 3800, produtos: 320 },
  { month: "Abr", vendas: 8000, lucro: 5908, produtos: 480 },
  { month: "Mai", vendas: 7000, lucro: 4800, produtos: 420 },
  { month: "Jun", vendas: 9000, lucro: 6800, produtos: 540 },
]

const productPerformance = [
  { name: "Eletrônicos", value: 35, fill: "#8b5cf6" },
  { name: "Moda", value: 25, fill: "#3b82f6" },
  { name: "Casa", value: 20, fill: "#10b981" },
  { name: "Esportes", value: 12, fill: "#f59e0b" },
  { name: "Outros", value: 8, fill: "#6b7280" },
]

const aiScoreData = [
  { subject: "Preço", A: 85, fullMark: 100 },
  { subject: "Demanda", A: 92, fullMark: 100 },
  { subject: "Competição", A: 78, fullMark: 100 },
  { subject: "Sentimento", A: 88, fullMark: 100 },
  { subject: "Tendência", A: 95, fullMark: 100 },
]

const metrics = [
  {
    title: "Vendas Totais",
    value: "R$ 36.000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Produtos Ativos",
    value: "2.100",
    change: "+8.2%",
    trend: "up",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Pedidos",
    value: "480",
    change: "-3.1%",
    trend: "down",
    icon: ShoppingCart,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Score IA Médio",
    value: "87.6",
    change: "+5.4%",
    trend: "up",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "import",
    title: "50 produtos importados",
    description: "Amazon - Eletrônicos",
    time: "2 min atrás",
    icon: Package,
  },
  {
    id: 2,
    type: "ai",
    title: "Análise IA concluída",
    description: "15 produtos com score > 90",
    time: "15 min atrás",
    icon: Bot,
  },
  {
    id: 3,
    type: "order",
    title: "Novo pedido #1234",
    description: "R$ 899,90 - 3 itens",
    time: "1 hora atrás",
    icon: ShoppingCart,
  },
  {
    id: 4,
    type: "automation",
    title: "Automação executada",
    description: "Atualização de preços",
    time: "2 horas atrás",
    icon: Zap,
  },
]

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

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("7d")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo do seu negócio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Exportar Relatório
          </Button>
          <Button size="sm" className="gap-2">
            <Package className="h-4 w-4" />
            Importar Produtos
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={item}>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className={cn("rounded-lg p-2", metric.bgColor)}>
                  <metric.icon className={cn("h-4 w-4", metric.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      metric.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">vs mês anterior</span>
                </div>
                <Progress
                  value={metric.trend === "up" ? 75 : 25}
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Visão Geral de Vendas</CardTitle>
                <CardDescription>
                  Vendas, lucro e produtos vendidos nos últimos 6 meses
                </CardDescription>
              </div>
              <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <TabsList className="grid w-[200px] grid-cols-3">
                  <TabsTrigger value="7d">7D</TabsTrigger>
                  <TabsTrigger value="30d">30D</TabsTrigger>
                  <TabsTrigger value="90d">90D</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                vendas: {
                  label: "Vendas",
                  color: "#8b5cf6",
                },
                lucro: {
                  label: "Lucro",
                  color: "#10b981",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorVendas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorLucro)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="col-span-3 space-y-4">
          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
              <CardDescription>
                Distribuição de vendas por categoria de produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Vendas",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productPerformance}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {productPerformance.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.fill }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Score Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Score IA Médio</CardTitle>
              <CardDescription>
                Análise multidimensional dos produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "#8b5cf6",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={aiScoreData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="subject" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atividades Recentes</CardTitle>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    activity.type === "import" && "bg-blue-500/10 text-blue-500",
                    activity.type === "ai" && "bg-purple-500/10 text-purple-500",
                    activity.type === "order" && "bg-green-500/10 text-green-500",
                    activity.type === "automation" &&
                      "bg-orange-500/10 text-orange-500"
                  )}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}