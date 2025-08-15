"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Copy,
  FileText,
  Mail,
  DollarSign,
  Calendar,
  User,
  Globe,
  ArrowUpDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipos
interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: {
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "paid" | "pending" | "failed"
  shippingMethod: string
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
  source: string
}

// Dados mockados
const orders: Order[] = [
  {
    id: "1",
    orderNumber: "#ORD-2024-001",
    customer: {
      name: "João Silva",
      email: "joao@email.com",
      phone: "(11) 98765-4321",
    },
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro Max",
        quantity: 1,
        price: 8999.90,
        image: "https://via.placeholder.com/100",
      },
    ],
    total: 8999.90,
    status: "processing",
    paymentStatus: "paid",
    shippingMethod: "Sedex",
    trackingNumber: "BR123456789BR",
    createdAt: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-15T14:20:00"),
    source: "Website",
  },
  {
    id: "2",
    orderNumber: "#ORD-2024-002",
    customer: {
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "(21) 99876-5432",
    },
    items: [
      {
        id: "2",
        name: "Nike Air Max 2024",
        quantity: 2,
        price: 599.90,
        image: "https://via.placeholder.com/100",
      },
      {
        id: "3",
        name: "Echo Dot 5ª Geração",
        quantity: 1,
        price: 299.90,
        image: "https://via.placeholder.com/100",
      },
    ],
    total: 1499.70,
    status: "shipped",
    paymentStatus: "paid",
    shippingMethod: "PAC",
    trackingNumber: "BR987654321BR",
    createdAt: new Date("2024-01-14T15:45:00"),
    updatedAt: new Date("2024-01-16T09:10:00"),
    source: "App Mobile",
  },
]

// Estatísticas
const orderStats = [
  {
    title: "Pedidos Hoje",
    value: "24",
    change: "+12%",
    icon: ShoppingCart,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Faturamento",
    value: "R$ 48.5k",
    change: "+18%",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Em Processamento",
    value: "8",
    change: "-5%",
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Taxa de Entrega",
    value: "96.5%",
    change: "+2%",
    icon: CheckCircle2,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Clock,
  },
  processing: {
    label: "Processando",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: Package,
  },
  shipped: {
    label: "Enviado",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    icon: Truck,
  },
  delivered: {
    label: "Entregue",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertCircle,
  },
}

export default function OrdersPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)

  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "orderNumber",
      header: "Pedido",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("orderNumber")}</div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row }) => {
        const customer = row.getValue("customer") as Order["customer"]
        return (
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          R$ {row.getValue<number>("total").toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusConfig
        const config = statusConfig[status]
        const Icon = config.icon

        return (
          <div className={cn("flex items-center gap-2", config.color)}>
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Pagamento",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string
        return (
          <Badge
            variant={status === "paid" ? "default" : "secondary"}
            className={
              status === "paid"
                ? "bg-green-500/10 text-green-500"
                : "bg-yellow-500/10 text-yellow-500"
            }
          >
            {status === "paid" ? "Pago" : "Pendente"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) => {
        return format(row.getValue("createdAt"), "dd/MM/yyyy", { locale: ptBR })
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copiar número
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Gerar nota fiscal
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Enviar email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos da sua loja
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {orderStats.map((stat) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={cn("rounded-lg p-2", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} vs ontem
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pedidos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={(table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("orderNumber")?.setFilterValue(event.target.value)
                }
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="7d">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes do Pedido</SheetTitle>
                <SheetDescription>
                  {selectedOrder.orderNumber}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      statusConfig[selectedOrder.status].icon,
                      {
                        className: cn(
                          "h-5 w-5",
                          statusConfig[selectedOrder.status].color
                        ),
                      }
                    )}
                    <span className="font-medium">
                      {statusConfig[selectedOrder.status].label}
                    </span>
                  </div>
                  <Button size="sm">Atualizar Status</Button>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <Progress
                    value={
                      selectedOrder.status === "delivered"
                        ? 100
                        : selectedOrder.status === "shipped"
                        ? 75
                        : selectedOrder.status === "processing"
                        ? 50
                        : 25
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pedido Recebido</span>
                    <span>Processando</span>
                    <span>Enviado</span>
                    <span>Entregue</span>
                  </div>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3">Informações do Cliente</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping */}
                {selectedOrder.trackingNumber && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Informações de Envio</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Método:</span>
                          <span>{selectedOrder.shippingMethod}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Rastreamento:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {selectedOrder.trackingNumber}
                            </span>
                            <Button size="sm" variant="ghost">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <Badge
                    variant={
                      selectedOrder.paymentStatus === "paid"
                        ? "default"
                        : "secondary"
                    }
                    className="w-full justify-center"
                  >
                    {selectedOrder.paymentStatus === "paid"
                      ? "Pagamento Confirmado"
                      : "Pagamento Pendente"}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}