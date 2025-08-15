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
  RadialBarChart,
  RadialBar,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Filter,
  Printer,
  Mail,
  Share2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Dados mockados
const salesOverview = [
  { month: "Jan", vendas: 12500, meta: 15000, lucro: 4500 },
  { month: "Fev", vendas: 18500, meta: 18000, lucro: 6800 },
  { month: "Mar", vendas: 22000, meta: 20000, lucro: 8200 },
  { month: "Abr", vendas: 28500, meta: 25000, lucro: 10500 },
  { month: "Mai", vendas: 32000, meta: 30000, lucro: 12000 },
  { month: "Jun", vendas: 38500, meta: 35000, lucro: 14500 },
]

const categoryPerformance = [
  { category: "Eletrônicos", vendas: 45000, produtos: 150, margem: 32 },
  { category: "Moda", vendas: 32000, produtos: 280, margem: 45 },
  { category: "Casa", vendas: 28000, produtos: 120, margem: 38 },
  { category: "Esportes", vendas: 18000, produtos: 95, margem: 28 },
  { category: "Beleza", vendas: 15000, produtos: 180, margem: 52 },
]

const topProducts = [
  { name: "iPhone 15 Pro", vendas: 48, receita: 431000, crescimento: 15 },
  { name: "Nike Air Max", vendas: 124, receita: 74400, crescimento: 22 },
  { name: "Echo Dot 5", vendas: 89, receita: 26700, crescimento: -5 },
  { name: "Samsung TV 55", vendas: 23, receita: 68500, crescimento: 8 },
  { name: "AirPods Pro", vendas: 67, receita: 18800, crescimento: 18 },
]

const customerMetrics = [
  { name: "0-18", clientes: 120, valor: 15000 },
  { name: "19-24", clientes: 380, valor: 48000 },
  { name: "25-34", clientes: 520, valor: 98000 },
  { name: "35-44", clientes: 280, valor: 68000 },
  { name: "45-54", clientes: 150, valor: 38000 },
  { name: "55+", clientes: 80, valor: 18000 },
]

const conversionFunnel = [
  { name: "Visitantes", value: 10000, fill: "#8b5cf6" },
  { name: "Carrinho", value: 3500, fill: "#3b82f6" },
  { name: "Checkout", value: 1200, fill: "#10b981" },
  { name: "Compra", value: 480, fill: "#f59e0b" },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [reportType, setReportType] = React.useState("sales")

  const exportReport = (format: string) => {
    console.log(`Exportando relatório em formato ${format}`)
    // Implementar exportação
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises detalhadas e insights do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportReport("pdf")}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReport("excel")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReport("csv")}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Enviar por Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Receita Total",
            value: "R$ 185.5k",
            change: "+22.5%",
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            title: "Pedidos",
            value: "1,482",
            change: "+15.8%",
            icon: ShoppingCart,
            color: "text-blue-500",
          },
          {
            title: "Ticket Médio",
            value: "R$ 125",
            change: "+5.2%",
            icon: Target,
            color: "text-purple-500",
          },
          {
            title: "Taxa Conversão",
            value: "4.8%",
            change: "+0.8%",
            icon: TrendingUp,
            color: "text-orange-500",
          },
        ].map((stat) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  {" "}vs período anterior
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Reports */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Vendas vs Meta</CardTitle>
                <CardDescription>
                  Comparativo mensal de vendas realizadas e metas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vendas: { label: "Vendas", color: "#8b5cf6" },
                    meta: { label: "Meta", color: "#94a3b8" },
                    lucro: { label: "Lucro", color: "#10b981" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesOverview}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="vendas"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorSales)"
                      />
                      <Line
                        type="monotone"
                        dataKey="meta"
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
                <CardDescription>
                  Vendas e margem de lucro por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryPerformance.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          R$ {(category.vendas / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <Progress value={category.margem * 2} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{category.produtos} produtos</span>
                        <span>{category.margem}% margem</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Produtos</CardTitle>
              <CardDescription>
                Produtos com melhor performance no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.vendas} vendas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {(product.receita / 1000).toFixed(1)}k
                      </p>
                      <p className="text-sm">
                        <span
                          className={
                            product.crescimento > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {product.crescimento > 0 ? "+" : ""}
                          {product.crescimento}%
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Report */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Estoque</CardTitle>
                <CardDescription>
                  Análise de produtos por categoria e estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Produtos" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.category}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="produtos"
                      >
                        {categoryPerformance.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"][
                                index % 5
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Margem</CardTitle>
                <CardDescription>
                  Margem de lucro vs volume de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vendas: { label: "Vendas" },
                    margem: { label: "Margem" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid className="stroke-muted" />
                      <XAxis dataKey="vendas" name="Vendas" unit="k" />
                      <YAxis dataKey="margem" name="Margem" unit="%" />
                      <ZAxis dataKey="produtos" name="Produtos" range={[100, 500]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter
                        name="Categorias"
                        data={categoryPerformance}
                        fill="#8b5cf6"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Report */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Demografia de Clientes</CardTitle>
                <CardDescription>
                  Distribuição de clientes por faixa etária
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    clientes: { label: "Clientes", color: "#3b82f6" },
                    valor: { label: "Valor", color: "#10b981" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerMetrics}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="clientes" fill="#3b82f6" />
                      <Bar yAxisId="right" dataKey="valor" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>
                  Taxa de conversão em cada etapa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {stage.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={(stage.value / conversionFunnel[0].value) * 100}
                          className="h-8"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {index > 0 &&
                            `${(
                              (stage.value / conversionFunnel[index - 1].value) *
                              100
                            ).toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Report */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>KPIs Principais</CardTitle>
                <CardDescription>
                  Indicadores chave de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    performance: { label: "Performance", color: "#8b5cf6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="80%"
                      data={[
                        { name: "Vendas", value: 88, fill: "#8b5cf6" },
                        { name: "Conversão", value: 72, fill: "#3b82f6" },
                        { name: "Retenção", value: 65, fill: "#10b981" },
                        { name: "NPS", value: 81, fill: "#f59e0b" },
                      ]}
                    >
                      <RadialBar dataKey="value" />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metas vs Realizado</CardTitle>
                <CardDescription>
                  Acompanhamento de metas mensais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Receita", atual: 185500, meta: 200000 },
                    { metric: "Novos Clientes", atual: 342, meta: 400 },
                    { metric: "Ticket Médio", atual: 125, meta: 150 },
                    { metric: "Produtos Vendidos", atual: 1482, meta: 1500 },
                  ].map((item) => (
                    <div key={item.metric} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.metric}</span>
                        <span>
                          {item.atual.toLocaleString()} / {item.meta.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(item.atual / item.meta) * 100} />
                      <p className="text-xs text-muted-foreground text-right">
                        {((item.atual / item.meta) * 100).toFixed(1)}% da meta
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componentes auxiliares
function DatePickerWithRange({ date, setDate }: any) {
  return (
    <Button variant="outline" className="justify-start text-left font-normal">
      <Calendar className="mr-2 h-4 w-4" />
      {date?.from ? (
        date.to ? (
          <>
            {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
          </>
        ) : (
          format(date.from, "dd/MM/yyyy")
        )
      ) : (
        <span>Selecione um período</span>
      )}
    </Button>
  )
}

function format(date: Date, formatStr: string) {
  // Implementação simples de formatação
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"