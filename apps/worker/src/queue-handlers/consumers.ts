import { QueueProcessor } from './index'
import type { Env } from '../types/env'

// Consumer para SCRAPE_QUEUE
export default {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    const processor = new QueueProcessor(env)
    
    for (const message of batch.messages) {
      try {
        const queueMessage = message.body
        
        console.log(`Processing message from queue:`, {
          id: queueMessage.id,
          type: queueMessage.type,
          attempts: queueMessage.attempts
        })

        // Processar mensagem baseada no tipo
        await processor.processQueueMessage('SCRAPE_QUEUE', queueMessage)
        
        // Marcar como processada
        message.ack()
        
      } catch (error) {
        console.error('Failed to process queue message:', error)
        
        // Retry logic
        const queueMessage = message.body
        if (queueMessage.attempts < queueMessage.maxAttempts) {
          queueMessage.attempts++
          
          // Re-queue com delay exponencial
          const delay = Math.pow(2, queueMessage.attempts) * 1000
          setTimeout(() => {
            message.retry()
          }, delay)
          
          console.log(`Retrying message ${queueMessage.id}, attempt ${queueMessage.attempts}`)
        } else {
          console.error(`Max retries exceeded for message ${queueMessage.id}`)
          message.ack() // Remove da fila para evitar loop infinito
        }
      }
    }
  }
}

// AI Score Queue Consumer
export const aiQueueConsumer = {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    const processor = new QueueProcessor(env)
    
    for (const message of batch.messages) {
      try {
        const queueMessage = message.body
        await processor.processQueueMessage('AI_SCORE_QUEUE', queueMessage)
        message.ack()
      } catch (error) {
        console.error('AI queue processing failed:', error)
        const queueMessage = message.body
        if (queueMessage.attempts < queueMessage.maxAttempts) {
          queueMessage.attempts++
          message.retry()
        } else {
          message.ack()
        }
      }
    }
  }
}

// Order Queue Consumer
export const orderQueueConsumer = {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    const processor = new QueueProcessor(env)
    
    for (const message of batch.messages) {
      try {
        const queueMessage = message.body
        await processor.processQueueMessage('ORDER_QUEUE', queueMessage)
        message.ack()
      } catch (error) {
        console.error('Order queue processing failed:', error)
        const queueMessage = message.body
        if (queueMessage.attempts < queueMessage.maxAttempts) {
          queueMessage.attempts++
          message.retry()
        } else {
          message.ack()
        }
      }
    }
  }
}

// Types para MessageBatch (se não existir)
interface MessageBatch<T> {
  messages: Array<{
    body: T
    ack(): void
    retry(): void
  }>
}