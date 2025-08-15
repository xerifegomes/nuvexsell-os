import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from '../../types/env'
import { AutopilotEngine } from '../../autopilot/engine'
import { authMiddleware } from '../../middleware/auth'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://nuvexsell-os.xerifegomes.workers.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Middleware de autenticação para todas as rotas
app.use('*', authMiddleware)

/**
 * GET /v1/autopilot/status
 * Retorna status do autopilot para o tenant
 */
app.get('/status', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    
    const stmt = c.env.D1_DB.prepare(`
      SELECT 
        t.settings,
        COUNT(ar.id) as active_rules,
        COUNT(CASE WHEN o.auto_created = 1 AND date(o.created_at) = date('now') THEN 1 END) as daily_orders,
        COALESCE(SUM(CASE WHEN o.auto_created = 1 AND date(o.created_at) = date('now') THEN o.total_amount END), 0) as daily_spent
      FROM tenants t
      LEFT JOIN automation_rules ar ON ar.tenant_id = t.id AND ar.enabled = 1
      LEFT JOIN orders o ON o.tenant_id = t.id
      WHERE t.id = ?
      GROUP BY t.id
    `)
    
    const result = await stmt.bind(tenantId).first()
    
    if (!result) {
      return c.json({ error: 'Tenant not found' }, 404)
    }
    
    const settings = JSON.parse(result.settings as string || '{}')
    const autopilotConfig = settings.autopilot || {}
    
    return c.json({
      enabled: autopilotConfig.enabled || false,
      config: autopilotConfig,
      stats: {
        activeRules: result.active_rules,
        dailyOrders: result.daily_orders,
        dailySpent: result.daily_spent,
        lastRun: autopilotConfig.lastRun
      }
    })
    
  } catch (error) {
    console.error('Failed to get autopilot status:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /v1/autopilot/config
 * Atualiza configuração do autopilot
 */
app.post('/config', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const config = await c.req.json()
    
    // Validar configuração
    if (typeof config.enabled !== 'boolean') {
      return c.json({ error: 'enabled must be boolean' }, 400)
    }
    
    if (config.maxDailyOrders && (typeof config.maxDailyOrders !== 'number' || config.maxDailyOrders < 1)) {
      return c.json({ error: 'maxDailyOrders must be positive number' }, 400)
    }
    
    if (config.budgetLimit && (typeof config.budgetLimit !== 'number' || config.budgetLimit < 0)) {
      return c.json({ error: 'budgetLimit must be non-negative number' }, 400)
    }
    
    // Buscar configurações atuais
    const stmt = c.env.D1_DB.prepare('SELECT settings FROM tenants WHERE id = ?')
    const tenant = await stmt.bind(tenantId).first()
    
    if (!tenant) {
      return c.json({ error: 'Tenant not found' }, 404)
    }
    
    const currentSettings = JSON.parse(tenant.settings as string || '{}')
    
    // Atualizar configuração do autopilot
    currentSettings.autopilot = {
      ...currentSettings.autopilot,
      ...config,
      updatedAt: new Date().toISOString()
    }
    
    // Salvar no banco
    const updateStmt = c.env.D1_DB.prepare(`
      UPDATE tenants 
      SET settings = ?, updated_at = datetime('now') 
      WHERE id = ?
    `)
    
    await updateStmt.bind(JSON.stringify(currentSettings), tenantId).run()
    
    return c.json({ 
      success: true, 
      config: currentSettings.autopilot 
    })
    
  } catch (error) {
    console.error('Failed to update autopilot config:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /v1/autopilot/run
 * Executa o autopilot manualmente
 */
app.post('/run', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    
    const autopilot = new AutopilotEngine(c.env)
    
    // Executar autopilot em background
    c.executionCtx.waitUntil(autopilot.runAutopilot(tenantId))
    
    return c.json({ 
      success: true, 
      message: 'Autopilot execution started',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Failed to run autopilot:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /v1/autopilot/logs
 * Retorna logs do autopilot
 */
app.get('/logs', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const stmt = c.env.D1_DB.prepare(`
      SELECT id, level, message, details, created_at
      FROM system_logs 
      WHERE tenant_id = ? AND category = 'autopilot'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    
    const result = await stmt.bind(tenantId, limit, offset).all()
    
    const logs = result.results.map(log => ({
      id: log.id,
      level: log.level,
      message: log.message,
      details: log.details ? JSON.parse(log.details as string) : null,
      createdAt: log.created_at
    }))
    
    return c.json({ logs })
    
  } catch (error) {
    console.error('Failed to get autopilot logs:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /v1/autopilot/rules
 * Lista regras de automação
 */
app.get('/rules', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    
    const stmt = c.env.D1_DB.prepare(`
      SELECT id, name, type, conditions, actions, enabled, priority,
             executions_count, success_count, last_executed_at,
             created_at, updated_at
      FROM automation_rules 
      WHERE tenant_id = ?
      ORDER BY priority ASC, created_at DESC
    `)
    
    const result = await stmt.bind(tenantId).all()
    
    const rules = result.results.map(rule => ({
      id: rule.id,
      name: rule.name,
      type: rule.type,
      conditions: JSON.parse(rule.conditions as string),
      actions: JSON.parse(rule.actions as string),
      enabled: Boolean(rule.enabled),
      priority: rule.priority,
      stats: {
        executions: rule.executions_count,
        successes: rule.success_count,
        lastExecuted: rule.last_executed_at
      },
      createdAt: rule.created_at,
      updatedAt: rule.updated_at
    }))
    
    return c.json({ rules })
    
  } catch (error) {
    console.error('Failed to get automation rules:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /v1/autopilot/rules
 * Cria nova regra de automação
 */
app.post('/rules', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const ruleData = await c.req.json()
    
    // Validação básica
    if (!ruleData.name || !ruleData.type || !ruleData.conditions || !ruleData.actions) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    
    const stmt = c.env.D1_DB.prepare(`
      INSERT INTO automation_rules (
        id, tenant_id, name, type, conditions, actions, enabled, priority,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    
    await stmt.bind(
      ruleId,
      tenantId,
      ruleData.name,
      ruleData.type,
      JSON.stringify(ruleData.conditions),
      JSON.stringify(ruleData.actions),
      ruleData.enabled ? 1 : 0,
      ruleData.priority || 1
    ).run()
    
    return c.json({ 
      success: true, 
      ruleId,
      message: 'Automation rule created successfully'
    })
    
  } catch (error) {
    console.error('Failed to create automation rule:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * Scheduled event handler para executar autopilot automaticamente
 */
export async function runScheduledAutopilot(env: Env): Promise<void> {
  console.log('🕐 Running scheduled autopilot...')
  
  try {
    // Buscar todos os tenants com autopilot habilitado
    const stmt = env.D1_DB.prepare(`
      SELECT id, settings 
      FROM tenants 
      WHERE status = 'active'
    `)
    
    const result = await stmt.all()
    const autopilot = new AutopilotEngine(env)
    
    for (const tenant of result.results) {
      try {
        const settings = JSON.parse(tenant.settings as string || '{}')
        
        if (settings.autopilot?.enabled) {
          console.log(`Running autopilot for tenant: ${tenant.id}`)
          await autopilot.runAutopilot(tenant.id as string)
        }
      } catch (error) {
        console.error(`Failed to run autopilot for tenant ${tenant.id}:`, error)
      }
    }
    
    console.log('✅ Scheduled autopilot completed')
    
  } catch (error) {
    console.error('❌ Scheduled autopilot failed:', error)
  }
}

export default app