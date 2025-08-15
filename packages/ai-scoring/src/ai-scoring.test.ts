import { describe, it, expect, beforeEach } from 'vitest'
import { AIScoring } from './index'
import type { Product, ProductAnalysis } from '@nuvexsell/core'

describe('AIScoring', () => {
  let aiScoring: AIScoring

  beforeEach(() => {
    aiScoring = new AIScoring()
  })

  describe('analyzeProduct', () => {
    const mockProduct: Product = {
      id: 'test-id',
      url: 'https://test.com/product/123',
      name: 'Test Product',
      price: 29.99,
      originalPrice: 39.99,
      description: 'Great product for testing',
      images: ['https://test.com/image1.jpg'],
      source: 'test',
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should analyze product and return analysis', async () => {
      const result = await aiScoring.analyzeProduct(mockProduct)
      
      expect(result).toBeDefined()
      expect(result.productId).toBe(mockProduct.id)
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
      
      expect(result.priceAnalysis).toBeDefined()
      expect(result.priceAnalysis.score).toBeGreaterThanOrEqual(0)
      expect(result.priceAnalysis.score).toBeLessThanOrEqual(100)
      
      expect(result.demandAnalysis).toBeDefined()
      expect(result.demandAnalysis.score).toBeGreaterThanOrEqual(0)
      expect(result.demandAnalysis.score).toBeLessThanOrEqual(100)
      
      expect(result.sentimentAnalysis).toBeDefined()
      expect(result.sentimentAnalysis.score).toBeGreaterThanOrEqual(0)
      expect(result.sentimentAnalysis.score).toBeLessThanOrEqual(100)
    })

    it('should handle high-priced products', async () => {
      const expensiveProduct = { ...mockProduct, price: 999.99 }
      const result = await aiScoring.analyzeProduct(expensiveProduct)
      
      expect(result.priceAnalysis.risk).toBe('high')
    })

    it('should handle low-priced products', async () => {
      const cheapProduct = { ...mockProduct, price: 9.99 }
      const result = await aiScoring.analyzeProduct(cheapProduct)
      
      expect(result.priceAnalysis.risk).toBe('low')
    })
  })

  describe('calculatePriceScore', () => {
    it('should calculate price score correctly', () => {
      const product: Product = {
        id: 'test',
        url: 'test',
        name: 'test',
        price: 29.99,
        originalPrice: 59.99,
        description: 'test',
        images: [],
        source: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = aiScoring['calculatePriceScore'](product)
      
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should return lower score for overpriced products', () => {
      const product: Product = {
        id: 'test',
        url: 'test',
        name: 'test',
        price: 999.99,
        originalPrice: 999.99,
        description: 'test',
        images: [],
        source: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = aiScoring['calculatePriceScore'](product)
      
      expect(score).toBeLessThan(50)
    })
  })

  describe('calculateDemandScore', () => {
    it('should calculate demand score based on category', () => {
      const product: Product = {
        id: 'test',
        url: 'test',
        name: 'test',
        price: 29.99,
        description: 'test',
        images: [],
        source: 'test',
        category: 'electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = aiScoring['calculateDemandScore'](product)
      
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should return higher score for trending categories', () => {
      const electronicProduct: Product = {
        id: 'test',
        url: 'test',
        name: 'smartphone',
        price: 299.99,
        description: 'latest smartphone',
        images: [],
        source: 'test',
        category: 'electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = aiScoring['calculateDemandScore'](electronicProduct)
      
      expect(score).toBeGreaterThan(70)
    })
  })

  describe('analyzeSentiment', () => {
    it('should analyze positive sentiment', async () => {
      const product: Product = {
        id: 'test',
        url: 'test',
        name: 'Amazing Product',
        price: 29.99,
        description: 'This is an amazing, fantastic, excellent product that everyone loves!',
        images: [],
        source: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = await aiScoring['analyzeSentiment'](product)
      
      expect(score).toBeGreaterThan(70)
    })

    it('should analyze negative sentiment', async () => {
      const product: Product = {
        id: 'test',
        url: 'test',
        name: 'Terrible Product',
        price: 29.99,
        description: 'This is a terrible, awful, horrible product that nobody likes!',
        images: [],
        source: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = await aiScoring['analyzeSentiment'](product)
      
      expect(score).toBeLessThan(50)
    })

    it('should handle neutral sentiment', async () => {
      const product: Product = {
        id: 'test',
        url: 'test',
        name: 'Regular Product',
        price: 29.99,
        description: 'This is a product.',
        images: [],
        source: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const score = await aiScoring['analyzeSentiment'](product)
      
      expect(score).toBeGreaterThanOrEqual(40)
      expect(score).toBeLessThanOrEqual(70)
    })
  })

  describe('getRecommendation', () => {
    it('should recommend BUY for high scores', () => {
      const recommendation = aiScoring['getRecommendation'](85)
      expect(recommendation).toBe('buy')
    })

    it('should recommend HOLD for medium scores', () => {
      const recommendation = aiScoring['getRecommendation'](65)
      expect(recommendation).toBe('hold')
    })

    it('should recommend AVOID for low scores', () => {
      const recommendation = aiScoring['getRecommendation'](35)
      expect(recommendation).toBe('avoid')
    })
  })

  describe('getRiskLevel', () => {
    it('should return low risk for high scores', () => {
      const risk = aiScoring['getRiskLevel'](85)
      expect(risk).toBe('low')
    })

    it('should return medium risk for medium scores', () => {
      const risk = aiScoring['getRiskLevel'](65)
      expect(risk).toBe('medium')
    })

    it('should return high risk for low scores', () => {
      const risk = aiScoring['getRiskLevel'](35)
      expect(risk).toBe('high')
    })
  })

  describe('batchAnalyze', () => {
    it('should analyze multiple products', async () => {
      const products: Product[] = [
        {
          id: 'test-1',
          url: 'https://test.com/1',
          name: 'Product 1',
          price: 29.99,
          description: 'Great product',
          images: [],
          source: 'test',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-2',
          url: 'https://test.com/2',
          name: 'Product 2',
          price: 49.99,
          description: 'Another great product',
          images: [],
          source: 'test',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const results = await aiScoring.batchAnalyze(products)
      
      expect(results).toHaveLength(2)
      expect(results[0].productId).toBe('test-1')
      expect(results[1].productId).toBe('test-2')
    })
  })
})