"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Package,
  Upload,
  Link,
  Search,
  Filter,
  MoreVertical,
  Star,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipos
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  image: string
  category: string
  source: string
  aiScore: number
  status: "active" | "pending" | "paused"
  stock: number
  sales: number
  imported: string
}

// Dados mockados
const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    description: "Smartphone Apple com chip A17 Pro, câmera de 48MP",
    price: 8999.90,
    originalPrice: 9999.90,
    image: "https://via.placeholder.com/200",
    category: "Eletrônicos",
    source: "Amazon",
    aiScore: 92,
    status: "active",
    stock: 15,
    sales: 48,
    imported: "2024-01-15",
  },
  {
    id: "2",
    name: "Nike Air Max 2024",
    description: "Tênis esportivo com tecnologia Air Max",
    price: 599.90,
    originalPrice: 799.90,
    image: "https://via.placeholder.com/200",
    category: "Esportes",
    source: "AliExpress",
    aiScore: 88,
    status: "active",
    stock: 32,
    sales: 124,
    imported: "2024-01-14",
  },
  {
    id: "3",
    name: "Echo Dot 5ª Geração",
    description: "Smart speaker com Alexa",
    price: 299.90,
    originalPrice: 399.90,
    image: "https://via.placeholder.com/200",
    category: "Casa Inteligente",
    source: "Amazon",
    aiScore: 85,
    status: "pending",
    stock: 0,
    sales: 0,
    imported: "2024-01-16",
  },
]

// Componente de produto arrastável
function SortableProduct({ product }: { product: Product }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={isDragging ? "z-50" : ""}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <div className="w-48 h-48 bg-muted relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge
                variant={product.status === "active" ? "default" : "secondary"}
              >
                {product.status === "active" ? "Ativo" : "Pendente"}
              </Badge>
              <Badge variant="outline" className="bg-background/80 backdrop-blur">
                <Globe className="h-3 w-3 mr-1" />
                {product.source}
              </Badge>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
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
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Original
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Preço</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score IA</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold">{product.aiScore}</span>
                  <Progress value={product.aiScore} className="w-20 h-2" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{product.stock} em estoque</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{product.sales} vendas</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Importado em {new Date(product.imported).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = React.useState(mockProducts)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [importMethod, setImportMethod] = React.useState<"url" | "file">("url")
  const [importUrls, setImportUrls] = React.useState("")
  const [importProgress, setImportProgress] = React.useState(0)
  const [isImporting, setIsImporting] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles)
    // Processar arquivos CSV/Excel aqui
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  })

  const handleImport = async () => {
    setIsImporting(true)
    setImportProgress(0)

    // Simular progresso de importação
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          setImportDialogOpen(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos importados e otimize com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Importar Produtos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Importar Produtos</DialogTitle>
                <DialogDescription>
                  Importe produtos de marketplaces ou envie arquivos CSV/Excel
                </DialogDescription>
              </DialogHeader>

              <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URLs de Produtos</TabsTrigger>
                  <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label>URLs dos Produtos</Label>
                    <Textarea
                      placeholder="Cole as URLs dos produtos, uma por linha..."
                      value={importUrls}
                      onChange={(e) => setImportUrls(e.target.value)}
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Suportamos: Amazon, AliExpress, eBay, Mercado Livre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Configurações de Importação</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Análise IA Automática</p>
                          <p className="text-sm text-muted-foreground">
                            Analisa preço e demanda automaticamente
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Monitorar Preço</p>
                          <p className="text-sm text-muted-foreground">
                            Acompanha mudanças de preço diariamente
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    {isDragActive ? (
                      <p>Solte os arquivos aqui...</p>
                    ) : (
                      <div>
                        <p className="font-medium">
                          Arraste arquivos ou clique para selecionar
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Suporta CSV, XLS, XLSX (máx. 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Formato do arquivo:</h4>
                    <p className="text-sm text-muted-foreground">
                      O arquivo deve conter as colunas: Nome, Descrição, Preço,
                      URL Original, Categoria
                    </p>
                    <Button variant="link" size="sm" className="mt-2 px-0">
                      Baixar template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importando produtos...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(false)}
                  disabled={isImporting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? "Importando..." : "Importar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="electronics">Eletrônicos</SelectItem>
                  <SelectItem value="fashion">Moda</SelectItem>
                  <SelectItem value="home">Casa</SelectItem>
                  <SelectItem value="sports">Esportes</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="paused">Pausados</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="score">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score IA</SelectItem>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={products.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            <AnimatePresence>
              {products.map((product) => (
                <SortableProduct key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}

function Switch(props: any) {
  return (
    <button
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[state=checked]:bg-primary"
      {...props}
    >
      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6" />
    </button>
  )
}