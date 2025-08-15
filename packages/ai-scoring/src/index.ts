import type { Product, ProductAnalysis, WorkerAIRequest, WorkerAIResponse } from '@nuvexsell/core'

export class AIScoring {
  constructor(private aiEndpoint: string = '') {}

  async analyzeProduct(product: Product): Promise<ProductAnalysis> {
    try {
      // Análise de preço baseada em categoria e dados históricos
      const priceScore = this.calculatePriceScore(product)
      
      // Análise de demanda baseada em disponibilidade e categoria
      const demandScore = this.calculateDemandScore(product)
      
      // Análise de sentimento usando Worker IA
      const sentimentScore = await this.analyzeSentiment(product)
      
      // Score final ponderado
      const finalScore = Math.round(
        priceScore * 0.3 + 
        demandScore * 0.4 + 
        sentimentScore * 0.3
      )

      return {
        productId: product.id,
        priceScore,
        demandScore,
        sentimentScore,
        features: this.extractFeatures(product),
        pros: ['Boa relação preço/qualidade', 'Produto popular'],
        cons: ['Concorrência alta'],
        recommendation: finalScore >= 70 ? 'high' : finalScore >= 50 ? 'medium' : 'low',
        confidence: 0.85,
        analysis: `Produto com score ${finalScore}/100. ${this.getRecommendationText(finalScore)}`
      }
    } catch (error) {
      throw new Error(`Erro na análise IA: ${error}`)
    }
  }

  private calculatePriceScore(product: Product): number {
    // Lógica simplificada de análise de preço
    const price = product.price
    
    if (price < 20) return 90
    if (price < 50) return 80
    if (price < 100) return 70
    if (price < 200) return 60
    return 50
  }

  private calculateDemandScore(product: Product): number {
    // Análise de demanda baseada em fatores do produto
    let score = 50
    
    if (product.availability) score += 20
    if (product.category === 'Electronics') score += 15
    if (product.brand && product.brand !== 'Generic Brand') score += 10
    if (product.images.length >= 3) score += 5
    
    return Math.min(score, 100)
  }

  private async analyzeSentiment(product: Product): Promise<number> {
    try {
      // Simular análise de sentimento para desenvolvimento
      // Em produção, usaria Worker IA real
      const mockSentiment = Math.floor(Math.random() * 40) + 60 // 60-100
      
      return mockSentiment
    } catch (error) {
      console.warn('Fallback para análise de sentimento:', error)
      return 75 // Score médio como fallback
    }
  }

  private extractFeatures(product: Product): string[] {
    const features = []
    
    if (product.brand) features.push(`Marca: ${product.brand}`)
    if (product.category) features.push(`Categoria: ${product.category}`)
    features.push(`Preço: ${product.currency} ${product.price}`)
    features.push(`Imagens: ${product.images.length}`)
    
    return features
  }

  private getRecommendationText(score: number): string {
    if (score >= 80) return 'Produto altamente recomendado para dropshipping'
    if (score >= 60) return 'Produto com potencial médio'
    return 'Produto com baixo potencial, considere alternativas'
  }
}

export * from '@nuvexsell/core'
