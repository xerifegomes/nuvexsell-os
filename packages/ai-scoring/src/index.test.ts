import { describe, it, expect } from 'vitest'
import { AIScoring } from './index'
import type { Product } from '@nuvexsell/core'

describe('AIScoring', () => {
  const aiScoring = new AIScoring()

  const mockProduct: Product = {
    id: 'test-product-1',
    tenantId: 'tenant-1',
    title: 'Smartphone XYZ',
    description: 'Smartphone com ótima qualidade',
    price: 299.99,
    currency: 'USD',
    images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    availability: true,
    brand: 'TechBrand',
    category: 'Electronics',
    sourceUrl: 'https://example.com/product',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  it('should analyze product and return scores', async () => {
    const analysis = await aiScoring.analyzeProduct(mockProduct)
    
    expect(analysis.productId).toBe(mockProduct.id)
    expect(analysis.priceScore).toBeGreaterThan(0)
    expect(analysis.demandScore).toBeGreaterThan(0)
    expect(analysis.sentimentScore).toBeGreaterThan(0)
    expect(analysis.recommendation).toMatch(/high|medium|low/)
    expect(analysis.confidence).toBeGreaterThan(0)
  })

  it('should extract product features', async () => {
    const analysis = await aiScoring.analyzeProduct(mockProduct)
    
    expect(analysis.features).toContain('Marca: TechBrand')
    expect(analysis.features).toContain('Categoria: Electronics')
  })
})