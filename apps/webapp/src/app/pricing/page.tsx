'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Plan {
  name: string
  price: number
  priceId: string
  features: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'FREE',
    price: 0,
    priceId: 'price_free',
    features: [
      '10 produtos/mês',
      'Análise básica de IA',
      'Suporte via email',
      'Dashboard básico'
    ]
  },
  {
    name: 'VIP',
    price: 97,
    priceId: 'price_1QiVabBGBVDzrAhzm8XzF3iI',
    features: [
      '1000 produtos/mês',
      'Análise avançada de IA',
      'Automação de pedidos',
      'Relatórios detalhados',
      'Suporte prioritário'
    ],
    popular: true
  },
  {
    name: 'CORPORATE',
    price: 297,
    priceId: 'price_1QiVbDBGBVDzrAhzYHdcVNmG',
    features: [
      'Produtos ilimitados',
      'IA customizada',
      'API completa',
      'Webhook personalizado',
      'Suporte 24/7',
      'Account manager'
    ]
  },
  {
    name: 'GODMODE',
    price: 997,
    priceId: 'price_1QiVboBGBVDzrAhzKrfYL2pE',
    features: [
      'Tudo do Corporate',
      'White label',
      'Infraestrutura dedicada',
      'SLA 99.9%',
      'Consultoria estratégica',
      'Customizações ilimitadas'
    ]
  }
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: Plan) => {
    setLoading(plan.priceId)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: plan.priceId,
          planName: plan.name 
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erro no checkout:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha Seu Plano
          </h1>
          <p className="text-xl text-gray-300">
            Acelere seu dropshipping com IA avançada
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative p-6 bg-white/10 backdrop-blur-sm border border-white/20 ${
                plan.popular ? 'ring-2 ring-cyan-400 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-white mb-2">
                  ${plan.price}
                  <span className="text-lg text-gray-300">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-200">
                    <span className="text-green-400 mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleCheckout(plan)}
                disabled={loading === plan.priceId}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                {loading === plan.priceId ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processando...
                  </div>
                ) : plan.price === 0 ? (
                  'Começar Grátis'
                ) : (
                  'Assinar Agora'
                )}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">
            💳 Pagamento seguro via Stripe • Cancele quando quiser
          </p>
          <p className="text-gray-400 text-sm">
            Todos os planos incluem 14 dias de teste grátis
          </p>
        </div>
      </div>
    </div>
  )
}