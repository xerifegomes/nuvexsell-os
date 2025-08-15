"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  LineChart,
  Cpu,
  Settings,
  Search,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  Zap,
  DollarSign,
  BarChart3,
  Box,
  Sparkles,
  Bot,
  FileText,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-500",
  },
  {
    title: "Produtos",
    href: "/products",
    icon: Package,
    color: "text-green-500",
  },
  {
    title: "Análise IA",
    href: "/analytics",
    icon: LineChart,
    color: "text-purple-500",
    badge: "AI",
  },
  {
    title: "Automação",
    href: "/automation",
    icon: Cpu,
    color: "text-orange-500",
  },
  {
    title: "Pedidos",
    href: "/orders",
    icon: ShoppingCart,
    color: "text-pink-500",
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    color: "text-cyan-500",
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    color: "text-gray-500",
  },
]

const quickActions = [
  { name: "Importar Produtos", icon: Package, action: "import" },
  { name: "Nova Análise IA", icon: Sparkles, action: "analyze" },
  { name: "Criar Automação", icon: Bot, action: "automate" },
  { name: "Gerar Relatório", icon: FileText, action: "report" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative border-r bg-card"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col"
                  >
                    <span className="text-lg font-bold">NuvexSell</span>
                    <span className="text-xs text-muted-foreground">
                      Dropshipping OS
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                    isActive && "bg-accent"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <link.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? link.color : "text-muted-foreground",
                      "group-hover:" + link.color
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative z-10"
                      >
                        {link.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {link.badge && !collapsed && (
                    <Badge variant="secondary" className="ml-auto">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col text-left"
                      >
                        <span className="text-sm font-medium">John Doe</span>
                        <span className="text-xs text-muted-foreground">
                          Plano VIP
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Assinatura
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ajuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <div className="flex flex-1 items-center gap-4">
            <Button
              variant="outline"
              className="relative w-64"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <span className="pl-8 text-sm text-muted-foreground">
                Buscar...
              </span>
              <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                3
              </span>
            </Button>
            <Button variant="default" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Digite um comando ou busque..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Ações Rápidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.action}
                onSelect={() => {
                  console.log("Action:", action.action)
                  setCommandOpen(false)
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Navegação">
            {sidebarLinks.map((link) => (
              <CommandItem
                key={link.href}
                onSelect={() => {
                  window.location.href = link.href
                  setCommandOpen(false)
                }}
              >
                <link.icon className="mr-2 h-4 w-4" />
                <span>{link.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}