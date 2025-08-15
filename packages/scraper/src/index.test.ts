import { describe, it, expect } from 'vitest'
import { ProductScraper } from './index'

describe('ProductScraper', () => {
  const scraper = new ProductScraper()

  it('should scrape a product from URL', async () => {
    const product = await scraper.scrapeProduct('https://example.com/product')
    
    expect(product.url).toBe('https://example.com/product')
    expect(product.title).toContain('example.com')
    expect(product.price).toBeGreaterThan(0)
    expect(product.images).toHaveLength(2)
    expect(product.availability).toBe(true)
  })

  it('should scrape multiple products', async () => {
    const urls = [
      'https://example1.com/product',
      'https://example2.com/product'
    ]
    
    const products = await scraper.scrapeMultiple(urls)
    expect(products).toHaveLength(2)
  })
})