import { ProductScrapingService, AIAnalysisService, OrderAutomationService, StockSyncService } from '../services/integration'
import type { QueueMessage, Product, ProductRaw } from '@nuvexsell/core'
import type { Env } from '../types/env'

export class QueueProcessor {
  private scraper: ProductScrapingService
  private aiScoring: AIAnalysisService
  private orderAutomation: OrderAutomationService
  private stockManager: StockSyncService

  constructor(private env: Env) {
    this.scraper = new ProductScrapingService()
    this.aiScoring = new AIAnalysisService()
    this.orderAutomation = new OrderAutomationService()
    this.stockManager = new StockSyncService()
  }

  async processScrapeQueue(message: QueueMessage): Promise<void> {
    console.log('Processing scrape queue message:', message.id)
    
    try {
      const { taskId, url, tenantId, userId } = message.data

      // 1. Executar scraping real usando o repo 1
      const productRaw = await this.scraper.scrapeProduct(url)
      
      // 2. Salvar produto bruto no D1
      const productId = await this.saveProductToDatabase(productRaw, tenantId)
      
      // 3. Enviar para fila de IA scoring
      const aiMessage: QueueMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        type: 'AI_SCORE_PRODUCT',
        data: {
          productId,
          tenantId,
          userId,
          taskId
        },
        attempts: 0,
        maxAttempts: 3,
        scheduledAt: new Date(),
        processedAt: new Date()
      }

      await this.env.AI_SCORE_QUEUE.send(aiMessage)
      console.log(`Scraping completed for ${url}, sent to AI queue`)

    } catch (error) {
      console.error('Scrape queue processing failed:', error)
      throw error
    }
  }

  async processAIQueue(message: QueueMessage): Promise<void> {
    console.log('Processing AI queue message:', message.id)
    
    try {
      const { productId, tenantId, userId, taskId } = message.data

      // 1. Buscar produto do banco
      const product = await this.getProductFromDatabase(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      // 2. Executar análise IA usando o repo 2
      const analysis = await this.aiScoring.analyzeProduct(product)
      
      // 3. Atualizar produto com scores IA
      await this.updateProductWithAIScores(productId, analysis)
      
      // 4. Se score alto, enviar para processamento de pedidos
      if (analysis.recommendation === 'high' || 
          (analysis.priceScore > 70 && analysis.demandScore > 70)) {
        
        const orderMessage: QueueMessage = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          type: 'PROCESS_PRODUCT_ORDER',
          data: {
            productId,
            tenantId,
            userId,
            taskId,
            aiAnalysis: analysis
          },
          attempts: 0,
          maxAttempts: 3,
          scheduledAt: new Date(),
          processedAt: new Date()
        }

        await this.env.ORDER_QUEUE.send(orderMessage)
        console.log(`AI analysis completed for ${productId}, sent to order queue`)
      } else {
        console.log(`Product ${productId} has low score, skipping order processing`)
      }

    } catch (error) {
      console.error('AI queue processing failed:', error)
      throw error
    }
  }

  async processOrderQueue(message: QueueMessage): Promise<void> {
    console.log('Processing order queue message:', message.id)
    
    try {
      const { productId, tenantId, userId, aiAnalysis } = message.data

      // 1. Buscar produto do banco
      const product = await this.getProductFromDatabase(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      // 2. Criar pedido simulado baseado na análise IA
      const simulatedOrder = {
        id: `order_${Date.now()}`,
        tenantId,
        status: 'CREATED' as const,
        items: [{
          productId,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: product.price
        }],
        destination: {
          street: 'Endereço simulado',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'BR'
        },
        totalAmount: product.price,
        currency: product.currency,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 3. Processar pedido usando o repo 3
      const processedOrder = await this.orderAutomation.processOrder(simulatedOrder)
      
      // 4. Sincronizar estoque
      await this.stockManager.syncStock('default-supplier')
      
      // 5. Salvar resultado no banco
      await this.saveOrderToDatabase(processedOrder)
      
      console.log(`Order processing completed for product ${productId}`)

    } catch (error) {
      console.error('Order queue processing failed:', error)
      throw error
    }
  }

  // Métodos auxiliares para banco de dados
  private async saveProductToDatabase(productRaw: ProductRaw, tenantId: string): Promise<string> {
    try {
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
      
      const stmt = this.env.D1_DB.prepare(`
        INSERT INTO products (
          id, tenant_id, title, description, price, currency, 
          images, availability, sku, brand, category, source_url,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      
      await stmt.bind(
        productId,
        tenantId,
        productRaw.title,
        productRaw.description,
        productRaw.price,
        productRaw.currency,
        JSON.stringify(productRaw.images),
        productRaw.availability ? 1 : 0,
        productRaw.sku,
        productRaw.brand,
        productRaw.category,
        productRaw.url
      ).run()

      return productId
    } catch (error) {
      console.error('Failed to save product to database:', error)
      // Fallback: salvar em KV se D1 falhar
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
      await this.env.LOGS_KV.put(`product:${productId}`, JSON.stringify({
        ...productRaw,
        id: productId,
        tenantId,
        createdAt: new Date().toISOString()
      }))
      return productId
    }
  }

  private async getProductFromDatabase(productId: string): Promise<Product | null> {
    try {
      const stmt = this.env.D1_DB.prepare(`
        SELECT * FROM products WHERE id = ?
      `)
      
      const result = await stmt.bind(productId).first()
      
      if (!result) {
        // Fallback: buscar no KV
        const kvData = await this.env.LOGS_KV.get(`product:${productId}`)
        if (kvData) {
          const parsed = JSON.parse(kvData)
          return {
            ...parsed,
            images: Array.isArray(parsed.images) ? parsed.images : JSON.parse(parsed.images || '[]'),
            availability: Boolean(parsed.availability),
            createdAt: new Date(parsed.created_at || parsed.createdAt),
            updatedAt: new Date(parsed.updated_at || parsed.updatedAt)
          }
        }
        return null
      }

      return {
        id: result.id as string,
        tenantId: result.tenant_id as string,
        title: result.title as string,
        description: result.description as string,
        price: result.price as number,
        currency: result.currency as string,
        images: JSON.parse(result.images as string || '[]'),
        availability: Boolean(result.availability),
        sku: result.sku as string,
        brand: result.brand as string,
        category: result.category as string,
        sourceUrl: result.source_url as string,
        aiScore: result.ai_score as number,
        priceScore: result.price_score as number,
        demandScore: result.demand_score as number,
        sentimentScore: result.sentiment_score as number,
        createdAt: new Date(result.created_at as string),
        updatedAt: new Date(result.updated_at as string)
      }
    } catch (error) {
      console.error('Failed to get product from database:', error)
      return null
    }
  }

  private async updateProductWithAIScores(productId: string, analysis: any): Promise<void> {
    try {
      const stmt = this.env.D1_DB.prepare(`
        UPDATE products SET 
          ai_score = ?, price_score = ?, demand_score = ?, sentiment_score = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `)
      
      await stmt.bind(
        Math.round((analysis.priceScore + analysis.demandScore + analysis.sentimentScore) / 3),
        analysis.priceScore,
        analysis.demandScore,
        analysis.sentimentScore,
        productId
      ).run()
    } catch (error) {
      console.error('Failed to update product with AI scores:', error)
      // Fallback: salvar no KV
      await this.env.LOGS_KV.put(`ai_analysis:${productId}`, JSON.stringify(analysis))
    }
  }

  private async saveOrderToDatabase(order: any): Promise<void> {
    try {
      const stmt = this.env.D1_DB.prepare(`
        INSERT INTO orders (
          id, tenant_id, status, items, destination, tracking_code,
          total_amount, currency, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      
      await stmt.bind(
        order.id,
        order.tenantId,
        order.status,
        JSON.stringify(order.items),
        JSON.stringify(order.destination),
        order.trackingCode,
        order.totalAmount,
        order.currency
      ).run()
    } catch (error) {
      console.error('Failed to save order to database:', error)
      // Fallback: salvar no KV
      await this.env.LOGS_KV.put(`order:${order.id}`, JSON.stringify(order))
    }
  }

  // Método principal para processar mensagens da fila
  async processQueueMessage(queueName: string, message: QueueMessage): Promise<void> {
    try {
      switch (queueName) {
        case 'SCRAPE_QUEUE':
          await this.processScrapeQueue(message)
          break
        case 'AI_SCORE_QUEUE':
          await this.processAIQueue(message)
          break
        case 'ORDER_QUEUE':
          await this.processOrderQueue(message)
          break
        default:
          console.warn(`Unknown queue: ${queueName}`)
      }
    } catch (error) {
      console.error(`Queue processing failed for ${queueName}:`, error)
      throw error
    }
  }
}