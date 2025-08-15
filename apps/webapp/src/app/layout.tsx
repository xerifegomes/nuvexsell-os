import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NuvexSell OS - SaaS de Dropshipping com IA",
  description: "Plataforma completa para automatizar seu dropshipping com inteligência artificial",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
      </body>
    </html>
  )
}