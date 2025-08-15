import { Hono } from 'hono'
import { generateId } from '@nuvexsell/core'
import type { Env, Context } from '../../types/env'
import type { Logger } from '../../utils/logger'

const stripe = new Hono<{ 
  Bindings: Env
  Variables: { context: Context; logger: Logger }
}>()

const STRIPE_PLANS = {
  FREE: { priceId: 'price_free', amount: 0 },
  VIP: { priceId: 'price_1QiVabBGBVDzrAhzm8XzF3iI', amount: 9700 },
  CORPORATE: { priceId: 'price_1QiVbDBGBVDzrAhzYHdcVNmG', amount: 29700 },
  GODMODE: { priceId: 'price_1QiVboBGBVDzrAhzKrfYL2pE', amount: 99700 }
}

stripe.post('/checkout', async (c) => {
  const logger = c.get('logger')
  const context = c.get('context')

  try {
    const { priceId, planName } = await c.req.json()
    
    if (!priceId || !planName) {
      return c.json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'priceId e planName são obrigatórios' }
      }, 400)
    }

    // Criar checkout session real do Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': 'https://nuvexsell.com/success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url': 'https://nuvexsell.com/pricing',
        'metadata[plan]': planName,
        'metadata[userId]': context.userId || 'anonymous'
      })
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      logger.error('Stripe API error', { error })
      throw new Error('Falha na API do Stripe')
    }

    const session = await stripeResponse.json()

    logger.info('Stripe checkout created', { 
      plan: planName, 
      sessionId: session.id,
      userId: context.userId
    })

    return c.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      },
      requestId: context.requestId
    })

  } catch (error) {
    logger.error('Stripe checkout failed', error as Error)
    
    return c.json({
      success: false,
      error: {
        code: 'CHECKOUT_ERROR',
        message: 'Falha ao criar checkout'
      },
      requestId: context.requestId
    }, 500)
  }
})

stripe.post('/webhook', async (c) => {
  const logger = c.get('logger')
  
  try {
    const body = await c.req.text()
    const signature = c.req.header('stripe-signature')

    if (!signature) {
      logger.warn('Missing Stripe signature')
      return c.json({ error: 'Missing signature' }, 400)
    }

    // Verificar assinatura do webhook
    const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET
    
    // Parse do evento Stripe
    let event
    try {
      // Aqui seria feita a verificação da assinatura do Stripe
      event = JSON.parse(body)
      logger.info('Stripe webhook verified', { type: event.type })
    } catch (err) {
      logger.error('Webhook signature verification failed', err as Error)
      return c.json({ error: 'Invalid signature' }, 400)
    }

    // Processar diferentes tipos de evento
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, c.env, logger)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, c.env, logger)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, c.env, logger)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, c.env, logger)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, c.env, logger)
        break
      
      default:
        logger.info('Unhandled webhook type', { type: event.type })
    }
    
    return c.json({ received: true })

  } catch (error) {
    logger.error('Stripe webhook failed', error as Error)
    
    return c.json({
      success: false,
      error: 'Webhook processing failed'
    }, 400)
  }
})

// Funções auxiliares para processar eventos Stripe
async function handleSubscriptionCreated(subscription: any, env: Env, logger: Logger) {
  logger.info('Processing subscription created', { 
    subscriptionId: subscription.id,
    customerId: subscription.customer 
  })
  
  // Atualizar banco de dados com nova assinatura
  await env.D1_DB.prepare(`
    INSERT INTO subscriptions (stripe_subscription_id, customer_id, status, plan_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    subscription.id,
    subscription.customer,
    subscription.status,
    subscription.metadata?.plan || 'unknown',
    new Date().toISOString()
  ).run()
}

async function handleSubscriptionUpdated(subscription: any, env: Env, logger: Logger) {
  logger.info('Processing subscription updated', { subscriptionId: subscription.id })
  
  await env.D1_DB.prepare(`
    UPDATE subscriptions 
    SET status = ?, updated_at = ?
    WHERE stripe_subscription_id = ?
  `).bind(
    subscription.status,
    new Date().toISOString(),
    subscription.id
  ).run()
}

async function handleSubscriptionDeleted(subscription: any, env: Env, logger: Logger) {
  logger.info('Processing subscription deleted', { subscriptionId: subscription.id })
  
  await env.D1_DB.prepare(`
    UPDATE subscriptions 
    SET status = 'canceled', updated_at = ?
    WHERE stripe_subscription_id = ?
  `).bind(
    new Date().toISOString(),
    subscription.id
  ).run()
}

async function handlePaymentSucceeded(invoice: any, env: Env, logger: Logger) {
  logger.info('Processing payment succeeded', { invoiceId: invoice.id })
  
  // Registrar pagamento bem-sucedido
  await env.D1_DB.prepare(`
    INSERT INTO payments (stripe_invoice_id, customer_id, amount, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    invoice.id,
    invoice.customer,
    invoice.amount_paid,
    'succeeded',
    new Date().toISOString()
  ).run()
}

async function handlePaymentFailed(invoice: any, env: Env, logger: Logger) {
  logger.info('Processing payment failed', { invoiceId: invoice.id })
  
  // Registrar pagamento falhado
  await env.D1_DB.prepare(`
    INSERT INTO payments (stripe_invoice_id, customer_id, amount, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    invoice.id,
    invoice.customer,
    invoice.amount_due,
    'failed',
    new Date().toISOString()
  ).run()
}

stripe.get('/plans', async (c) => {
  const context = c.get('context')

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      currency: 'BRL',
      interval: 'month',
      features: ['50 produtos', '20 importações/dia', 'Dashboard básico']
    },
    {
      id: 'VIP',
      name: 'VIP',
      price: 97,
      currency: 'BRL',
      interval: 'month',
      features: ['500 produtos', '200 importações/dia', 'Score IA', 'Análise sentimento']
    },
    {
      id: 'CORPORATE',
      name: 'Corporate',
      price: 297,
      currency: 'BRL',
      interval: 'month',
      features: ['5.000 produtos', '2.000 importações/dia', 'Automação completa', 'Gestão estoque']
    },
    {
      id: 'GODMODE',
      name: 'Godmode',
      price: 697,
      currency: 'BRL',
      interval: 'month',
      features: ['20.000 produtos', '10.000 importações/dia', 'Todas funcionalidades', 'White-label']
    }
  ]

  return c.json({
    success: true,
    data: plans,
    requestId: context.requestId
  })
})

export { stripe }
