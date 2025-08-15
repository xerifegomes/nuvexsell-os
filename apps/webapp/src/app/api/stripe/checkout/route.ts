import { NextRequest, NextResponse } from 'next/server'

// Proxy para Worker API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Encaminha para Worker API
    const workerResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORKER_URL}/api/v1/stripe/checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || ''
        },
        body: JSON.stringify(body)
      }
    )

    const data = await workerResponse.json()
    
    return NextResponse.json(data, { 
      status: workerResponse.status 
    })
    
  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}