import { ProductScrapingService, AIAnalysisService, OrderAutomationService, StockSyncService } from '../services/integration'
import type { QueueMessage, Product, Tenant, AutomationRule } from '@nuvexsell/core'
import type { Env } from '../types/env'

export interface AutopilotConfig {
  enabled: boolean
  maxDailyOrders: number
  maxOrderValue: number
  minAIScore: number
  autoOrderThreshold: number
  monitorUrls: string[]
  budgetLimit: number
  supplierPriority: string[]
}

export class AutopilotEngine {
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

  /**
   * Executa o modo autopilot para um tenant
   */
  async runAutopilot(tenantId: string): Promise<void> {
    console.log(`🚁 Starting autopilot for tenant: ${tenantId}`)

    try {
      // 1. Verificar se autopilot está habilitado
      const config = await this.getAutopilotConfig(tenantId)
      if (!config.enabled) {
        console.log(`Autopilot disabled for tenant ${tenantId}`)
        return
      }

      // 2. Verificar limites diários
      const dailyStats = await this.getDailyStats(tenantId)
      if (dailyStats.ordersCount >= config.maxDailyOrders) {
        console.log(`Daily order limit reached for tenant ${tenantId}`)
        return
      }

      if (dailyStats.totalSpent >= config.budgetLimit) {
        console.log(`Daily budget limit reached for tenant ${tenantId}`)
        return
      }

      // 3. Executar fluxo completo do autopilot
      await this.executeAutopilotFlow(tenantId, config)

    } catch (error) {
      console.error(`Autopilot failed for tenant ${tenantId}:`, error)
      await this.logAutopilotError(tenantId, error as Error)
    }
  }

  /**
   * Executa o fluxo completo do autopilot
   */
  private async executeAutopilotFlow(tenantId: string, config: AutopilotConfig): Promise<void> {
    console.log(`🔄 Executing autopilot flow for tenant: ${tenantId}`)

    // STEP 1: Monitorate URLs automático
    await this.autoMonitorUrls(tenantId, config)

    // STEP 2: Analisar produtos com IA
    await this.autoAnalyzeProducts(tenantId, config)

    // STEP 3: Executar regras de automação
    await this.executeAutomationRules(tenantId, config)

    // STEP 4: Sincronizar estoque
    await this.autoSyncStock(tenantId)

    // STEP 5: Processar pedidos pendentes
    await this.processAutoPendingOrders(tenantId, config)

    console.log(`✅ Autopilot flow completed for tenant: ${tenantId}`)
  }

  /**
   * STEP 1: Monitorate URLs configuradas automaticamente
   */
  private async autoMonitorUrls(tenantId: string, config: AutopilotConfig): Promise<void> {
    console.log(`🕷️ Auto monitoring URLs for tenant: ${tenantId}`)

    for (const url of config.monitorUrls) {
      try {
        // Verificar se produto já existe
        const existingProduct = await this.getProductByUrl(tenantId, url)
        
        if (existingProduct) {
          // Re-scrape produto existente para atualizar preços
          const updatedData = await this.scraper.scrapeProduct(url)
          await this.updateProductData(existingProduct.id, updatedData)
          console.log(`Updated existing product: ${existingProduct.id}`)
        } else {
          // Scrape novo produto
          const queueMessage: QueueMessage = {
            id: `autopilot_scrape_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            type: 'AUTOPILOT_SCRAPE',
            data: {
              url,
              tenantId,
              autopilot: true,
              taskId: `autopilot_${tenantId}_${Date.now()}`
            },
            attempts: 0,
            maxAttempts: 3,
            scheduledAt: new Date(),
            processedAt: new Date()
          }

          await this.env.SCRAPE_QUEUE.send(queueMessage)
          console.log(`Queued autopilot scrape for: ${url}`)
        }
      } catch (error) {
        console.error(`Failed to monitor URL ${url}:`, error)
      }
    }
  }

  /**
   * STEP 2: Analisar produtos automaticamente com IA
   */
  private async autoAnalyzeProducts(tenantId: string, config: AutopilotConfig): Promise<void> {
    console.log(`🧠 Auto analyzing products for tenant: ${tenantId}`)

    // Buscar produtos que precisam de análise IA
    const productsToAnalyze = await this.getProductsNeedingAnalysis(tenantId)

    for (const product of productsToAnalyze) {
      try {
        const aiMessage: QueueMessage = {
          id: `autopilot_ai_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          type: 'AUTOPILOT_AI_ANALYSIS',
          data: {
            productId: product.id,
            tenantId,
            autopilot: true
          },
          attempts: 0,
          maxAttempts: 3,
          scheduledAt: new Date(),
          processedAt: new Date()
        }

        await this.env.AI_SCORE_QUEUE.send(aiMessage)
        console.log(`Queued autopilot AI analysis for product: ${product.id}`)
      } catch (error) {
        console.error(`Failed to queue AI analysis for product ${product.id}:`, error)
      }
    }
  }

  /**
   * STEP 3: Executar regras de automação configuradas
   */
  private async executeAutomationRules(tenantId: string, config: AutopilotConfig): Promise<void> {
    console.log(`⚙️ Executing automation rules for tenant: ${tenantId}`)

    const rules = await this.getEnabledAutomationRules(tenantId)

    for (const rule of rules) {
      try {
        await this.executeRule(rule, config)
      } catch (error) {
        console.error(`Failed to execute rule ${rule.id}:`, error)
      }
    }
  }

  /**
   * STEP 4: Sincronizar estoque automaticamente
   */
  private async autoSyncStock(tenantId: string): Promise<void> {
    console.log(`📦 Auto syncing stock for tenant: ${tenantId}`)

    const suppliers = await this.getActiveSuppliers(tenantId)

    for (const supplier of suppliers) {
      try {
        await this.stockManager.syncStock(supplier.id)
        await this.updateSupplierSyncStatus(supplier.id, 'synced')
        console.log(`Stock synced for supplier: ${supplier.id}`)
      } catch (error) {
        console.error(`Failed to sync stock for supplier ${supplier.id}:`, error)
        await this.updateSupplierSyncStatus(supplier.id, 'error')
      }
    }
  }

  /**
   * STEP 5: Processar pedidos pendentes automaticamente
   */
  private async processAutoPendingOrders(tenantId: string, config: AutopilotConfig): Promise<void> {
    console.log(`📋 Processing auto pending orders for tenant: ${tenantId}`)

    const pendingProducts = await this.getProductsNeedingOrders(tenantId, config)

    for (const product of pendingProducts) {
      try {
        const orderQuantity = this.calculateOptimalOrderQuantity(product, config)
        
        if (orderQuantity > 0) {
          const orderMessage: QueueMessage = {
            id: `autopilot_order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            type: 'AUTOPILOT_CREATE_ORDER',
            data: {
              productId: product.id,
              tenantId,
              quantity: orderQuantity,
              autopilot: true,
              maxValue: config.maxOrderValue
            },
            attempts: 0,
            maxAttempts: 3,
            scheduledAt: new Date(),
            processedAt: new Date()
          }

          await this.env.ORDER_QUEUE.send(orderMessage)
          console.log(`Queued autopilot order for product: ${product.id}, quantity: ${orderQuantity}`)
        }
      } catch (error) {
        console.error(`Failed to process auto order for product ${product.id}:`, error)
      }
    }
  }

  // ===========================================
  // Métodos auxiliares
  // ===========================================

  private async getAutopilotConfig(tenantId: string): Promise<AutopilotConfig> {
    try {
      const tenant = await this.getTenant(tenantId)
      const settings = JSON.parse(tenant.settings || '{}')
      
      return {
        enabled: settings.autopilot?.enabled || false,
        maxDailyOrders: settings.autopilot?.maxDailyOrders || 10,
        maxOrderValue: settings.autopilot?.maxOrderValue || 1000,
        minAIScore: settings.autopilot?.minAIScore || 70,
        autoOrderThreshold: settings.autopilot?.autoOrderThreshold || 5,
        monitorUrls: settings.autopilot?.monitorUrls || [],
        budgetLimit: settings.autopilot?.budgetLimit || 5000,
        supplierPriority: settings.autopilot?.supplierPriority || ['amazon', 'aliexpress']
      }
    } catch (error) {
      console.error(`Failed to get autopilot config for tenant ${tenantId}:`, error)
      // Return default config
      return {
        enabled: false,
        maxDailyOrders: 10,
        maxOrderValue: 1000,
        minAIScore: 70,
        autoOrderThreshold: 5,
        monitorUrls: [],
        budgetLimit: 5000,
        supplierPriority: ['amazon', 'aliexpress']
      }
    }
  }

  private async getDailyStats(tenantId: string): Promise<{ ordersCount: number; totalSpent: number }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const stmt = this.env.D1_DB.prepare(`
        SELECT 
          COUNT(*) as orders_count,
          COALESCE(SUM(total_amount), 0) as total_spent
        FROM orders 
        WHERE tenant_id = ? 
          AND auto_created = 1 
          AND created_at >= ?
      `)
      
      const result = await stmt.bind(tenantId, today.toISOString()).first()
      
      return {
        ordersCount: result?.orders_count as number || 0,
        totalSpent: result?.total_spent as number || 0
      }
    } catch (error) {
      console.error('Failed to get daily stats:', error)
      return { ordersCount: 0, totalSpent: 0 }
    }
  }

  private async executeRule(rule: AutomationRule, config: AutopilotConfig): Promise<void> {
    const conditions = JSON.parse(rule.conditions)
    const actions = JSON.parse(rule.actions)

    // Buscar produtos que atendem às condições
    const matchingProducts = await this.findProductsMatchingConditions(rule.tenantId, conditions)

    for (const product of matchingProducts) {
      // Executar ações configuradas
      if (actions.createOrder && this.shouldCreateOrder(product, conditions, config)) {
        await this.createAutomatedOrder(product, actions.createOrder, config)
      }

      if (actions.alert) {
        await this.sendAlert(product, actions.alert, rule)
      }

      if (actions.updatePrice) {
        await this.updateProductPrice(product, actions.updatePrice)
      }
    }

    // Atualizar estatísticas da regra
    await this.updateRuleStats(rule.id)
  }

  private calculateOptimalOrderQuantity(product: any, config: AutopilotConfig): number {
    const aiScore = product.ai_score || 0
    const currentStock = product.stock_quantity || 0
    const threshold = product.auto_order_threshold || config.autoOrderThreshold

    if (currentStock > threshold || aiScore < config.minAIScore) {
      return 0
    }

    // Calcular quantidade baseada no score IA e histórico
    const baseQuantity = Math.max(10, threshold * 2)
    const scoreMultiplier = aiScore / 100
    
    return Math.round(baseQuantity * scoreMultiplier)
  }

  private shouldCreateOrder(product: any, conditions: any, config: AutopilotConfig): boolean {
    const aiScore = product.ai_score || 0
    const stock = product.stock_quantity || 0
    const price = product.price || 0

    return (
      aiScore >= (conditions.aiScore?.min || config.minAIScore) &&
      stock <= (conditions.stock?.max || config.autoOrderThreshold) &&
      price <= config.maxOrderValue
    )
  }

  // Métodos de banco de dados (simplificados)
  private async getTenant(tenantId: string): Promise<any> {
    const stmt = this.env.D1_DB.prepare('SELECT * FROM tenants WHERE id = ?')
    return await stmt.bind(tenantId).first()
  }

  private async getProductByUrl(tenantId: string, url: string): Promise<any> {
    const stmt = this.env.D1_DB.prepare('SELECT * FROM products WHERE tenant_id = ? AND source_url = ?')
    return await stmt.bind(tenantId, url).first()
  }

  private async getProductsNeedingAnalysis(tenantId: string): Promise<any[]> {
    const stmt = this.env.D1_DB.prepare(`
      SELECT * FROM products 
      WHERE tenant_id = ? 
        AND (ai_score IS NULL OR last_scraped_at < datetime('now', '-1 hour'))
      LIMIT 10
    `)
    const result = await stmt.bind(tenantId).all()
    return result.results
  }

  private async getEnabledAutomationRules(tenantId: string): Promise<AutomationRule[]> {
    const stmt = this.env.D1_DB.prepare('SELECT * FROM automation_rules WHERE tenant_id = ? AND enabled = 1')
    const result = await stmt.bind(tenantId).all()
    return result.results as AutomationRule[]
  }

  private async logAutopilotError(tenantId: string, error: Error): Promise<void> {
    const stmt = this.env.D1_DB.prepare(`
      INSERT INTO system_logs (id, tenant_id, level, category, message, details, created_at)
      VALUES (?, ?, 'error', 'autopilot', ?, ?, datetime('now'))
    `)
    
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    await stmt.bind(
      logId,
      tenantId,
      error.message,
      JSON.stringify({ stack: error.stack })
    ).run()
  }

  // Métodos auxiliares adicionais (implementação simplificada)
  private async updateProductData(productId: string, data: any): Promise<void> { /* TODO */ }
  private async getProductsNeedingOrders(tenantId: string, config: AutopilotConfig): Promise<any[]> { return [] }
  private async getActiveSuppliers(tenantId: string): Promise<any[]> { return [] }
  private async updateSupplierSyncStatus(supplierId: string, status: string): Promise<void> { /* TODO */ }
  private async findProductsMatchingConditions(tenantId: string, conditions: any): Promise<any[]> { return [] }
  private async createAutomatedOrder(product: any, orderConfig: any, config: AutopilotConfig): Promise<void> { /* TODO */ }
  private async sendAlert(product: any, alertConfig: any, rule: AutomationRule): Promise<void> { /* TODO */ }
  private async updateProductPrice(product: any, priceConfig: any): Promise<void> { /* TODO */ }
  private async updateRuleStats(ruleId: string): Promise<void> { /* TODO */ }
}