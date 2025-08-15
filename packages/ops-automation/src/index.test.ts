import { describe, it, expect } from 'vitest'
import { OrderAutomation, StockManager } from './index'
import type { Order } from '@nuvexsell/core'

describe('OrderAutomation', () => {
  const automation = new OrderAutomation()

  const mockOrder: Order = {
    id: 'order-1',
    tenantId: 'tenant-1',
    status: 'CREATED',
    items: [
      { productId: 'product-1', quantity: 2, price: 29.99 },
      { productId: 'product-2', quantity: 1, price: 49.99 }
    ],
    destination: {
      street: '123 Main St',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'BR'
    },
    totalAmount: 109.97,
    currency: 'BRL',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  it('should process order successfully', async () => {
    const processed = await automation.processOrder(mockOrder)
    
    expect(processed.status).toBe('ROUTED')
    expect(processed.supplierId).toBeDefined()
    expect(processed.trackingCode).toBeDefined()
  })
})

describe('StockManager', () => {
  const stockManager = new StockManager()

  it('should sync stock from supplier', async () => {
    const stock = await stockManager.syncStock('supplier-1')
    
    expect(stock).toHaveLength(2)
    expect(stock[0].supplierId).toBe('supplier-1')
  })

  it('should reserve stock successfully', async () => {
    const reserved = await stockManager.reserveStock('product-1', 5)
    expect(typeof reserved).toBe('boolean')
  })
})