import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderAutomation, StockManager, ReportsGenerator } from './index'
import type { Order, OrderItem, StockItem } from '@nuvexsell/core'

describe('OrderAutomation', () => {
  let orderAutomation: OrderAutomation

  beforeEach(() => {
    orderAutomation = new OrderAutomation()
  })

  describe('processOrder', () => {
    const mockOrder: Order = {
      id: 'order-123',
      customerId: 'customer-456',
      items: [
        {
          id: 'item-1',
          productId: 'product-789',
          quantity: 2,
          price: 29.99,
          name: 'Test Product'
        }
      ],
      total: 59.98,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should process order successfully', async () => {
      const result = await orderAutomation.processOrder(mockOrder)
      
      expect(result.success).toBe(true)
      expect(result.orderId).toBe(mockOrder.id)
      expect(result.status).toBe('processed')
    })

    it('should handle order with multiple items', async () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          ...mockOrder.items,
          {
            id: 'item-2',
            productId: 'product-890',
            quantity: 1,
            price: 19.99,
            name: 'Another Product'
          }
        ],
        total: 79.97
      }

      const result = await orderAutomation.processOrder(multiItemOrder)
      
      expect(result.success).toBe(true)
      expect(result.itemsProcessed).toBe(2)
    })

    it('should handle insufficient stock', async () => {
      // Mock product with no stock
      const outOfStockOrder = {
        ...mockOrder,
        items: [{
          ...mockOrder.items[0],
          quantity: 1000 // Unrealistic quantity
        }]
      }

      const result = await orderAutomation.processOrder(outOfStockOrder)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('estoque insuficiente')
    })
  })

  describe('validateOrder', () => {
    it('should validate correct order', () => {
      const order = {
        id: 'order-123',
        customerId: 'customer-456',
        items: [
          {
            id: 'item-1',
            productId: 'product-789',
            quantity: 2,
            price: 29.99,
            name: 'Test Product'
          }
        ],
        total: 59.98,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(() => orderAutomation['validateOrder'](order)).not.toThrow()
    })

    it('should reject order with negative quantity', () => {
      const invalidOrder = {
        id: 'order-123',
        customerId: 'customer-456',
        items: [
          {
            id: 'item-1',
            productId: 'product-789',
            quantity: -1,
            price: 29.99,
            name: 'Test Product'
          }
        ],
        total: 59.98,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(() => orderAutomation['validateOrder'](invalidOrder))
        .toThrow('Quantidade inválida')
    })
  })

  describe('calculateShipping', () => {
    it('should calculate shipping cost', () => {
      const cost = orderAutomation['calculateShipping'](59.98, 'SP')
      
      expect(cost).toBeGreaterThan(0)
      expect(typeof cost).toBe('number')
    })

    it('should apply free shipping for high value orders', () => {
      const cost = orderAutomation['calculateShipping'](200, 'SP')
      
      expect(cost).toBe(0)
    })
  })

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const result = await orderAutomation['sendNotification'](
        'customer-123',
        'order_confirmed',
        { orderId: 'order-456' }
      )
      
      expect(result.sent).toBe(true)
    })
  })
})

describe('StockManager', () => {
  let stockManager: StockManager

  beforeEach(() => {
    stockManager = new StockManager()
  })

  describe('checkAvailability', () => {
    it('should check product availability', async () => {
      const availability = await stockManager.checkAvailability('product-123', 5)
      
      expect(typeof availability.available).toBe('boolean')
      expect(typeof availability.quantity).toBe('number')
      expect(availability.quantity).toBeGreaterThanOrEqual(0)
    })

    it('should handle out of stock products', async () => {
      const availability = await stockManager.checkAvailability('out-of-stock', 1)
      
      expect(availability.available).toBe(false)
      expect(availability.quantity).toBe(0)
    })
  })

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const result = await stockManager.updateStock('product-123', 10)
      
      expect(result.success).toBe(true)
      expect(result.newQuantity).toBe(10)
    })

    it('should handle negative stock updates', async () => {
      const result = await stockManager.updateStock('product-123', -5)
      
      expect(result.success).toBe(true)
      expect(typeof result.newQuantity).toBe('number')
    })
  })

  describe('getLowStockProducts', () => {
    it('should return low stock products', async () => {
      const lowStock = await stockManager.getLowStockProducts(10)
      
      expect(Array.isArray(lowStock)).toBe(true)
      lowStock.forEach(item => {
        expect(item.quantity).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('reserveStock', () => {
    it('should reserve stock for order', async () => {
      const items = [
        { productId: 'product-123', quantity: 2 },
        { productId: 'product-456', quantity: 1 }
      ]

      const result = await stockManager.reserveStock('order-789', items)
      
      expect(result.success).toBe(true)
      expect(result.reservationId).toBeTruthy()
    })
  })

  describe('releaseReservation', () => {
    it('should release stock reservation', async () => {
      const result = await stockManager.releaseReservation('reservation-123')
      
      expect(result.success).toBe(true)
    })
  })
})

describe('ReportsGenerator', () => {
  let reportsGenerator: ReportsGenerator

  beforeEach(() => {
    reportsGenerator = new ReportsGenerator()
  })

  describe('generateSalesReport', () => {
    it('should generate sales report for date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      const report = await reportsGenerator.generateSalesReport(startDate, endDate)
      
      expect(report.period.startDate).toEqual(startDate)
      expect(report.period.endDate).toEqual(endDate)
      expect(typeof report.totalSales).toBe('number')
      expect(typeof report.totalOrders).toBe('number')
      expect(Array.isArray(report.topProducts)).toBe(true)
    })
  })

  describe('generateInventoryReport', () => {
    it('should generate inventory report', async () => {
      const report = await reportsGenerator.generateInventoryReport()
      
      expect(typeof report.totalProducts).toBe('number')
      expect(typeof report.totalValue).toBe('number')
      expect(Array.isArray(report.lowStockItems)).toBe(true)
      expect(Array.isArray(report.categories)).toBe(true)
    })
  })

  describe('generateCustomerReport', () => {
    it('should generate customer report', async () => {
      const report = await reportsGenerator.generateCustomerReport()
      
      expect(typeof report.totalCustomers).toBe('number')
      expect(typeof report.newCustomers).toBe('number')
      expect(typeof report.avgOrderValue).toBe('number')
      expect(Array.isArray(report.topCustomers)).toBe(true)
    })
  })

  describe('exportReport', () => {
    it('should export report to JSON', async () => {
      const mockReport = {
        title: 'Test Report',
        data: { test: 'value' },
        generatedAt: new Date()
      }

      const result = await reportsGenerator.exportReport(mockReport, 'json')
      
      expect(result.success).toBe(true)
      expect(result.format).toBe('json')
      expect(result.url).toBeTruthy()
    })

    it('should export report to CSV', async () => {
      const mockReport = {
        title: 'Test Report',
        data: [
          { name: 'Product A', sales: 100 },
          { name: 'Product B', sales: 200 }
        ],
        generatedAt: new Date()
      }

      const result = await reportsGenerator.exportReport(mockReport, 'csv')
      
      expect(result.success).toBe(true)
      expect(result.format).toBe('csv')
      expect(result.url).toBeTruthy()
    })
  })

  describe('scheduleReport', () => {
    it('should schedule automated report', async () => {
      const result = await reportsGenerator.scheduleReport(
        'sales',
        'weekly',
        'manager@company.com'
      )
      
      expect(result.success).toBe(true)
      expect(result.scheduleId).toBeTruthy()
    })
  })
})