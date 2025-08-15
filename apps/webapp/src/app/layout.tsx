import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NuvexSell OS - SaaS Unificado de Dropshipping com IA',
  description: 'Plataforma completa para automação de dropshipping com inteligência artificial',
  keywords: ['dropshipping', 'ecommerce', 'automation', 'AI', 'SaaS'],
  authors: [{ name: 'NuvexSell Team' }],
  openGraph: {
    title: 'NuvexSell OS',
    description: 'SaaS Unificado de Dropshipping com IA',
    type: 'website',
    siteName: 'NuvexSell OS'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}