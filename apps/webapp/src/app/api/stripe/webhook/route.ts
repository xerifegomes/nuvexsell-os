import { NextRequest, NextResponse } from 'next/server'

// Proxy para Worker API
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    // Encaminha para Worker API
    const workerResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORKER_URL}/api/v1/stripe/webhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': signature || ''
        },
        body
      }
    )

    const data = await workerResponse.json()
    
    return NextResponse.json(data, { 
      status: workerResponse.status 
    })
    
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}