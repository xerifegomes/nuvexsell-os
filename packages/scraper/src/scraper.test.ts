import { describe, it, expect, beforeEach } from 'vitest'
import { ProductScraper } from './index'
import type { ProductRaw } from '@nuvexsell/core'

describe('ProductScraper', () => {
  let scraper: ProductScraper

  beforeEach(() => {
    scraper = new ProductScraper()
  })

  describe('scrapeProduct', () => {
    it('should scrape product from valid URL', async () => {
      const url = 'https://example-store.com/product/123'
      const result = await scraper.scrapeProduct(url)
      
      expect(result).toBeDefined()
      expect(result.url).toBe(url)
      expect(result.name).toMatch(/Product \d+/)
      expect(result.price).toBeGreaterThan(0)
      expect(result.description).toBeTruthy()
      expect(result.images).toBeInstanceOf(Array)
      expect(result.images.length).toBeGreaterThan(0)
    })

    it('should handle Amazon URLs', async () => {
      const url = 'https://amazon.com/dp/B001234567'
      const result = await scraper.scrapeProduct(url)
      
      expect(result.source).toBe('amazon')
      expect(result.asin).toBeTruthy()
    })

    it('should handle AliExpress URLs', async () => {
      const url = 'https://aliexpress.com/item/1005001234567.html'
      const result = await scraper.scrapeProduct(url)
      
      expect(result.source).toBe('aliexpress')
      expect(result.sku).toBeTruthy()
    })

    it('should throw error for invalid URL', async () => {
      const url = 'not-a-url'
      
      await expect(scraper.scrapeProduct(url)).rejects.toThrow('URL inválida')
    })

    it('should throw error for unsupported domain', async () => {
      const url = 'https://unsupported-site.com/product/123'
      
      await expect(scraper.scrapeProduct(url)).rejects.toThrow('Domínio não suportado')
    })

    it('should handle rate limiting', async () => {
      // Simular múltiplas requisições rápidas
      const urls = Array(10).fill(0).map((_, i) => 
        `https://example-store.com/product/${i}`
      )
      
      const promises = urls.map(url => scraper.scrapeProduct(url))
      const results = await Promise.allSettled(promises)
      
      // Pelo menos algumas devem ser limitadas
      const rejected = results.filter(r => r.status === 'rejected')
      expect(rejected.length).toBeGreaterThan(0)
    })
  })

  describe('extractProductInfo', () => {
    it('should extract basic product info', () => {
      const html = `
        <html>
          <head><title>Test Product</title></head>
          <body>
            <h1>Test Product</h1>
            <span class="price">$29.99</span>
            <div class="description">Great product</div>
            <img src="/image1.jpg" />
            <img src="/image2.jpg" />
          </body>
        </html>
      `
      
      const result = scraper['extractProductInfo'](html, 'https://test.com')
      
      expect(result.name).toBe('Test Product')
      expect(result.price).toBe(29.99)
      expect(result.description).toBe('Great product')
      expect(result.images).toHaveLength(2)
    })
  })

  describe('detectSource', () => {
    it('should detect Amazon', () => {
      expect(scraper['detectSource']('https://amazon.com')).toBe('amazon')
      expect(scraper['detectSource']('https://amazon.co.uk')).toBe('amazon')
    })

    it('should detect AliExpress', () => {
      expect(scraper['detectSource']('https://aliexpress.com')).toBe('aliexpress')
      expect(scraper['detectSource']('https://pt.aliexpress.com')).toBe('aliexpress')
    })

    it('should detect eBay', () => {
      expect(scraper['detectSource']('https://ebay.com')).toBe('ebay')
      expect(scraper['detectSource']('https://ebay.co.uk')).toBe('ebay')
    })

    it('should return unknown for unsupported sites', () => {
      expect(scraper['detectSource']('https://example.com')).toBe('unknown')
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(scraper['isValidUrl']('https://example.com')).toBe(true)
      expect(scraper['isValidUrl']('http://example.com')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(scraper['isValidUrl']('not-a-url')).toBe(false)
      expect(scraper['isValidUrl']('')).toBe(false)
      expect(scraper['isValidUrl']('ftp://example.com')).toBe(false)
    })
  })

  describe('delay', () => {
    it('should delay execution', async () => {
      const start = Date.now()
      await scraper['delay'](100)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(95) // Allow some tolerance
    })
  })
})